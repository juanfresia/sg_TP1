// La idea es meter acá las primitivas para crear los buffers: la grilla, las superficies de barrido y revolución que acepte curvas bajo el formato C(u) como parámetros junto con los niveles de discretización.

function VertexGrid() {	
	this.index_buffer = null;
	this.position_buffer = null;
	this.color_buffer = null;
	this.normal_buffer = null;
	this.tangent_buffer = null;
	
	this.webgl_position_buffer = null;
	this.webgl_color_buffer = null;
	this.webgl_index_buffer = null;
	this.webgl_normal_buffer = null;
	this.webgl_tangent_buffer = null;
	
	
	// Cosas para texturas
	this.texture_coord_buffer = null;
	this.webgl_texture_coord_buffer = null;
	
	// Segundo set de coordenadas, si es necesario
	this.texture_coord_2_buffer = null;
	this.webgl_texture_coord_2_buffer = null;
	
	this.texture_index_buffer = null;
	this.webgl_texture_index_buffer = null;
	
	this.textures = null;
	
	this.specular = null;
	
	
	// Plot en 2D
	this.position_buffer_2D = null;
	this.index_buffer_2D = null;

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
		this.tangent_buffer = [];
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
		
		if (this.normal_buffer) {
			this.webgl_normal_buffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_normal_buffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normal_buffer), gl.STATIC_DRAW);
		}
		
		// Si hay array de tangentes, creo un buffer para las tangentes
		if (this.tangent_buffer) {
			this.webgl_tangent_buffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_tangent_buffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.tangent_buffer), gl.STATIC_DRAW);
		}
		
		// Si hay algun array de coordenadas de texturas, creo un bufer
		if (this.texture_coord_buffer) {
			this.webgl_texture_coord_buffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_texture_coord_buffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.texture_coord_buffer), gl.STATIC_DRAW);
		}
		
		// Si hay algun array de coordenadas de texturas, creo un bufer
		if (this.texture_coord_2_buffer) {
			this.webgl_texture_coord_2_buffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_texture_coord_2_buffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.texture_coord_2_buffer), gl.STATIC_DRAW);
		}
		
		// Si hay algun array de indice de texturas, creo un bufer
		if (this.texture_index_buffer) {
			this.webgl_texture_index_buffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_texture_index_buffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.texture_index_buffer), gl.STATIC_DRAW);
		}
	}

	this.draw = function(view_matrix, model_matrix){
		gl.useProgram(glShaderColor);
		
		var norm_matrix = mat3.create();
		
		//mat4.mul(tmp, model_matrix, view_matrix);
		mat3.fromMat4(norm_matrix, model_matrix);
		mat3.invert(norm_matrix, norm_matrix);
		mat3.transpose(norm_matrix, norm_matrix);
		
		gl.uniformMatrix4fv(glShaderColor.uVMatrix, false, view_matrix);
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
	
	
	// Para dibujar cosas con textura única o con un índice de texturas
	this.draw_textured = function(view_matrix, model_matrix) {
		if (this.texture_index_buffer)
			glShaderGeneric = glShaders["multi_texture"];
		else
			glShaderGeneric = glShaders["single_texture"];
		
		if (this.specular && params.specular) {
			glShaderGeneric = glShaders["specular"];
		}
		
		gl.useProgram(glShaderGeneric);
		gl.enableVertexAttribArray(glShaderGeneric.aVertexUV);
		gl.enableVertexAttribArray(glShaderGeneric.aVertexTangent);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_texture_coord_buffer);
		gl.vertexAttribPointer(glShaderGeneric.aVertexUV, 2, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_tangent_buffer);
		gl.vertexAttribPointer(glShaderGeneric.aVertexTangent, 3, gl.FLOAT, false, 0, 0);
		
		if (this.texture_index_buffer) {
			gl.enableVertexAttribArray(glShaderGeneric.aTextureIndex);
			
			gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_texture_index_buffer);
			gl.vertexAttribPointer(glShaderGeneric.aTextureIndex, 1, gl.FLOAT, false, 0, 0);
		}
		
		var norm_matrix = mat3.create();
		
		mat3.fromMat4(norm_matrix, model_matrix);
		mat3.invert(norm_matrix, norm_matrix);
		mat3.transpose(norm_matrix, norm_matrix);
		
		gl.uniformMatrix4fv(glShaderGeneric.uVMatrix, false, view_matrix);
		gl.uniformMatrix3fv(glShaderGeneric.uNMatrix, false, norm_matrix);
		gl.uniformMatrix4fv(glShaderGeneric.uMMatrix, false, model_matrix);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_position_buffer);
		gl.vertexAttribPointer(glShaderGeneric.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_color_buffer);
		gl.vertexAttribPointer(glShaderGeneric.aVertexColor, 3, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_normal_buffer);
		gl.vertexAttribPointer(glShaderGeneric.aVertexNormal, 3, gl.FLOAT, false, 0, 0);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.textures[0]);
		gl.uniform1i(glShaderGeneric.uSampler1, 0);
		
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, this.textures[1]);
		gl.uniform1i(glShaderGeneric.uSampler2, 1);
		
		if (this.texture_index_buffer) {
			gl.activeTexture(gl.TEXTURE2);
			gl.bindTexture(gl.TEXTURE_2D, this.textures[2]);
			gl.uniform1i(glShaderGeneric.uSampler3, 2);
			
			gl.activeTexture(gl.TEXTURE3);
			gl.bindTexture(gl.TEXTURE_2D, this.textures[3]);
			gl.uniform1i(glShaderGeneric.uSampler4, 3);
		}
		
		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.webgl_index_buffer);
				
		if (params.line_strip) {
			gl.drawElements(gl.LINE_STRIP, this.index_buffer.length, gl.UNSIGNED_SHORT, 0);
		} else {
			gl.drawElements(gl.TRIANGLE_STRIP, this.index_buffer.length, gl.UNSIGNED_SHORT, 0);
		}

		gl.disableVertexAttribArray(glShaderGeneric.aVertexTangent);
		gl.disableVertexAttribArray(glShaderGeneric.aVertexUV);
		
		if (this.texture_index_buffer) {
			gl.disableVertexAttribArray(glShaderGeneric.aTextureIndex);
		}
				
	}
	
	
	
	// Para dibujar el terreno (shader especial)
	this.draw_terrain = function(view_matrix, model_matrix) {
		glShaderGeneric = glShaders["terrain"];
		
		gl.useProgram(glShaderGeneric);
		gl.enableVertexAttribArray(glShaderGeneric.aVertexUV);
		gl.enableVertexAttribArray(glShaderGeneric.aVertexUVBig);
		gl.enableVertexAttribArray(glShaderGeneric.aVertexTangent);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_texture_coord_buffer);
		gl.vertexAttribPointer(glShaderGeneric.aVertexUV, 2, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_texture_coord_2_buffer);
		gl.vertexAttribPointer(glShaderGeneric.aVertexUVBig, 2, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_tangent_buffer);
		gl.vertexAttribPointer(glShaderGeneric.aVertexTangent, 3, gl.FLOAT, false, 0, 0);

		var norm_matrix = mat3.create();
		
		mat3.fromMat4(norm_matrix, model_matrix);
		mat3.invert(norm_matrix, norm_matrix);
		mat3.transpose(norm_matrix, norm_matrix);
		
		gl.uniformMatrix4fv(glShaderGeneric.uVMatrix, false, view_matrix);
		gl.uniformMatrix3fv(glShaderGeneric.uNMatrix, false, norm_matrix);
		gl.uniformMatrix4fv(glShaderGeneric.uMMatrix, false, model_matrix);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_position_buffer);
		gl.vertexAttribPointer(glShaderGeneric.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_color_buffer);
		gl.vertexAttribPointer(glShaderGeneric.aVertexColor, 3, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_normal_buffer);
		gl.vertexAttribPointer(glShaderGeneric.aVertexNormal, 3, gl.FLOAT, false, 0, 0);


		// Cargo las texturas
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.textures[0]);
		gl.uniform1i(glShaderGeneric.uSamplerSand, 0);
		
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, this.textures[1]);
		gl.uniform1i(glShaderGeneric.uSamplerSandNorm, 1);
		
		gl.activeTexture(gl.TEXTURE2);
		gl.bindTexture(gl.TEXTURE_2D, this.textures[2]);
		gl.uniform1i(glShaderGeneric.uSamplerGrass, 2);
		
		gl.activeTexture(gl.TEXTURE3);
		gl.bindTexture(gl.TEXTURE_2D, this.textures[3]);
		gl.uniform1i(glShaderGeneric.uSamplerGrassNorm, 3);
		
		gl.activeTexture(gl.TEXTURE4);
		gl.bindTexture(gl.TEXTURE_2D, this.textures[4]);
		gl.uniform1i(glShaderGeneric.uSamplerStone, 4);
		
		gl.activeTexture(gl.TEXTURE5);
		gl.bindTexture(gl.TEXTURE_2D, this.textures[5]);
		gl.uniform1i(glShaderGeneric.uSamplerStoneNorm, 5);
		
		gl.activeTexture(gl.TEXTURE6);
		gl.bindTexture(gl.TEXTURE_2D, this.textures[6]);
		gl.uniform1i(glShaderGeneric.uSamplerAlt, 6);
		
		gl.activeTexture(gl.TEXTURE7);
		gl.bindTexture(gl.TEXTURE_2D, this.textures[7]);
		gl.uniform1i(glShaderGeneric.uSamplerAltNorm, 7);
		
		gl.activeTexture(gl.TEXTURE8);
		gl.bindTexture(gl.TEXTURE_2D, this.textures[8]);
		gl.uniform1i(glShaderGeneric.uSamplerBlend, 8);
		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.webgl_index_buffer);
				
		if (params.line_strip) {
			gl.drawElements(gl.LINE_STRIP, this.index_buffer.length, gl.UNSIGNED_SHORT, 0);
		} else {
			gl.drawElements(gl.TRIANGLE_STRIP, this.index_buffer.length, gl.UNSIGNED_SHORT, 0);
		}

		gl.disableVertexAttribArray(glShaderGeneric.aVertexTangent);
		gl.disableVertexAttribArray(glShaderGeneric.aVertexUV);
		gl.disableVertexAttribArray(glShaderGeneric.aVertexUVBig);
	
	}
	
	
	
	
	
	// Exactamente que la funcion draw, pero fuerza a graficar una línea (usar para ver las curvas de las superficies de barrido)
	this.draw_line = function(view_matrix, model_matrix){
		
		gl.useProgram(glShaderColor);
		
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
		gl.drawElements(gl.LINE_STRIP, this.index_buffer.length, gl.UNSIGNED_SHORT, 0);
				
	}
	
	
	
	this.draw_water = function(view_matrix, model_matrix){
		glShaderWater = glShaders["water"];
		
		gl.useProgram(glShaderWater);
		gl.uniformMatrix4fv(glShaderWater.uVMatrix, false, view_matrix);
		var norm_matrix = mat3.create();
		
		//mat4.mul(tmp, model_matrix, view_matrix);
		
		var tmp = mat4.create();
		
		mat3.fromMat4(norm_matrix, model_matrix);
		mat3.invert(norm_matrix, norm_matrix);
		mat3.transpose(norm_matrix, norm_matrix);
		
		gl.uniformMatrix3fv(glShaderWater.uNMatrix, false, norm_matrix);
		gl.uniformMatrix4fv(glShaderWater.uMMatrix, false, model_matrix);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_position_buffer);
		gl.vertexAttribPointer(glShaderWater.aVertexPosition, 3, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_color_buffer);
		gl.vertexAttribPointer(glShaderWater.aVertexColor, 3, gl.FLOAT, false, 0, 0);

		gl.enableVertexAttribArray(glShaderWater.aVertexUV);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_texture_coord_buffer);
		gl.vertexAttribPointer(glShaderWater.aVertexUV, 2, gl.FLOAT, false, 0, 0);
		
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.textures[0]);
		gl.uniform1i(glShaderWater.uSamplerNormal, 0);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.webgl_index_buffer);

		// Dibujamos.
		if (params.line_strip) {
			gl.drawElements(gl.LINE_STRIP, this.index_buffer.length, gl.UNSIGNED_SHORT, 0);
		} else {
			gl.drawElements(gl.TRIANGLE_STRIP, this.index_buffer.length, gl.UNSIGNED_SHORT, 0);
		}
		
		//gl.disableVertexAttribArray(glShaderWater.aVertexUV);
	}

	
	
	
	
	
