
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
	
	
	this.textura_tensor = function(pos, col, row) {
		var coords = vec2.create();
	
		coords[0] = 1.0 - row/20.0;
		coords[1] = 1.0 - pos[1] * 10.0;
		
		return coords;
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
		
		this.superficie.grid.cubemap = glTextures["skyboxCM"];
		
		this.superficie.set_texture_function(this.textura_tensor);
		this.superficie.grid.specular = true;
		this.superficie.grid.textures = [];
		this.superficie.grid.textures[0] = glTextures["tensor"];
		this.superficie.grid.textures[1] = glTextures["tensor_norm"];
		
		this.superficie.create(this.path, 5, this.base, 20);				
	}
		
	
	this.draw = function(view_matrix, model_matrix) {
		this.superficie.draw(view_matrix, model_matrix);
		if (this.debug) {
			this.terna.draw(view_matrix, model_matrix);
		}
	}
}

