// Define la pieza que compondrá las torres del puente. Resulta de una interpolación lineal de puntos en forma de hache.


function Bridge() {

	// Variables y funciones auxiliares para determinar el color y la terna del modo debug
	this.terna = null;
	this.debug = null;
	
	// Estructuras asociadas
	this.tower_locations = null;
	this.tower_heights = null;
	this.support_heights = null;
	
	
	// Las curvas asocaidas al puente
	this.curva_carretera = null;
	this.curva_cables = null;
	
	// Los componentes del puente
	this.carretera = null;	
	this.carretera_mat = null;
	this.side = null;
	this.side_mat = null;
	
	this.set_debug = function(debug) {
		this.debug = debug;
	}


	// Funcion auxiliar para crear la curva de la carretera
	this.crear_curva_carretera = function(largo, elevacion, curvatura, nivelado) {
		var points = [];
		var semi_largo = largo/2;
		var fin_pendiente = semi_largo * (1-curvatura);
		var ini_pendiente = semi_largo * 0.9;			// Constante para definir que tan abrupta es la pendiente
		
		// Interpolo el punto de inicio
		points.push([-semi_largo, 0.0, 0.0]);
		points.push([-semi_largo, 0.0, 0.0]);
		points.push([-semi_largo, 0.0, 0.0]);
		
		// Puntos que definen la pendiente subida
		points.push([-ini_pendiente, 0.0, 0.0]);
		points.push([-fin_pendiente, elevacion, 0.0]);
				
		// Si nivelo necesito un punto en el medio
		if (nivelado) {
			points.push([0.0, elevacion, 0.0]);
		}
		
		// Idem para la bajada		
		points.push([fin_pendiente, elevacion, 0.0]);
		points.push([ini_pendiente, 0.0, 0.0]);
		
		// Interpolo el punto final
		points.push([semi_largo, 0.0, 0.0]);
		points.push([semi_largo, 0.0, 0.0]);
		points.push([semi_largo, 0.0, 0.0]);	
		
		this.curva_carretera = new CubicBSpline();
		this.curva_carretera.create(points);
	}

	this.crear_curva_cables = function(largo, elev_torres, num_torres) {
		var points = [];
		var semi_largo = largo/2;
		var tower_span = semi_largo * 0.7;			// Proporción del puente que ocuparán las torres, ubicación de las torres de los extremos
		var decay_inicial = (semi_largo - tower_span)/3;
		var altura_cables = elev_torres * 0.3;		// Que tan cerca se acercarán los cables colgando a la carretera
		
		// Interpolo el punto de inicio
		points.push([-semi_largo, altura_cables, 0.0]);
		points.push([-semi_largo, altura_cables, 0.0]);
		points.push([-semi_largo, altura_cables, 0.0]);
		
		// Primer torre
		points.push([-2*decay_inicial - tower_span, altura_cables, 0.0]);
		points.push([-decay_inicial - tower_span, altura_cables, 0.0]);
		points.push([-tower_span, elev_torres, 0.0]);
		points.push([-tower_span, elev_torres, 0.0]);
		points.push([-tower_span, elev_torres, 0.0]);
		
		// Guardo la posición de la torre
		this.tower_locations.push(-tower_span);
		
		var incremento = (tower_span) / ((num_torres-1)*2);
		var acum_x = -tower_span;
		for (var i = 0; i < (num_torres-1); i++) {
			acum_x += incremento;
			points.push([acum_x, altura_cables, 0.0]);	
			acum_x += incremento;
			points.push([acum_x, altura_cables, 0.0]);
			acum_x += incremento;
			points.push([acum_x, altura_cables, 0.0]);
			acum_x += incremento;
			points.push([acum_x, elev_torres, 0.0]);
			points.push([acum_x, elev_torres, 0.0]);
			points.push([acum_x, elev_torres, 0.0]);
			
			this.tower_locations.push(acum_x);
		}
		
		// Última sección de cables
		points.push([decay_inicial+tower_span, altura_cables, 0.0]);
		points.push([2*decay_inicial+tower_span, altura_cables, 0.0]);
		
		// Interpolo el punto final
		points.push([semi_largo, altura_cables, 0.0]);
		points.push([semi_largo, altura_cables, 0.0]);
		points.push([semi_largo, altura_cables, 0.0]);	
		
		this.curva_cables = new CubicBSpline();
		this.curva_cables.create(points);
	}	
	
	
	// ------------------------------------------------------
	// ------------------- OPTIMIZAR ESTO -------------------
	// ------------------------------------------------------
		
	// Función auxiliar que encuentra un valor de u tq C(u)[0] = x
	// Asume que la hay un único valor de x que satisface esa condición en el intervalo.
	this.curva_at_x = function(curva, x, u_min, u_max) {
		var high = u_max;
		var low = u_min;
		var u_act = low + (high-low)/2;
		var x_act = curva.at(u_act);
		var count = 0;
		while ( (Math.abs(x_act[0] - x) >= 0.1) && (count < 200) ) {
			if ( x_act[0] > x )
				high = u_act;
			else
				low = u_act;
			u_act = low+(high-low)/2;
			count++;
			x_act = curva.at(u_act);
		}
		if (count >= 200) {
			console.log("Bisección falló al encontrar el parámetro u pedido");
			return x_act;
		}
		return x_act;
	}
		
	this.barrer_curvas = function(largo, separacion) {
		var semi_largo = largo/2;
		var intervalos = [-semi_largo];
		intervalos = intervalos.concat(this.tower_locations, [semi_largo]);
		
		// Variables paramétricas con las que recorrer las curvas
		var u1 = 0;
		var u2 = 0;
		var x_act1 = [0.0, 0.0, 0.0];
		var x_act2 = [0.0, 0.0, 0.0];
		var count = 0;
		
		for (var i = 0; i < (intervalos.length-1); i++) {
			count_act = 0;
			var ancho_intervalo = intervalos[i+1] - intervalos[i];
			var cant_tirantes = Math.floor(ancho_intervalo/separacion);
			var espacio_sobrante = ancho_intervalo - cant_tirantes * separacion;
			var x_obj = intervalos[i] + espacio_sobrante/2;
			
			// Recorro la curva 1
			while (count_act < cant_tirantes) {
				this.support_heights[count] = [x_obj, 0.0, 0.0];
				while ((this.curva_carretera.at(u1+1))[0] < x_obj) {
					u1 += 1;
				}
				while ((this.curva_cables.at(u2+1))[0] < x_obj) {
					u2 += 1;
				}
				x_act1 = this.curva_at_x(this.curva_carretera, x_obj, u1, u1+1);
				x_act2 = this.curva_at_x(this.curva_cables, x_obj, u2, u2+1);
				this.support_heights[count][1] = x_act1[1];
				this.support_heights[count][2] = x_act2[1];
				x_obj += separacion;
				count++;
				count_act++;
			}
		}		 
	}	
	
	this.calcular_altura_torres = function(largo, num_torres) {
		var semi_largo = largo/2;
		var tower_span = semi_largo * 0.7;
		
		
		var step = (2*tower_span)/(num_torres-1);
		var act = -tower_span;
		for (var i = 0; i < num_torres; i++) {
			this.tower_heights[i] = this.curva_at_x(this.curva_carretera, act, 0, this.curva_carretera.length())[1];
			act += step;
		}
	}
	
	// ------------------------------------------------------
	// ------------------------------------------------------
	// ------------------------------------------------------
	
	
	
		
		
		
	// Creador
	this.create = function() {
		// Terna para debug
		this.debug = false;
		this.terna = new Terna();
		this.terna.create();
		
		// Variables auxiliares para la creación de las torres y soportes
		this.tower_locations = [];
		this.tower_heights = [];
		this.support_heights = [];
		
		// Creo las curvas que formarán los caminos para las superficies de barrido de los cables y la carretera
		this.crear_curva_cables(params.puente_largo, params.puente_ph3, params.puente_num_torres);
		this.crear_curva_carretera(params.puente_largo, params.puente_ph2, params.puente_cur, params.puente_nivel);
				
		// Creo la carretera y obtengo los parámetros para crear el lado
		this.carretera = new BridgeBase();
		this.carretera.create(this.curva_carretera);
		this.carretera.path.setupWebGLBuffers(0.1);
						
		this.barrer_curvas(params.puente_largo, params.puente_sep);
		this.calcular_altura_torres(params.puente_largo, params.puente_num_torres);
		
		// La matriz de la carretera
			
		this.carretera_mat = mat4.create();
		mat4.identity(this.carretera_mat);
		mat4.translate(this.carretera_mat, this.carretera_mat, [0.0, params.puente_ph1, 0.0]);
		
		
		// Creo el lado del puente
		this.side = new BridgeSide();
		this.side_mat = [];
		
		// Creo las matrices para desplazar los lados a los costados
		this.side.create(this.curva_cables, this.tower_locations, this.tower_heights, this.support_heights);
		this.side_mat[0] = mat4.create();
		mat4.identity(this.side_mat[0]);
		mat4.translate(this.side_mat[0], this.side_mat[0], [0.0, params.puente_ph1, -params.puente_ancho/2 + 0.5]);
		
		this.side_mat[1] = mat4.create();
		mat4.identity(this.side_mat[1]);
		mat4.translate(this.side_mat[1], this.side_mat[1], [0.0, params.puente_ph1, params.puente_ancho/2 - 0.5]);
			
	}
		
	
	this.draw = function(view_matrix, model_matrix) {
		// Dibujo la carretera
		var tmp = mat4.create();
		mat4.copy(tmp, this.carretera_mat);
		mat4.mul(tmp, model_matrix, tmp);
		this.carretera.draw(view_matrix, tmp);
		this.carretera.path.draw(view_matrix, tmp);
		
		// Dibujo los lados
		for (var i = 0; i < this.side_mat.length; i++) {
			mat4.identity(tmp);
			mat4.copy(tmp, this.side_mat[i]);
			mat4.mul(tmp, model_matrix, tmp);
			this.side.draw(view_matrix, tmp);
		}
		
		
		if (this.debug) {
			this.terna.draw(view_matrix, model_matrix);
		}
	}
}

