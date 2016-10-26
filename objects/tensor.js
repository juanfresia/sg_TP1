// Define la pieza que compondrá las torres del puente. Resulta de una interpolación lineal de puntos en forma de hache.

Tensor.prototype.color = [0.9,0.9,0.9];

function Tensor() {	
	this.terna = null;
	this.color = Tensor.prototype.color;
	this.debug = null;
		
	this.superficie = null;
	this.path = null;
	this.base = null;
			
	this.set_color = function(color) {
		this.color = color;
	}
		
	this.set_debug = function(debug) {
		this.debug = debug;
	}
	
	this.create = function(radio) {
		// Terna para debug
		this.debug = false;
		this.terna = new Terna();
		this.terna.create();
		
		this.superficie = new Surface();
		this.superficie.set_color(this.color);
		this.superficie.set_follow_normal(true);
		
		this.base = new Circumference();
		this.base.create(radio);
		
		// Reemplazar por algo más eficiente?
		this.path = new CubicBSpline();
		var points = [];
		points.push([0.0, 0.0, 0.0]);
		points.push([0.0, 0.0, 0.0]);
		points.push([0.0, 0.0, 0.0]);
		points.push([0.0, 1.0, 0.0]);
		points.push([0.0, 1.0, 0.0]);
		points.push([0.0, 1.0, 0.0]);
		this.path.create(points);
		
		this.superficie.create(this.path, 5, this.base, 20);				
	}
		
	
	this.draw = function(view_matrix, model_matrix) {
		this.superficie.draw(view_matrix, model_matrix);
		if (this.debug) {
			this.terna.draw(view_matrix, model_matrix);
		}
	}
}

