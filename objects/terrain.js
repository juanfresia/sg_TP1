// Define la pieza que compondrá las torres del puente. Resulta de una interpolación lineal de puntos en forma de hache.

function Terrain() {	
	this.terna = null;
	this.debug = null;
	
	this.altura_maxima = null;
		
	this.superficie = null;
	this.curva_cauce = null;
	this.curva_costa = null;
	
	this.lados = null;
	
	this.push_point = function(buffer, point, n) {
		buffer.push(point[0]);
		buffer.push(point[1]);
		if (n==2)
			return;
		buffer.push(point[2]);
	}
	
	this.set_debug = function(debug) {
		this.debug = debug;
	}
	
	// Funcion auxiliar para el color
	this.pick_color = function(pos) {
		var height = pos[2] / params.ter_alto;
		var tmp = vec3.create();
		var color_sand = vec3.fromValues(240/255, 220/255, 170/255);
		var color_grass = vec3.fromValues(100/255, 200/255, 100/255);
		vec3.lerp(tmp, color_sand, color_grass, height);
		return tmp;
	}
	
	//	Misma función que en bridge.js, mover a una librería auxiliar?
	this.curva_at_y = function(y) {
		curva = this.curva_costa;
		var high = this.curva_costa.length();
		var low = 0;
		var u_act = low + (high-low)/2;
		var x_act = curva.at(u_act);
		var count = 0;
		while ( (Math.abs(x_act[1] - y) >= 0.1) && (count < 200) ) {
			if ( x_act[1] > y )
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
	
	this.curva_tan_at_y = function(y) {
		curva = this.curva_costa;
		var high = this.curva_costa.length();
		var low = 0;
		var u_act = low + (high-low)/2;
		var x_act = curva.at(u_act);
		var count = 0;
		while ( (Math.abs(x_act[1] - y) >= 0.1) && (count < 200) ) {
			if ( x_act[1] > y )
				high = u_act;
			else
				low = u_act;
			u_act = low+(high-low)/2;
			count++;
			x_act = curva.at(u_act);
		}
		if (count >= 200) {
			console.log("Bisección falló al encontrar el parámetro u pedido");
			return curva.tan_at(u_act);
		}
		return curva.tan_at(u_act);
	}
	
	// Crear las curvas
	this.crear_curva_cauce = function(ancho, alto) {
		var points = [];
		var semi_ancho = ancho/2;
		var media_pendiente = ancho/4;
		// Interpola origen
		points.push([-semi_ancho, alto, 0.0]);
		points.push([-semi_ancho, alto, 0.0]);
		points.push([-semi_ancho, alto, 0.0]);
		
		// Puntos de la pendiente izquierda
		points.push([-media_pendiente, alto, 0.0]);
		points.push([-media_pendiente, 0.0, 0.0]);
		
		// Fondo del rio
		points.push([0.0, 0.0, 0.0]);
		
		// Puntos de la pendiente derecha
		points.push([media_pendiente, 0.0, 0.0]);
		points.push([media_pendiente, alto, 0.0]);
		
		// Interpolo el final
		points.push([semi_ancho, alto, 0.0]);
		points.push([semi_ancho, alto, 0.0]);
		points.push([semi_ancho, alto, 0.0]);
		
		this.curva_cauce = new CubicBSpline();
		this.curva_cauce.create(points);		
	}
	
	// Esta es la curva de la costa que está encerrada en el cuadrado [-1, 1] en x e y.
	this.crear_curva_costa = function(puntos, ancho) {
		var ini = [[0.0, -1.0, 0.0], [0.0, -1.0, 0.0], [0.0, -1.0, 0.0]];
		var fin = [[0.0, 1.0, 0.0], [0.0, 1.0, 0.0], [0.0, 1.0, 0.0]];
		
		var aux = ini.concat(puntos, fin);
		
		for(var i = 0; i < aux.length; i++) {
			vec3.scale(aux[i], aux[i], ancho/2);
		}
		
		this.curva_costa = new CubicBSpline();
		this.curva_costa.create(aux);
	}
	
	
	// Funciones para determinar las coordenadas samll y big
	this.textura_small = function(pos, col, row) {
		var coords = vec2.create();		
		coords[0] = 1.0 - pos[0]/40.0;
		coords[1] = pos[1]/40.0;
		return coords;
	}
	this.textura_big = function(pos, col, row) {
		var coords = vec2.create();		
		coords[0] = 1.0 - pos[0]/40.0;
		coords[1] = pos[1]/40.0;
		return coords;
	}
	
	
	// Crea los bordes llanos del terreno
	this.crear_lados = function(ancho, alto) {
		this.lados = [];
		this.lados[0] = new VertexGrid();
		this.lados[0].createIndexBuffer(100, 2);
		this.lados[1] = new VertexGrid();
		this.lados[1].createIndexBuffer(100, 2);
		
		var semi_ancho = ancho/2;
		var ter_semi_ancho = params.ter_ancho/2;
		var color_grass = vec3.fromValues(100/255, 200/255, 100/255);
		
		
		this.lados[0].texture_coord_buffer = [];
		this.lados[1].texture_coord_buffer = [];
		this.lados[0].texture_coord_2_buffer = [];
		this.lados[1].texture_coord_2_buffer = [];
		
		for (var i = 0; i < 100; i++) {
			var u1 = i*this.curva_costa.length()/(100-1);
			var point = this.curva_costa.at(u1);
			
			var x = point[0];
			var y = point[1];
			
			var pos = [x - semi_ancho, y, alto];						
			this.push_point(this.lados[0].position_buffer, pos);
			this.push_point(this.lados[0].color_buffer, color_grass);
			this.push_point(this.lados[0].normal_buffer, [0.0, 0.0, 1.0]);
			this.push_point(this.lados[0].tangent_buffer, [-1.0, 0.0, 0.0]);
			this.push_point(this.lados[0].texture_coord_buffer, this.textura_small(pos, 0, i), 2);
			this.push_point(this.lados[0].texture_coord_2_buffer, this.textura_big(pos, 0, i), 2);
			
			var pos = [-ter_semi_ancho, y, alto];
			this.push_point(this.lados[0].position_buffer, [-ter_semi_ancho, y, alto]);
			this.push_point(this.lados[0].color_buffer, color_grass);
			this.push_point(this.lados[0].normal_buffer, [0.0, 0.0, 1.0]);
			this.push_point(this.lados[0].tangent_buffer, [-1.0, 0.0, 0.0]);
			this.push_point(this.lados[0].texture_coord_buffer, this.textura_small(pos, 1, i), 2);
			this.push_point(this.lados[0].texture_coord_2_buffer, this.textura_big(pos, 1, i), 2);
			
			
			var pos = [ter_semi_ancho, y, alto];
			this.push_point(this.lados[1].position_buffer, pos);
			this.push_point(this.lados[1].color_buffer, color_grass);
			this.push_point(this.lados[1].normal_buffer, [0.0, 0.0, 1.0]);
			this.push_point(this.lados[1].tangent_buffer, [-1.0, 0.0, 0.0]);
			this.push_point(this.lados[1].texture_coord_buffer, this.textura_small(pos, 0, i), 2);
			this.push_point(this.lados[1].texture_coord_2_buffer, this.textura_big(pos, 0, i), 2);
			
			var pos = [x + semi_ancho, y, alto];
			this.push_point(this.lados[1].position_buffer, pos);
			this.push_point(this.lados[1].color_buffer, color_grass);
			this.push_point(this.lados[1].normal_buffer, [0.0, 0.0, 1.0]);
			this.push_point(this.lados[1].tangent_buffer, [-1.0, 0.0, 0.0]);
			this.push_point(this.lados[1].texture_coord_buffer, this.textura_small(pos, 1, i), 2);
			this.push_point(this.lados[1].texture_coord_2_buffer, this.textura_big(pos, 1, i), 2);
		}
		
		this.lados[0].setupWebGLBuffers();
		this.lados[1].setupWebGLBuffers();
		
		for (var i = 0; i <= 1; i++) {
			this.lados[i].textures = [];
			this.lados[i].textures[0] = loadTexture("textures/sand.jpg");
			this.lados[i].textures[1] = loadTexture("textures/sand_norm.jpg");
			this.lados[i].textures[2] = loadTexture("textures/grass01.jpg");
			this.lados[i].textures[3] = loadTexture("textures/grass01_norm.jpg");
			this.lados[i].textures[4] = loadTexture("textures/stone.jpg");
			this.lados[i].textures[5] = loadTexture("textures/stone_norm.jpg");
			this.lados[i].textures[6] = loadTexture("textures/blend.jpg");
		}
	}
	
		
	this.create = function(points) {
		// Terna para debug
		this.debug = false;
		this.terna = new Terna();
		this.terna.create();
				
		// Creo las curvas para el cause y la costa
		this.crear_curva_cauce(params.rio_ancho, params.ter_alto);		
		this.curva_cauce.rotate(Math.PI/2, [1.0, 0.0, 0.0]);
		this.curva_cauce.set_up_binormal([0.0, -1.0, 0.0]);		
		this.crear_curva_costa(points, params.ter_ancho);
		
		// Creo las superficies de los lados planos
		this.crear_lados(params.rio_ancho, params.ter_alto);
		
		// Creo la superficie del cauce
		this.superficie = new Surface();
		this.superficie.set_color_function(this.pick_color);
		this.superficie.set_follow_normal(false);
		this.superficie.set_texture_function(this.textura_small);
		this.superficie.set_texture_function_2(this.textura_big);
		
		// Cargo las texturas
		this.superficie.grid.textures = [];
		this.superficie.grid.textures[0] = loadTexture("textures/sand.jpg");
		this.superficie.grid.textures[1] = loadTexture("textures/sand_norm.jpg");
		this.superficie.grid.textures[2] = loadTexture("textures/grass01.jpg");
		this.superficie.grid.textures[3] = loadTexture("textures/grass01_norm.jpg");
		this.superficie.grid.textures[4] = loadTexture("textures/stone.jpg");
		this.superficie.grid.textures[5] = loadTexture("textures/stone_norm.jpg");
		this.superficie.grid.textures[6] = loadTexture("textures/blend.jpg");
		
		this.superficie.create(this.curva_costa, 100, this.curva_cauce, 50);
	}
		
	
	this.draw = function(view_matrix, model_matrix) {
		this.superficie.grid.draw_terrain(view_matrix, model_matrix);
		this.lados[0].draw_terrain(view_matrix, model_matrix);
		this.lados[1].draw_terrain(view_matrix, model_matrix);
		if (this.debug) {
			this.terna.draw(view_matrix, model_matrix);
		}
	}
}

