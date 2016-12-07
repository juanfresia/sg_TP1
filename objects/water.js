
//Water.prototype.color = [85/255, 223/255, 245/255];
Water.prototype.color = [0.8, 0.8, 1.0];

function Water() {	
	this.terna = null;
	this.color = Water.prototype.color;
	this.debug = null;
	
	this.grid = null;
			
	this.push_point = function(buffer, point, n) {
		buffer.push(point[0]);
		buffer.push(point[1]);
		if (n==2)
			return;
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
		
		this.color = Water.prototype.color;
		
		var granularidad = 100;
		var ter_semi_ancho = params.ter_ancho/2.0;
		
		this.grid = new VertexGrid();
		this.grid.createIndexBuffer(granularidad+1, granularidad+1);
		this.grid.texture_coord_buffer = [];
		for (var i = 0; i <= granularidad; i++) {
			var x = - ter_semi_ancho + params.ter_ancho * i/granularidad;
			for (var j = 0; j <= granularidad; j++) {
				var y = - ter_semi_ancho + params.ter_ancho * j/granularidad;
				this.push_point(this.grid.position_buffer, [x, y, params.agua_alto]);
				this.push_point(this.grid.color_buffer, this.color);
				this.push_point(this.grid.texture_coord_buffer, [1.0 - x/ter_semi_ancho, y/ter_semi_ancho], 2);	
			}
		}
		

					
		this.grid.cubemap = glTextures["skyboxCM"];
		
		this.grid.textures = [];
		this.grid.textures[0] = loadTexture("textures/water_norm.jpg");
		
		this.grid.setupWebGLBuffers();
	}
		
	this.draw = function(view_matrix, model_matrix) {
		this.grid.draw_water(view_matrix, model_matrix);
		if (this.debug) {
			this.terna.draw(view_matrix, model_matrix);
		}
	}
}

