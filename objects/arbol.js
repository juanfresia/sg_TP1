
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
	
	var log_width = 0.2;
	var leave_min_width = log_width+0.1;
	var tree_heigth = 1.0;
	
	this.log_shape = null;
	this.log_shape_norm = null;
	
	// Es un semi-rectángulo en el plano xz
	this.create_log_shape = function() {
		this.log_shape = [];
		this.log_shape_norm = [];
		
		this.log_shape.push([0.0, 0.0, 0.0]);
		this.log_shape_norm.push([0.0, -1.0, 0.0]);
		
		this.log_shape.push([0.0, log_width, 0.0]);
		this.log_shape_norm.push([0.0, -1.0, 0.0]);
		this.log_shape.push([0.0, log_width, 0.0]);
		this.log_shape_norm.push([1.0, 0.0, 0.0]);
				
		this.log_shape.push([tree_heigth, log_width, 0.0]);
		this.log_shape_norm.push([1.0, 0.0, 0.0]);
		this.log_shape.push([tree_heigth, log_width, 0.0]);
		this.log_shape_norm.push([0.0, 1.0, 0.0]);
				
		this.log_shape.push([tree_heigth, 0.0, 0.0]);
		this.log_shape_norm.push([0.0, 1.0, 0.0]);
	}
	
		
	this.leaves_curve = null;	
	
	this.create_leaves_curve = function() {
		this.leaves_curve = new CubicBSpline();
		var points = [];
		// Definir la formaaa
		points.push([tree_heigth/4, 0.0, 0.0]);
		points.push([tree_heigth/4, 0.0, 0.0]);
		points.push([tree_heigth/4, 0.0, 0.0]);
		points.push([tree_heigth/4, Math.random() * 0.6 + leave_min_width, 0.0]);		// Extensión máxima de la parte baja de la copa
		points.push([2*tree_heigth/4, Math.random() * 0.4 + leave_min_width, 0.0]);	// Extensión de la cintura del árbol
		points.push([3*tree_heigth/4, Math.random() * 0.8 + leave_min_width, 0.0]);	// Extensión de la cabeza del árbol
		points.push([5*tree_heigth/4, 0.0, 0.0]);	// Copa
		points.push([5*tree_heigth/4, 0.0, 0.0]);	// Copa
		points.push([5*tree_heigth/4, 0.0, 0.0]);	// Copa

		this.leaves_curve.create(points);
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
		this.create_log_shape();
		this.create_leaves_curve();
		var revolve = new Circumference();
		revolve.create(0.0);
		this.tronco.create_from_shape(revolve, 50, this.log_shape, this.log_shape_norm);
				
		// La copa
		this.copa = new Surface();
		this.copa.set_follow_normal(true);
		this.copa.set_color([0.6, 0.9, 0.6]);
		this.copa.create(revolve, 50, this.leaves_curve, 20);


		
	}
		
	
	this.draw = function(view_matrix, model_matrix) {
		var tmp = mat4.create();
		mat4.copy(tmp, model_matrix);
		mat4.rotate(tmp, tmp, Math.PI/2, [1.0, 0.0, 0.0]);
		this.tronco.draw(view_matrix, tmp);
		this.copa.draw(view_matrix, tmp);
		if (this.debug) {
			this.terna.draw(view_matrix, tmp);
		}
	}
}

