

function Surface() {
	this.cols = 0;
	this.rows = 0;
	
	this.baseCurve = null;
	this.pathCurve = null;
	
	this.follow_normal = true;

	this.index_buffer = null;
	this.position_buffer = null;
	this.color_buffer = null;
	this.normal_buffer = null;

	this.webgl_position_buffer = null;
	this.webgl_color_buffer = null;
	this.webgl_index_buffer = null;
	this.webgl_normal_buffer = null;

	this.setFollowNormal = function(bool) {
		this.follow_normal = bool;
	}
	
	this.createIndexBuffer = function(){
		this.index_buffer = [];
		next = 0;
		
		// Itero en todas las filas menos en la última
		for(i = 0; i < (this.rows-1); i++) {
			if (i % 2 == 0) {
				// Swipe right
				for (j = 0; j < this.cols; j++) {
					this.index_buffer.push(i * this.cols + j);
					this.index_buffer.push((i+1) * this.cols + j);
				}
			} else {
				// Swipe left
				for (j = this.cols-1; j >= 0; j--) {
					this.index_buffer.push(i * this.cols + j);
					this.index_buffer.push((i+1) * this.cols + j);
				}
			}
		}
	}
	
	
	this.create = function(c1, rows, c2, cols) {
		this.cols = cols;
		this.rows = rows;
		
		this.pathCurve = c1;
		this.baseCurve = c2;

		this.position_buffer = [];
		this.color_buffer = [];
		this.normal_buffer = [];
	
		this.createIndexBuffer();
		
		var len_c1 = c1.lenght();
		var len_c2 = c2.lenght();
		
		var base_orient = vec3.fromValues(1, 0, 0);
		
		for (i = 0; i < this.rows; i++) {
			var u1 = i*len_c1/(this.rows-1);
			var path_point = this.pathCurve.at(u1);
			var path_tan = this.pathCurve.tan_at(u1);
				
			var tmp_mat = mat4.create();
			mat4.identity(tmp_mat);
						
			// Obtengo la tangente del camino normalizada
			vec3.normalize(path_tan, this.pathCurve.tan_at(u1));
			// El ángulo y la dirección.
			var axis = vec3.create();
			vec3.cross(axis, path_tan, base_orient);
			var angle = Math.acos(vec3.dot(path_tan, base_orient));
			
			mat4.translate(tmp_mat, tmp_mat, path_point);
			if (this.follow_normal && angle != 0) {
				mat4.rotate(tmp_mat, tmp_mat, -angle, axis);
			}
									
			
			for (j = 0; j < this.cols; j++) {
				var u2 = j*len_c2/(this.cols-1);
				var base_point = this.baseCurve.at(u2);
				var base_norm = this.baseCurve.norm_at(u2);

				vec3.transformMat4(base_point, base_point, tmp_mat);
												
				this.normal_buffer.push(base_norm[0]);
				this.normal_buffer.push(base_norm[1]);
				this.normal_buffer.push(base_norm[2]);
				
				this.position_buffer.push(base_point[0]);
				this.position_buffer.push(base_point[1]);
				this.position_buffer.push(base_point[2]);
	
				this.color_buffer.push(1.0/this.rows * i);
				this.color_buffer.push(0.2);
				this.color_buffer.push(1.0/this.cols * j);
			}
		}
	}
	
	this.setupWebGLBuffers = function() {
		this.webgl_position_buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_position_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.position_buffer), gl.STATIC_DRAW);
		this.webgl_position_buffer.itemSize = 3;
		this.webgl_position_buffer.numItems = this.position_buffer.length/3;

		this.webgl_color_buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_color_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.color_buffer), gl.STATIC_DRAW);   

		this.webgl_index_buffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.webgl_index_buffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.index_buffer), gl.STATIC_DRAW);
		
		this.webgl_normal_buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_normal_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normal_buffer), gl.STATIC_DRAW);
		
		console.log(this.position_buffer);
		console.log(this.color_buffer);
	}

	this.draw = function(){

		var vertexPositionAttribute = gl.getAttribLocation(glProgram, "aVertexPosition");
		gl.enableVertexAttribArray(vertexPositionAttribute);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_position_buffer);
		gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

		var vertexColorAttribute = gl.getAttribLocation(glProgram, "aVertexColor");
		gl.enableVertexAttribArray(vertexColorAttribute);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_color_buffer);
		gl.vertexAttribPointer(vertexColorAttribute, 3, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.webgl_index_buffer);

		// Dibujamos.
		gl.drawElements(gl.TRIANGLE_STRIP, this.index_buffer.length, gl.UNSIGNED_SHORT, 0);
	}
}