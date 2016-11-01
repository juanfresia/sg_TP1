
Ship.prototype.color = [0.8, 0.8, 0.2];

function Ship() {	
	this.terna = null;
	this.color = Ship.prototype.color;
	this.debug = null;
	
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
		
		var side = 0.5;
		
		this.cube = new TowerBase();
		this.cube.set_color(this.color);
		this.cube.create(3.0, 1.0, 1.0, 1.0, 0.0, 1.0);
	}
		
	
	this.draw = function(view_matrix, model_matrix) {
		this.cube.draw(view_matrix, model_matrix);
		if (this.debug) {
			this.terna.draw(view_matrix, model_matrix);
		}
	}
}

