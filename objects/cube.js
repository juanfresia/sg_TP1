
Cube.prototype.color = [0.8, 0.8, 0.2];

function Cube() {	
	this.terna = null;
	this.color = Cube.prototype.color;
	this.debug = null;
	
	this.cube = null;
	this.tapa1 = null;
	this.alto = null;
	
	this.grid = null;
			
	this.push_point = function(buffer, point) {
		buffer.push(point[0]);
		buffer.push(point[1]);
		buffer.push(point[2]);
	}
	
	this.set_color = function(color) {
		this.color = color;
	}
		
	this.set_debug = function(debug) {
		this.debug = debug;
	}
	
	// Crea un cubo apoyado en el plano z=za
	this.create = function(xa, ya, za, xb, yb, zb) {
		// Terna para debug
		this.debug = false;
		this.terna = new Terna();
		this.terna.create();

		this.cube = new Surface();
		this.cube.set_color(this.color);
		this.cube.set_follow_normal(true);
		this.tapa1 = new Surface();
		this.tapa1.set_color(this.color);
		this.tapa1.set_follow_normal(true);
		this.tapa2 = new Surface();
		this.tapa2.set_color(this.color);
		this.tapa2.set_follow_normal(true);
		
		// El lateral
		var path_cube = new CubicBSpline();
		var points = [];
		points.push([xa, ya, za]);
		points.push([xa, ya, za]);
		points.push([xa, ya, za]);
		points.push([xa, ya, zb]);
		points.push([xa, ya, zb]);
		points.push([xa, ya, zb]);
	//	points.push([(xb-xa)*0.5, (yb-ya)*0.5, za]);
	//	points.push([(xb-xa)*0.5, (yb-ya)*0.5, za]);
	//	points.push([(xb-xa)*0.5, (yb-ya)*0.5, za]);
	//	points.push([(xb-xa)*0.5, (yb-ya)*0.5, zb]);
	//	points.push([(xb-xa)*0.5, (yb-ya)*0.5, zb]);
	//	points.push([(xb-xa)*0.5, (yb-ya)*0.5, zb]);
		path_cube.create(points);
		
		var base_cube = new Rectangulo();
		base_cube.set_color(this.color);
		base_cube.create(xa, ya, xb, yb);
		
		this.cube.create(path_cube, 40, base_cube, 55);
		
		// Una tapa
		var path_tapa1 = new CubicBSpline();
		var points_tapa1 = []
		points_tapa1.push([xa+xa, ya, zb+xa]);
		points_tapa1.push([xa+xa, ya, zb+xa]);
		points_tapa1.push([xa+xa, ya, zb+xa]);
		points_tapa1.push([xb+xa, ya, zb+xa]);
		points_tapa1.push([xb+xa, ya, zb+xa]);
		points_tapa1.push([xb+xa, ya, zb+xa]);
		path_tapa1.create(points_tapa1);
		
		var base_tapa1 = new Rectangulo();
		base_tapa1.set_color(this.color);
		base_tapa1.create(xa, ya, xa, yb);
		
		this.tapa1.create(path_tapa1, 20, base_tapa1, 35);
		
		this.alto = zb-za;
		}
		
	
	this.draw = function(view_matrix, model_matrix) {
		this.cube.draw(view_matrix, model_matrix);
		this.tapa1.draw(view_matrix, model_matrix);
		// Otra tapa
		var tmp = mat4.create();
		mat4.copy(tmp, model_matrix);
		mat4.translate(tmp, tmp, [0.0, 0.0, -this.alto]);
		this.tapa1.draw(view_matrix, tmp);
		if (this.debug) {
			this.terna.draw(view_matrix, model_matrix);
		}
	}
}

