
Water.prototype.color = [0.6, 0.6, 1.0];

function Water() {	
	this.terna = null;
	this.color = Tensor.prototype.color;
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
		
		var granularidad = 100;
		var ter_semi_ancho = params.ter_ancho/2;
		this.grid = new VertexGrid();
		this.grid.createIndexBuffer(granularidad, granularidad);
		
		for (var i = 0; i < granularidad; i++) {
			var x = - ter_semi_ancho + params.ter_ancho * i/granularidad;
			for (var j = 0; j < granularidad; j++) {
				var y = - ter_semi_ancho + params.ter_ancho * j/granularidad;
				this.push_point(this.grid.position_buffer, [x, y, params.agua_alto]);
				this.push_point(this.grid.color_buffer, this.color);
				this.push_point(this.grid.normal_buffer, [0.0, 0.0, 1.0]);	
			}		
		}
		this.grid.setupWebGLBuffers();
	}
		
	
	this.draw = function(view_matrix, model_matrix) {
		this.grid.draw(view_matrix, model_matrix);
		if (this.debug) {
			this.terna.draw(view_matrix, model_matrix);
		}
	}
}

