
Cargamento.prototype.color = [Math.random(), Math.random(), Math.random()];

function Cargamento() {	
	this.terna = null;
	this.color = Cargamento.prototype.color;
	this.debug = null;
	
	this.caja1 = null;
	this.caja2 = null;
	this.caja3 = null;	
	this.caja4 = null;
	this.caja5 = null;
	this.caja6 = null;
	
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
	this.create = function() {
		// Terna para debug
		this.debug = false;
		this.terna = new Terna();
		this.terna.create();

		this.caja1 = new Cube();
		this.caja1.set_color([Math.random(), Math.random(), Math.random()]);
		this.caja1.create(0.0, 1.0, 5.0, 0.5, 1.5, 5.4);
		this.caja2 = new Cube();
		this.caja2.set_color([Math.random(), Math.random(), Math.random()]);
		this.caja2.create(0.5, 1.0, 6.0, 0.8, 1.4, 6.5);
		this.caja3 = new Cube();
		this.caja3.set_color([Math.random(), Math.random(), Math.random()]);
		this.caja3.create(0.5, 1.0, 5.0, 0.8, 1.5, 5.8);
		
		this.caja4 = new Cube();
		this.caja4.set_color([Math.random(), Math.random(), Math.random()]);
		this.caja4.create(0.08, 1.0, 5.4, 0.31, 1.5, 5.8);
		this.caja5 = new Cube();
		this.caja5.set_color([Math.random(), Math.random(), Math.random()]);
		this.caja5.create(0.25, 1.0, 5.0, 0.7, 1.5, 5.8);
		this.caja6 = new Cube();
		this.caja6.set_color([Math.random(), Math.random(), Math.random()]);
		this.caja6.create(0.54, 1.25, 5.1, 0.74, 1.36, 5.8);
		}
		
	
	this.draw = function(view_matrix, model_matrix) {
		this.caja1.draw(view_matrix, model_matrix);
		this.caja2.draw(view_matrix, model_matrix);
		this.caja3.draw(view_matrix, model_matrix);
		this.caja4.draw(view_matrix, model_matrix);
		this.caja5.draw(view_matrix, model_matrix);
		this.caja6.draw(view_matrix, model_matrix);
		if (this.debug) {
			this.terna.draw(view_matrix, model_matrix);
		}
	}
}