// -------------------------------------------
//	Especial para canvas en 2D
// -------------------------------------------


	this.setup2Dbuffers = function() {
	
		this.position_buffer_2D = curve_gl.createBuffer();
		curve_gl.bindBuffer(curve_gl.ARRAY_BUFFER, this.position_buffer_2D);
		curve_gl.bufferData(curve_gl.ARRAY_BUFFER, new Float32Array(this.position_buffer), curve_gl.STATIC_DRAW);
		this.position_buffer_2D.itemSize = 3;
		this.position_buffer_2D.numItems = this.position_buffer.length/3;

		
		this.index_buffer_2D = curve_gl.createBuffer();
		curve_gl.bindBuffer(curve_gl.ELEMENT_ARRAY_BUFFER, this.index_buffer_2D);
		curve_gl.bufferData(curve_gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.index_buffer), curve_gl.STATIC_DRAW);
		
	}
	this.draw_2D = function() {
		if (this.position_buffer_2D == null) {
			this.setup2Dbuffers();
		}
		curve_gl.bindBuffer(curve_gl.ARRAY_BUFFER, this.position_buffer_2D);
		curve_gl.vertexAttribPointer(curve_shader.aVertexPosition, 3, curve_gl.FLOAT, false, 0, 0);
		
		curve_gl.bindBuffer(curve_gl.ELEMENT_ARRAY_BUFFER, this.index_buffer_2D);

		// Dibujamos.
		curve_gl.drawElements(curve_gl.LINE_STRIP, this.index_buffer.length, curve_gl.UNSIGNED_SHORT, 0);
	}
}
