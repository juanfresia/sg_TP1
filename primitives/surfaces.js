
function Surface() {	
	this.baseCurve = null;
	this.pathCurve = null;
	this.follow_normal = true;
	this.grid = new VertexGrid();
	this.color = null;
	this.color_function = null;
	
	this.texture_function = null;
	this.texture_index_function = null;

	this.set_follow_normal = function(bool) {
		this.follow_normal = bool;
	}
				
	this.set_debug = function(debug) {
		this.debug = debug;
	}
	
	this.set_color = function(color) {
		this.color = color;
	}
	
	this.set_color_function = function(color_f) {
		this.color_function = color_f;
	}
	
	
	// La firma de la función es texture_f(point, col, row)
	// Permite decidir en base a la posición real del punto, o a su
	// ubicación relativa en la red.
	this.set_texture_function = function(texture_f) {
		this.texture_function = texture_f;
	}
	this.set_texture_index_function = function(texture_index_f) {
		this.texture_index_function = texture_index_f;
	}
	
	this.push_point = function(buffer, point, n) {
		buffer.push(point[0]);
		buffer.push(point[1]);
		if (n==2)
			return;
		buffer.push(point[2]);
	}
	
	this.create = function(path, rows, base, cols) {
		// Terna para debug
		this.debug = false;
		this.terna = new Terna();
		this.terna.create();
	
		this.cols = cols;
		this.rows = rows;
		
		this.pathCurve = path;
		this.baseCurve = base;

		this.grid.position_buffer = [];
		this.grid.color_buffer = [];
		this.grid.normal_buffer = [];
		this.grid.tangent_buffer = [];
	
		if (this.texture_function) {
			this.grid.texture_coord_buffer = [];
		}	
		if (this.texture_index_function) {
			this.grid.texture_index_buffer = [];
		}
	
		this.grid.createIndexBuffer(rows, cols);
		
		var len_c1 = path.length();
		var len_c2 = base.length();
		
		var base_orient = vec3.fromValues(0, 0, 1);
		
		for (i = 0; i < this.rows; i++) {
			var u1 = i*len_c1/(this.rows-1);
			var path_point = this.pathCurve.at(u1);
			var path_tan = this.pathCurve.tan_at(u1);
			var path_norm = this.pathCurve.norm_at(u1);
			
			var path_binorm = vec3.create();
			vec3.cross(path_binorm, path_tan, path_norm);
			
			vec3.normalize(path_binorm, path_binorm);
			vec3.normalize(path_tan, path_tan);
			vec3.normalize(path_norm, path_norm);
			
			var translate_mat = mat4.create();
			mat4.identity(translate_mat);
			mat4.translate(translate_mat, translate_mat, path_point);
			
			if (this.follow_normal) {
				var rotate_mat = mat3.create();
				for (var k = 0; k < 3; k++) {
					rotate_mat[k + 0] = path_binorm[k];
					rotate_mat[k + 3] = path_norm[k];
					rotate_mat[k + 6] = path_tan[k];
				}
			} else {
				var rotate_mat = mat3.create();
				mat3.identity(rotate_mat);
			}
			
			
			for (j = 0; j < this.cols; j++) {
				var u2 = j*len_c2/(this.cols-1);
				var base_point = this.baseCurve.at(u2);
				
				var base_norm = this.baseCurve.norm_at(u2);
				vec3.normalize(base_norm, base_norm);

				var base_tan = vec3.create();
				vec3.cross(base_tan, vec3.fromValues(0.0, 0.0, 1.0), base_norm);
				
				vec3.transformMat3(base_point, base_point, rotate_mat);
				vec3.transformMat4(base_point, base_point, translate_mat);
				vec3.transformMat3(base_norm, base_norm, rotate_mat);
				vec3.transformMat3(base_tan, base_tan, rotate_mat);
												
				
				this.push_point(this.grid.normal_buffer, base_norm);
				this.push_point(this.grid.position_buffer, base_point);
				this.push_point(this.grid.tangent_buffer, base_tan);
							
				if (this.color == null) {
					if (this.color_function == null) {
						this.grid.color_buffer.push(0.8/this.rows * i);
						this.grid.color_buffer.push(0.2);
						this.grid.color_buffer.push(0.8/this.cols * j);
					} else {
						this.push_point(this.grid.color_buffer, this.color_function(base_point));
					}
				} else {
					this.push_point(this.grid.color_buffer, this.color);
				}
				
				
				if (this.texture_function) {
					this.push_point(this.grid.texture_coord_buffer, this.texture_function(base_point, i ,j), 2);
				}
				if (this.texture_index_function) {
					this.grid.texture_index_buffer.push(this.texture_index_function(base_point, i ,j));
				}
				
			}
		}
		
		this.grid.setupWebGLBuffers();
	}
	
	
	this.create_from_shape = function(c1, rows, shape, shape_normals) {
		// Terna para debug
		this.debug = false;
		this.terna = new Terna();
		this.terna.create();
	
		this.cols = shape.length;
		this.rows = rows;
		
		this.pathCurve = c1;

		this.grid.position_buffer = [];
		this.grid.color_buffer = [];
		this.grid.normal_buffer = [];
		this.grid.tangent_buffer = [];
		
		if (this.texture_function) {
			this.grid.texture_coord_buffer = [];
		}
		if (this.texture_index_function) {
			this.grid.texture_index_buffer = [];
		}
	
		this.grid.createIndexBuffer(rows, this.cols);
		
		var len_c1 = c1.length();
		
		for (i = 0; i < this.rows; i++) {
			var u1 = i*len_c1/(this.rows-1);
			var path_point = this.pathCurve.at(u1);
			
			// Estos vectores definen el espacio de la curva path
			var path_tan = this.pathCurve.tan_at(u1);
			var path_norm = this.pathCurve.norm_at(u1);
			var path_binorm = vec3.create();
			vec3.cross(path_binorm, path_tan, path_norm);
			
			vec3.normalize(path_binorm, path_binorm);
			vec3.normalize(path_tan, path_tan);
			vec3.normalize(path_norm, path_norm);
			
			var translate_mat = mat4.create();
			mat4.identity(translate_mat);
			mat4.translate(translate_mat, translate_mat, path_point);
			
			if (this.follow_normal) {
				var rotate_mat = mat3.create();
				for (var k = 0; k < 3; k++) {
					rotate_mat[k + 0] = path_binorm[k];
					rotate_mat[k + 3] = path_norm[k];
					rotate_mat[k + 6] = path_tan[k];
				}
			} else {
				var rotate_mat = mat3.create();
				mat3.identity(rotate_mat);
			}
			
			for (j = 0; j < this.cols; j++) {
				var base_point = vec3.create();
				vec3.copy(base_point, shape[j]);
				
				var base_norm = vec3.create();
				vec3.copy(base_norm, shape_normals[j]);
				
				vec3.normalize(base_norm, base_norm);
				
				var base_tan = vec3.create();
				vec3.cross(base_tan, vec3.fromValues(0.0, 0.0, 1.0), base_norm);
				
				vec3.transformMat3(base_point, base_point, rotate_mat);
				vec3.transformMat4(base_point, base_point, translate_mat);
				
				vec3.transformMat3(base_norm, base_norm, rotate_mat);
				vec3.transformMat3(base_tan, base_tan, rotate_mat);
								
				this.push_point(this.grid.tangent_buffer, base_tan);
				this.push_point(this.grid.normal_buffer, base_norm);
				this.push_point(this.grid.position_buffer, base_point);
				
				if (this.color == null) {
					this.grid.color_buffer.push(0.8/this.rows * i);
					this.grid.color_buffer.push(0.2);
					this.grid.color_buffer.push(0.8/this.cols * j);
				} else {
					this.push_point(this.grid.color_buffer, this.color);
				}
				
				if (this.texture_function) {
					this.push_point(this.grid.texture_coord_buffer, this.texture_function(base_point, i ,j), 2);
				}
				if (this.texture_index_function) {
					this.grid.texture_index_buffer.push(this.texture_index_function(base_point, i ,j));
				}
			}
		}
		
		this.grid.setupWebGLBuffers();
	}
	
	
	
	this.draw = function(view_matrix, model_matrix) {
		if (this.grid.textures) {
			this.grid.draw_textured(view_matrix, model_matrix);
		} else {
			this.grid.draw(view_matrix, model_matrix);
		}
		if (this.debug) {
			this.terna.draw(view_matrix, model_matrix);
		}
		
	}
}
