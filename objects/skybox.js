SkyBox.prototype.color = [0.8, 0.8, 1.0];
SkyBox.prototype.STEP_THETA = 200;
SkyBox.prototype.STEP_PHI = 200;

function SkyBox() {
	this.terna = null;
	this.color = SkyBox.prototype.color;
	this.debug = null;
	
	this.sides = [];
	this.sides_mat = [];
	
	
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
	
	
	// Crea un rectángulo en el eje xy, con normales en z
	this.create_rectangle = function(size) {
		var rect = new VertexGrid();
		
		rect.createIndexBuffer(2, 2);
		
		// Son solo 4 vértices!
		this.push_point(rect.position_buffer, [-size, -size, 0.0]);
		this.push_point(rect.position_buffer, [size, -size, 0.0]);
		this.push_point(rect.position_buffer, [-size, size, 0.0]);
		this.push_point(rect.position_buffer, [size, size, 0.0]);
		
		for (var i = 0; i <= 3; i++) {
			this.push_point(rect.normal_buffer, [0.0, 0.0, 1.0]);
			this.push_point(rect.color_buffer, SkyBox.prototype.color);
			this.push_point(rect.tangent_buffer, [1.0, 0.0, 0.0]);
		}
		
		rect.texture_coord_buffer = [];
		
		this.push_point(rect.texture_coord_buffer, [0.0, 1.0], 2);
		this.push_point(rect.texture_coord_buffer, [1.0, 1.0], 2);
		this.push_point(rect.texture_coord_buffer, [0.0, 0.0], 2);
		this.push_point(rect.texture_coord_buffer, [1.0, 0.0], 2);
				
		rect.setupWebGLBuffers();
		return rect;
	}
	
	
	
	
	this.create = function(radio) {
		// Terna para debug
		this.debug = false;
		this.terna = new Terna();
		this.terna.create();
		
		
		for (var i = 0; i <= 5; i++) {
			this.sides[i] = this.create_rectangle(radio);
			this.sides[i].textures = [];
			this.sides_mat[i] = mat4.create();
		}
		
		this.sides[0].textures[0] = glTextures["sky_lf"];
		mat4.translate(this.sides_mat[0], this.sides_mat[0], [0.0, 0.0, -radio]);
		
		this.sides[1].textures[0] = glTextures["sky_bk"];
		mat4.translate(this.sides_mat[1], this.sides_mat[1], [radio, 0.0, 0.0]);
		mat4.rotate(this.sides_mat[1], this.sides_mat[1], Math.PI/2, [0.0, -1.0, 0.0]);
		
		this.sides[2].textures[0] = glTextures["sky_rt"];
		mat4.translate(this.sides_mat[2], this.sides_mat[2], [0.0, 0.0, radio]);
		mat4.rotate(this.sides_mat[2], this.sides_mat[2], Math.PI, [0.0, -1.0, 0.0]);
		
		this.sides[3].textures[0] = glTextures["sky_ft"];
		mat4.translate(this.sides_mat[3], this.sides_mat[3], [-radio, 0.0, 0.0]);
		mat4.rotate(this.sides_mat[3], this.sides_mat[3], Math.PI/2, [0.0, 1.0, 0.0]);
		
		this.sides[4].textures[0] = glTextures["sky_up"];
		mat4.translate(this.sides_mat[4], this.sides_mat[4], [0.0, radio, 0.0]);
		mat4.rotate(this.sides_mat[4], this.sides_mat[4], Math.PI, [0.0, 1.0, 0.0]);
		mat4.rotate(this.sides_mat[4], this.sides_mat[4], Math.PI/2, [1.0, 0.0, 0.0]);
		
		this.sides[5].textures[0] = glTextures["sky_dn"];
		mat4.translate(this.sides_mat[5], this.sides_mat[5], [0.0, -radio, 0.0]);
		mat4.rotate(this.sides_mat[5], this.sides_mat[5], Math.PI, [0.0, 1.0, 0.0]);
		mat4.rotate(this.sides_mat[5], this.sides_mat[5], Math.PI/2, [-1.0, 0.0, 0.0]);
				
		
		for (var i = 0; i <= 5; i++) {
			this.sides[i].textures[1] = glTextures["uniform"];
		}
	}
	
	this.draw = function(view_matrix, model_matrix) {
		var tmp = mat4.create();
		
		for (var i = 0; i <= 5; i++) {
			var tmp = mat4.create();
			mat4.copy(tmp, model_matrix);
			mat4.mul(tmp, model_matrix, this.sides_mat[i]);
			this.sides[i].draw_skybox(view_matrix, tmp, [1.0, 1.0, 1.0]);
		}
		if (this.debug) {
			this.terna.draw(view_matrix, tmp);
		}
	}
	
	
}
