SkyBox.prototype.color = [0.8, 0.8, 1.0];
SkyBox.prototype.STEP_THETA = 200;
SkyBox.prototype.STEP_PHI = 200;

function SkyBox() {
	this.terna = null;
	this.color = SkyBox.prototype.color;
	this.debug = null;
		
	
	this.semicircle = null;
	this.semicircle_normals = null;
	this.surface = null;
		
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
		
	this.texture_function = function(pos, col, row) {
		var coords = vec2.create();
		
		coords[0] = 1.0 - col/SkyBox.prototype.STEP_THETA;
		coords[1] = 1.0 - row/SkyBox.prototype.STEP_PHI;

		return coords;
	}
	
	
	this.create_semicircle = function(radio) {
		this.semicircle = [];
		this.semicircle_normals = [];
		for (var i = Math.PI/2.0; i <= Math.PI; i += Math.PI / (this.STEP_PHI*2.0)) {
			var x = Math.cos(i) * radio;
			var y = Math.sin(i) * radio;
			this.semicircle.push([x, y, 0.0]);
			this.semicircle_normals.push([-x, -y, 0.0]);
		}
	}
	
	
	this.create = function(radio) {
		// Terna para debug
		this.debug = false;
		this.terna = new Terna();
		this.terna.create();
		
		this.color = SkyBox.prototype.color;
		
		this.create_semicircle(radio);
		
		var revolve = new Circumference();
		revolve.create(0.0);
		
		
		this.surface = new Surface();
		this.surface.set_follow_normal(true);
		this.surface.set_color(this.color);
		
		this.surface.set_texture_function(this.texture_function);
		this.surface.grid.textures = [];
		this.surface.grid.textures[0] = loadTexture("textures/skybox.jpg");
		this.surface.grid.textures[1] = loadTexture("textures/uniform.jpg");
		
		this.surface.create_from_shape(revolve, this.STEP_THETA, this.semicircle, this.semicircle_normals);

	}
	
	this.draw = function(view_matrix, model_matrix) {
		var tmp = mat4.create();
		mat4.copy(tmp, model_matrix);
		mat4.translate(tmp, tmp, [0.0, -200.0, 0.0]);
		mat4.rotate(tmp, tmp, Math.PI/4, [0.0, 1.0, 0.0]);
		mat4.rotate(tmp, tmp, Math.PI/2, [-1.0, 0.0, 0.0]);
		this.surface.draw(view_matrix, tmp);
		if (this.debug) {
			this.terna.draw(view_matrix, tmp);
		}
	}
	
	
}
