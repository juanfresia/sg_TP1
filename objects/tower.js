// Define la pieza que compondrá las torres del puente. Resulta de una interpolación lineal de puntos en forma de hache.

Tower.prototype.color = [1.0,0.0,0.0];

function Tower() {	
	this.terna = null;
	this.color = Tower.prototype.color;
	this.debug = null;
	
	this.segmentos = null;
	this.matrices = null;
			
	this.set_color = function(color) {
		this.color = color;
	}
		
	this.set_debug = function(debug) {
		this.debug = debug;
	}
	
	this.create = function(x_out, y_out, x_in, y_in, reduccion) {
		// Terna para debug
		this.debug = true;
		this.terna = new Terna();
		this.terna.create();

		this.segmentos = [];
		this.matrices = [];
		
		var tmp = mat4.create();
		var ant = null;
		var height = 0;
		mat4.identity(tmp);
		
		// Estoy haciendo que las junturas sean 1/20 de la altura
		
		this.segmentos[0] = new TowerBase();
		this.segmentos[0].create(x_out, y_out, x_in, y_in, 1.0, params.torre_h1);
		this.matrices[0] = mat4.create();
		mat4.copy(this.matrices[0], tmp);
		
		this.segmentos[1] = new TowerBase();
		this.segmentos[1].create(x_out, y_out, x_in, y_in, reduccion, params.torre_h1/20);
		mat4.translate(tmp, tmp, [0.0, 0.0, params.torre_h1]);	
		this.matrices[1] = mat4.create();
		mat4.copy(this.matrices[1], tmp);
		height = params.torre_h1 * 21/20;
		
		mat4.identity(tmp);
		this.segmentos[2] = new TowerBase();
		ant = this.segmentos[1].nueva_seccion();
		this.segmentos[2].create(ant.x_out, ant.y_out, ant.x_in, ant.y_in, 1.0, ((params.torre_h2)/2));
		mat4.translate(tmp, tmp, [0.0, 0.0, height]);
		this.matrices[2] = mat4.create();
		mat4.copy(this.matrices[2], tmp);
		height += ((params.torre_h2)/2);
		
		mat4.identity(tmp);
		this.segmentos[3] = new TowerBase();
		this.segmentos[3].create(ant.x_out, ant.y_out, ant.x_in, ant.y_in, reduccion, ((params.torre_h2)/2)*(1/20));
		mat4.translate(tmp, tmp, [0.0, 0.0, height]);
		this.matrices[3] = mat4.create();
		mat4.copy(this.matrices[3], tmp);
		height += ((params.torre_h2)/2)*(1/20);
		
		
		mat4.identity(tmp);
		this.segmentos[4] = new TowerBase();
		ant = this.segmentos[3].nueva_seccion();
		this.segmentos[4].create(ant.x_out, ant.y_out, ant.x_in, ant.y_in, 1.0, ((params.torre_h2)/2));
		mat4.translate(tmp, tmp, [0.0, 0.0, height]);
		this.matrices[4] = mat4.create();
		mat4.copy(this.matrices[4], tmp);
		height += ((params.torre_h2)/2);
		
		mat4.identity(tmp);
		this.segmentos[5] = new TowerBase();
		this.segmentos[5].create(ant.x_out, ant.y_out, ant.x_in, ant.y_in, 0, 0);
		mat4.translate(tmp, tmp, [0.0, 0.0, height]);
		this.matrices[5] = mat4.create();
		mat4.copy(this.matrices[5], tmp);
		
	}
		
	
	this.draw = function(view_matrix, model_matrix) {
		for (i = 0; i < this.segmentos.length; i++) {
			var tmp = mat4.create();
			mat4.copy(tmp, this.matrices[i]);
			mat4.mul(tmp, model_matrix, tmp);
			this.segmentos[i].draw(view_matrix, tmp);
		}
		if (params.debug_mode) {
			this.terna.draw(view_matrix, model_matrix);
		}
	}
}

