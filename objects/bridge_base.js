BridgeBase.prototype.color = [0.8,0.8,0.8];
BridgeBase.prototype.steps = 50;

function BridgeBase() {
	// La superficie del puente en sí. Se creará llamando al método create_from_shape();
	this.surface = new Surface();
	
	// La curva que define el recorrido del puente (la altura). Determinada por la altura del terreno y la elevación máxima de la carretera.
	this.path = new CubicBSpline();
	
	// Conjunto de puntos y noramles que definen el polígono del perfil de la calle
	this.profile = {
		shape:null,
		shape_norm:null,
	};

	// Variables y funciones auxiliares para determinar el color y la terna del modo debug
	this.terna = null;
	this.color = BridgeBase.prototype.color;
	this.debug = null;
	
	this.set_color = function(color) {
		this.color = color;
	}
		
	this.set_debug = function(debug) {
		this.debug = debug;
	}
	
	this.push_point = function(buffer, point) {
		buffer.push(point[0]);
		buffer.push(point[1]);
		buffer.push(point[2]);
	}
	
	var ancho = params.puente_ancho;// Ancho del puente (de -ancho/2 a ancho/2)
	var semi_ancho = ancho/2;
	var ancho_cordon = 1; 			// Ancho de la sección elevada en los extremos
	var alto_calzada = 0.5; 		// Altura de la calzada (la altura del cordón es 2*alto_calzada)

	// Crea el perfil de la calle (en principio no sería parametrizable).
	// La escala es de 1 = 1metro. El centro de coordenadas está en la parte inferior central de la pieza.
	// La figura se define sobre el plano xy
	this.create_profile = function() {
		this.profile.shape = [];
		this.profile.shape_norm = [];
		
		
		// Genero las normales que son oblicuas, normalizadas
		var normal_incl_der = vec3.fromValues(-alto_calzada, ancho_cordon, 0.0);
		var normal_incl_izq = vec3.fromValues(alto_calzada, ancho_cordon, 0.0);
		vec3.normalize(normal_incl_der, normal_incl_der);
		vec3.normalize(normal_incl_izq, normal_incl_izq);
		
		// Del lado derecho (x > 0)
		this.profile.shape.push([ancho/2, 0.0, 0.0]);
		this.profile.shape_norm.push([1.0, 0.0, 0.0]);
		
		this.profile.shape.push([ancho/2, 2*alto_calzada, 0.0]);
		this.profile.shape_norm.push([1.0, 0.0, 0.0]);
		this.profile.shape.push([ancho/2, 2*alto_calzada, 0.0]);
		this.profile.shape_norm.push([0.0, 1.0, 0.0]);
				
		this.profile.shape.push([ancho/2 - ancho_cordon, 2*alto_calzada, 0.0]);
		this.profile.shape_norm.push([0.0, 1.0, 0.0]);
		this.profile.shape.push([ancho/2 - ancho_cordon, 2*alto_calzada, 0.0]);
		this.profile.shape_norm.push(normal_incl_der);
		
		this.profile.shape.push([ancho/2 - 2*ancho_cordon, alto_calzada, 0.0]);
		this.profile.shape_norm.push(normal_incl_der);
		this.profile.shape.push([ancho/2 - 2*ancho_cordon, alto_calzada, 0.0]);
		this.profile.shape_norm.push([0.0, 1.0, 0.0]);
		
		// Del lado izquierdo (x < 0)
		this.profile.shape.push([-ancho/2 + 2*ancho_cordon, alto_calzada, 0.0]);
		this.profile.shape_norm.push([0.0, 1.0, 0.0]);
		this.profile.shape.push([-ancho/2 + 2*ancho_cordon, alto_calzada, 0.0]);
		this.profile.shape_norm.push(normal_incl_izq);
		
		this.profile.shape.push([-ancho/2 + ancho_cordon, 2*alto_calzada, 0.0]);
		this.profile.shape_norm.push(normal_incl_izq);
		this.profile.shape.push([-ancho/2 + ancho_cordon, 2*alto_calzada, 0.0]);
		this.profile.shape_norm.push([0.0, 1.0, 0.0]);
		
		this.profile.shape.push([-ancho/2, 2*alto_calzada, 0.0]);
		this.profile.shape_norm.push([0.0, 1.0, 0.0]);
		this.profile.shape.push([-ancho/2, 2*alto_calzada, 0.0]);
		this.profile.shape_norm.push([-1.0, 0.0, 0.0]);
		
		this.profile.shape.push([-ancho/2, 0.0, 0.0]);
		this.profile.shape_norm.push([-1.0, 0.0, 0.0]);
		this.profile.shape.push([-ancho/2, 0.0, 0.0]);
		this.profile.shape_norm.push([0.0, -1.0, 0.0]);
		
		// El primer punto de nuevo para cerrar la curva
		this.profile.shape.push([ancho/2, 0.0, 0.0]);
		this.profile.shape_norm.push([0.0, -1.0, 0.0]);
		
	}
	
	
	// Dado un punto en la superficie de la carretera debe devolver
	// sus coordenadas UV en la textura
	this.textura_carretera = function(pos, col, row) {
		var coords = vec2.create();
		
		
		if (row == 6 || row == 7) {
			coords[0] = 1.0 - 0.5 * (pos[2] + (semi_ancho - ancho_cordon))/(semi_ancho - ancho_cordon);
			coords[1] = pos[0]/10.0;
		} else {
			coords[0] = 1.0 - 0.5 * (pos[2] + semi_ancho) + 0.5 * pos[1]; 
			coords[1] = pos[0]/5.0;
		}
		return coords;
	}
	// Dado un punto en la superficie de la carretera debe devolver
	// sus coordenadas UV en la textura
	this.textura_indice_carretera = function(pos, col, row) {
		if (row == 6 || row == 7)
			return 1.0;
		return 2.0;
	}
	
	// Creador
	this.create = function(path) {
		// Terna para debug
		this.debug = false;
		this.terna = new Terna();
		this.terna.create();
		
		this.create_profile();
		this.surface.set_color(BridgeBase.prototype.color);
		this.surface.set_follow_normal(true);
		this.surface.set_texture_function(this.textura_carretera);
		this.surface.set_texture_index_function(this.textura_indice_carretera);
		this.surface.grid.textures = [];
		this.surface.grid.textures[0] = loadTexture("textures/camino.jpg");
		this.surface.grid.textures[1] = loadTexture("textures/uniform.jpg");
		this.surface.grid.textures[2] = loadTexture("textures/vereda.jpg");
		this.surface.grid.textures[3] = loadTexture("textures/vereda_norm.jpg");
		
		this.path = path;
		
		this.surface.create_from_shape(this.path, 50, this.profile.shape, this.profile.shape_norm);
	}
		
	
	this.draw = function(view_matrix, model_matrix) {
		this.surface.draw(view_matrix, model_matrix);
		if (this.debug) {
			this.terna.draw(view_matrix, model_matrix);
		}
	}
}

