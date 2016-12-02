
Tree.prototype.color = [0.5, 0.25, 0.0];
Tree.prototype.STEP_CIRCLE = 20.0;
Tree.prototype.STEP_LEAVES = 20.0;

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
	var leave_min_width = log_width+0.2;
	var tree_heigth = 1.0;
	
	this.log_curve = null;
	
	// Es un semi-rectángulo en el plano xy
	this.create_log_curve = function() {
		this.log_curve = new CubicBSpline();
		var points = [];
		points.push([0.0, 0.0, 0.0]);
		points.push([0.0, 0.0, 0.0]);
		points.push([0.0, 0.0, 0.0]);
		points.push([0.0, tree_heigth, 0.0]);
		points.push([0.0, tree_heigth, 0.0]);
		points.push([0.0, tree_heigth, 0.0]);
		this.log_curve.create(points);
	}
	
		
	this.leaves_curve = null;	
	
	this.create_leaves_curve = function() {
		this.leaves_curve = new CubicBSpline();
		var points = [];
		// Definir la forma
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
	
	
	this.texture_leaves = function(pos, col, row) {
		var coords = vec2.create();
		
		coords[0] = col/Tree.prototype.STEP_LEAVES * 4.0;
		coords[1] = row/Tree.prototype.STEP_CIRCLE * 4.0;

		return coords;
	}
	
		
	this.texture_tronco = function(pos, col, row) {
		var coords = vec2.create();
		
		coords[0] = 1.0 - row/10.0;
		coords[1] = 1.0 - col/Tree.prototype.STEP_CIRCLE * 10.0;

		return coords;
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
		
		this.create_log_curve();
		this.create_leaves_curve();
		
		var revolve = new Circumference();
		revolve.create(0.0);
		
		var circle = new Circumference();
		circle.create(log_width);
		
		
		this.tronco.set_texture_function(this.texture_tronco);
		this.tronco.grid.textures = [];
		this.tronco.grid.textures[0] = loadTexture("textures/bark.jpg");
		this.tronco.grid.textures[1] = loadTexture("textures/bark_norm.jpg");
		this.tronco.create(this.log_curve, 10, circle, this.STEP_CIRCLE);
				
		// La copa
		this.copa = new Surface();
		this.copa.set_follow_normal(true);
		this.copa.set_color([0.6, 0.9, 0.6]);
		
		this.copa.set_texture_function(this.texture_leaves);
		this.copa.grid.textures = [];
		this.copa.grid.textures[0] = loadTexture("textures/hojas.jpg");
		this.copa.grid.textures[1] = loadTexture("textures/uniform.jpg");
		
		this.copa.create(revolve, this.STEP_CIRCLE, this.leaves_curve, this.STEP_LEAVES);

	}
	
	this.draw = function(view_matrix, model_matrix) {
		var tmp = mat4.create();
		mat4.copy(tmp, model_matrix);
		this.tronco.draw(view_matrix, tmp);
		mat4.rotate(tmp, tmp, Math.PI/2, [1.0, 0.0, 0.0]);
		this.copa.draw(view_matrix, tmp);
		if (this.debug) {
			this.terna.draw(view_matrix, tmp);
		}
	}
}

