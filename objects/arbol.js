
Tree.prototype.color = [0.5, 0.25, 0.0];

function Tree() {	
	this.terna = null;
	this.color = Tree.prototype.color;
	this.debug = null;
	
	this.tronco = null;
	this.copa = null;
	
	this.altoTronco = 1.8;
	
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
	
	this.create = function() {
		// Terna para debug
		this.debug = false;
		this.terna = new Terna();
		this.terna.create();
		
		// Tronco
		this.tronco = new Surface();
		this.tronco.set_color(this.color);
		this.tronco.set_follow_normal(true);
		
		var profile_shape = [];
		var profile_shape_norm = [];
		
		var circulito = new Circumference();
		circulito.create(0.0);
		var rectangulito = new Rectangulo();
		rectangulito.create(0.0, -0.1, this.altoTronco, 0.2);
		
		for(i = 0; i < 1; i+=0.05){
			profile_shape.push(rectangulito.at(i));
			profile_shape_norm.push(rectangulito.norm_at(i));
		}	
		
		this.tronco.create_from_shape(circulito, 50, profile_shape, profile_shape_norm);
		// La copa
		this.copa = new Surface();
		this.copa.set_follow_normal(true);
		
		var profile_shape2 = [];
		var profile_shape_norm2 = [];
		
		var circulito2 = new Circumference();
		circulito2.create(0.0);
		var rectangulito2 = new CopaArbol();
		rectangulito2.create(-1.8, -0.3, 0.3, 0.8);
		this.copa.set_color(rectangulito2.color);
		
		for(i = 0; i < 1; i+=0.05){
			profile_shape2.push(rectangulito2.at(i));
			profile_shape_norm2.push(rectangulito2.norm_at(i));
		}	
		
		this.copa.create_from_shape(circulito2, 50, profile_shape2, profile_shape_norm2);
		
	}
		
	
	this.draw = function(view_matrix, model_matrix) {
		var tmp = mat4.create();
		mat4.copy(tmp, model_matrix);
		mat4.translate(tmp, tmp, [0.0, -3.2, 0.0]);
		mat4.rotate(tmp, tmp, -Math.PI/2, [1.0, 0.0, 0.0]);
		this.tronco.draw(view_matrix, tmp);
		this.copa.draw(view_matrix, tmp);
		if (this.debug) {
			this.terna.draw(view_matrix, tmp);
		}
	}
}

