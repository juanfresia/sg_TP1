
function Surface() {	
	this.baseCurve = null;
	this.pathCurve = null;
	this.follow_normal = true;
	this.grid = new VertexGrid();

	this.setFollowNormal = function(bool) {
		this.follow_normal = bool;
	}
		
	this.create = function(c1, rows, c2, cols) {
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
		
		var base_orient = vec3.fromValues(1, 0, 0);
		
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
												
				this.grid.normal_buffer.push(base_norm[0]);
				this.grid.normal_buffer.push(base_norm[1]);
				this.grid.normal_buffer.push(base_norm[2]);
				
				this.grid.position_buffer.push(base_point[0]);
				this.grid.position_buffer.push(base_point[1]);
				this.grid.position_buffer.push(base_point[2]);
				
				this.grid.color_buffer.push(0.8/this.rows * i);
				this.grid.color_buffer.push(0.2);
				this.grid.color_buffer.push(0.8/this.cols * j);
			}
		}
		
		this.grid.setupWebGLBuffers();
	}
	
	this.draw = function() {
		this.grid.draw();
	}
}
