// La idea es meter acá las primitivas para crear los buffers: la grilla, las superficies de barrido y revolución que acepte curvas bajo el formato C(u) como parámetros junto con los niveles de discretización.

function VertexGrid() {	
	this.index_buffer = null;
	this.position_buffer = null;
	this.color_buffer = null;
	this.normal_buffer = null;
	
	this.webgl_position_buffer = null;
	this.webgl_color_buffer = null;
	this.webgl_index_buffer = null;
	this.webgl_normal_buffer = null;

	this.createIndexBuffer = function(rows, cols){
		this.index_buffer = [];
		
		// Itero en todas las filas menos en la última
		for(i = 0; i < (rows-1); i++) {
			if (i % 2 == 0) {
				// Swipe right
				for (j = 0; j < cols; j++) {
					this.index_buffer.push(i * cols + j);
					this.index_buffer.push((i+1) * cols + j);
				}
			} else {
				// Swipe left
				for (j = cols-1; j >= 0; j--) {
					this.index_buffer.push(i * cols + j);
					this.index_buffer.push((i+1) * cols + j);
				}
			}
		}	
		this.position_buffer = [];
		this.color_buffer = [];
		this.normal_buffer = [];
	}
	
	// Esta función crea e incializa los buffers dentro del pipeline para luego utlizarlos a la hora de renderizar.
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
		
		//console.log(this.position_buffer);
		//console.log(this.color_buffer);
	}

	this.draw = function(view_matrix, model_matrix){
		var tmp = mat4.create();
		mat4.identity(tmp);
		var norm_matrix = mat3.create();
		
		mat4.mul(tmp, model_matrix, view_matrix);
		mat3.fromMat4(norm_matrix, tmp);
		mat3.invert(norm_matrix, norm_matrix);
		mat3.transpose(norm_matrix, norm_matrix);	
		
		gl.uniformMatrix3fv(glShaderColor.uNMatrix, false, norm_matrix);
		gl.uniformMatrix4fv(glShaderColor.uMMatrix, false, model_matrix);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_position_buffer);
		gl.vertexAttribPointer(glShaderColor.aVertexPosition, 3, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_color_buffer);
		gl.vertexAttribPointer(glShaderColor.aVertexColor, 3, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_normal_buffer);
		gl.vertexAttribPointer(glShaderColor.aVertexNormal, 3, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.webgl_index_buffer);

		// Dibujamos.
		if (params.line_strip) {
			gl.drawElements(gl.LINE_STRIP, this.index_buffer.length, gl.UNSIGNED_SHORT, 0);
		} else {
			gl.drawElements(gl.TRIANGLE_STRIP, this.index_buffer.length, gl.UNSIGNED_SHORT, 0);
		}
	}
}
//