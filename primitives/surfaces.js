
function Surface() {	
	this.baseCurve = null;
	this.pathCurve = null;
	this.follow_normal = true;
	this.grid = new VertexGrid();
	this.color = null;

	this.set_follow_normal = function(bool) {
		this.follow_normal = bool;
	}
				
	this.set_debug = function(debug) {
		this.debug = debug;
	}
	
	this.set_color = function(color) {
		this.color = color;
	}
	
	this.push_point = function(buffer, point) {
		buffer.push(point[0]);
		buffer.push(point[1]);
		buffer.push(point[2]);
	}
	
	this.create = function(c1, rows, c2, cols) {
		// Terna para debug
		this.debug = true;
		this.terna = new Terna();
		this.terna.create();
	
		this.cols = cols;
		this.rows = rows;
		
		this.pathCurve = c1;
		this.baseCurve = c2;

		this.grid.position_buffer = [];
		this.grid.color_buffer = [];
		this.grid.normal_buffer = [];
	
		this.grid.createIndexBuffer(rows, cols);
		
		var len_c1 = c1.length();
		var len_c2 = c2.length();
		
		var base_orient = vec3.fromValues(0, 0, 1);
		
		for (i = 0; i < this.rows; i++) {
			var u1 = i*len_c1/(this.rows-1);
			var path_point = this.pathCurve.at(u1);
			var path_tan = this.pathCurve.tan_at(u1);

			var translate_mat = mat4.create();
			var rotate_mat = mat4.create();
			mat4.identity(translate_mat);
			mat4.identity(rotate_mat);
						
			// Obtengo la tangente del camino normalizada
			vec3.normalize(path_tan, this.pathCurve.tan_at(u1));
			// El ángulo y la dirección.
			var axis = vec3.create();
			vec3.cross(axis, path_tan, base_orient);
			var angle = Math.acos(vec3.dot(path_tan, base_orient));
			
			mat4.translate(translate_mat, translate_mat, path_point);
			if (this.follow_normal && angle != 0) {
				mat4.rotate(rotate_mat, rotate_mat, -angle, axis);
			}
			
			for (j = 0; j < this.cols; j++) {
				var u2 = j*len_c2/(this.cols-1);
				var base_point = this.baseCurve.at(u2);
				
				var base_norm = this.baseCurve.norm_at(u2);
				vec3.normalize(base_norm, base_norm);

				vec3.transformMat4(base_point, base_point, rotate_mat);
				vec3.transformMat4(base_point, base_point, translate_mat);
				vec3.transformMat4(base_norm, base_norm, rotate_mat);
												
												
				this.push_point(this.grid.normal_buffer, base_norm);
				this.push_point(this.grid.position_buffer, base_point);
							
				if (this.color == null) {
					this.grid.color_buffer.push(0.8/this.rows * i);
					this.grid.color_buffer.push(0.2);
					this.grid.color_buffer.push(0.8/this.cols * j);
				} else {
					this.push_point(this.grid.color_buffer, this.color);
				}
			}
		}
		
		this.grid.setupWebGLBuffers();
	}
	
	
	this.create_from_shape = function(c1, rows, shape, shape_normals) {
		// Terna para debug
		this.debug = true;
		this.terna = new Terna();
		this.terna.create();
	
		this.cols = shape.length;
		this.rows = rows;
		
		this.pathCurve = c1;

		this.grid.position_buffer = [];
		this.grid.color_buffer = [];
		this.grid.normal_buffer = [];
	
		this.grid.createIndexBuffer(rows, this.cols);
		
		var len_c1 = c1.length();
		
		for (i = 0; i < this.rows; i++) {
			var u1 = i*len_c1/(this.rows-1);
			var path_point = this.pathCurve.at(u1);
			var path_tan = this.pathCurve.tan_at(u1);
			var path_norm = this.pathCurve.norm_at(u1);
				
			var base_tan = vec3.fromValues(0, 0, 1);
			var base_up = vec3.fromValues(0, 1, 0);
		
			var translate_mat = mat4.create();
			var rotate_mat = mat4.create();
			mat4.identity(translate_mat);
			mat4.identity(rotate_mat);
						
			// Normalizo la tangente del camino normalizada
			vec3.normalize(path_tan, path_tan);
			
			// El ángulo y la dirección.
			var axis = vec3.create();
			vec3.cross(axis, path_tan, base_tan);
			var angle = Math.acos(vec3.dot(base_tan, path_tan));
									
			mat4.translate(translate_mat, translate_mat, path_point);
			if (this.follow_normal && angle != 0) {			
				mat4.rotate(rotate_mat, rotate_mat, angle, axis);
				
				var tmp = vec3.create();
				vec3.transformMat4(tmp, base_up, rotate_mat);
				vec3.normalize(tmp, tmp);
				
				vec3.cross(axis, path_norm, tmp);
				angle = Math.acos(vec3.dot(tmp, path_norm));
				var segunda_rotacion = mat4.create();
				mat4.identity(segunda_rotacion);
				mat4.rotate(segunda_rotacion, segunda_rotacion, -angle, axis);
				
				mat4.mul(rotate_mat, segunda_rotacion, rotate_mat);
			}
			
			for (j = 0; j < this.cols; j++) {
				var base_point = vec3.create();
				vec3.copy(base_point, shape[j]);
				var base_norm = vec3.create();
				vec3.copy(base_norm, shape_normals[j]);
				
				vec3.normalize(base_norm, base_norm);

				vec3.transformMat4(base_point, base_point, rotate_mat);
				vec3.transformMat4(base_point, base_point, translate_mat);
				vec3.transformMat4(base_norm, base_norm, rotate_mat);
												
				this.push_point(this.grid.normal_buffer, base_norm);
				this.push_point(this.grid.position_buffer, base_point);
				
				if (this.color == null) {
					this.grid.color_buffer.push(0.8/this.rows * i);
					this.grid.color_buffer.push(0.2);
					this.grid.color_buffer.push(0.8/this.cols * j);
				} else {
					this.push_point(this.grid.color_buffer, this.color);
				}
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
