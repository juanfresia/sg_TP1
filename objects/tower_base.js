// Define la pieza que compondrá las torres del puente. Resulta de una interpolación lineal de puntos en forma de hache.

TowerBase.prototype.color = [1.0,0.0,0.0];

function TowerBase() {	
	this.grid = new VertexGrid();
	this.terna = null;
	this.color = TowerBase.prototype.color;
	
	this.texture = null;
	this.texture2 = null;
	this.texture3 = null;
	
	this.tangent_buffer = null;
	this.webgl_tangent_buffer = null;
	
	this.textureCoords = null;
	this.webgl_texture_buffer = null;
	
	this.reduccion = null;
	this.alto = null;
	this.x_out = null;
	this.y_out = null;
	this.x_in = null;
	this.y_in = null;
	this.z = null;
	
	this.debug = null;
			
	this.push_point = function(buffer, point, n) {
		if (n==null)
			n=3;
		buffer.push(point[0]);
		buffer.push(point[1]);
		if (n==3)
			buffer.push(point[2]);
	}
	
	this.set_color = function(color) {
		this.color = color;
	}
	
	this.set_debug = function(debug) {
		this.debug = debug;
	}
	

	this.create = function(x_out, y_out, x_in, y_in, reduccion, alto) {
		
		// Terna para debug
		this.terna = new Terna();
		this.terna.create();
		this.debug = false;
				
		this.textureCoords = [];
		this.tangent_buffer = [];
		// Setup de buffers y de la grid
		this.grid.position_buffer = [];
		this.grid.color_buffer = [];
		this.grid.normal_buffer = [];
		
		// El perfil de la columna tiene 24 puntos, y dos niveles
		this.grid.createIndexBuffer(2, 24);
	
		// Color y parámetros de la viga
		this.reduccion = reduccion;
		this.alto = alto;
		
		this.x_out = [x_out, x_out * this.reduccion];
		this.y_out = [y_out, y_out * this.reduccion];
		
		this.x_in = [x_in, x_in + (1-this.reduccion)/2];
		this.y_in = [y_in, y_in*this.reduccion];

		if (this.reduccion == 0) {
			this.x_out[1] = x_out/2;
			this.y_out[1] = 0;
			this.x_in[1] = x_out/2;
			this.y_in[1] = 0;
		}
		
		this.z = [0.0, this.alto];
				
		var normal1 = vec3.fromValues(0.0, this.z[1], 1-this.y_out[1]);
		var normal2 = vec3.fromValues(-this.z[1], 0, 1-this.x_out[1]);
		var normal3 = vec3.fromValues(this.z[1], 0, 1-this.x_out[1]);
		var normal4 = vec3.fromValues(0.0, -this.z[1], 1-this.y_out[1]);
				
		var tangent1 = vec3.fromValues(-normal1[1], normal1[0], 0.0);
		var tangent2 = vec3.fromValues(-normal2[1], normal2[0], 0.0);
		var tangent3 = vec3.fromValues(-normal3[1], normal3[0], 0.0);
		var tangent4 = vec3.fromValues(-normal4[1], normal4[0], 0.0);
				
		var REPEATS = 4;
				
		// Voy a insertar los puntos dos veces, para poder definirle dos normales a cada uno de manera de crear un facetado.
		for (i = 0; i <= 1; i++) {
			// Primer cuadrante
			this.push_point(this.grid.position_buffer, [this.x_out[i], this.y_out[i], this.z[i]]);
			this.push_point(this.grid.normal_buffer, normal1);
			this.push_point(this.tangent_buffer, tangent1);
			this.push_point(this.textureCoords, [1.0, i*REPEATS], 2);
			
			this.push_point(this.grid.position_buffer, [this.x_in[i], this.y_out[i], this.z[i]]);
			this.push_point(this.grid.normal_buffer, normal1);
			this.push_point(this.tangent_buffer, tangent1);
			this.push_point(this.grid.position_buffer, [this.x_in[i], this.y_out[i], this.z[i]]);
			this.push_point(this.grid.normal_buffer, normal2);
			this.push_point(this.tangent_buffer, tangent2);
			this.push_point(this.textureCoords, [0.0, i*REPEATS], 2);
			this.push_point(this.textureCoords, [1.0, i*REPEATS], 2);
			
			this.push_point(this.grid.position_buffer, [this.x_in[i], this.y_in[i], this.z[i]]);
			this.push_point(this.grid.normal_buffer, normal2);
			this.push_point(this.tangent_buffer, tangent2);
			this.push_point(this.grid.position_buffer, [this.x_in[i], this.y_in[i], this.z[i]]);
			this.push_point(this.grid.normal_buffer, normal1);
			this.push_point(this.tangent_buffer, tangent1);
			this.push_point(this.textureCoords, [0.0, i*REPEATS], 2);
			this.push_point(this.textureCoords, [1.0, i*REPEATS], 2);
			
			// Segundo cuadrante			
			this.push_point(this.grid.position_buffer, [-this.x_in[i], this.y_in[i], this.z[i]]);
			this.push_point(this.grid.normal_buffer, normal1);
			this.push_point(this.tangent_buffer, tangent1);
			this.push_point(this.grid.position_buffer, [-this.x_in[i], this.y_in[i], this.z[i]]);
			this.push_point(this.grid.normal_buffer, normal3);
			this.push_point(this.tangent_buffer, tangent3);
			this.push_point(this.textureCoords, [0.0, i*REPEATS], 2);
			this.push_point(this.textureCoords, [1.0, i*REPEATS], 2);
			
			this.push_point(this.grid.position_buffer, [-this.x_in[i], this.y_out[i], this.z[i]]);
			this.push_point(this.grid.normal_buffer, normal3);
			this.push_point(this.tangent_buffer, tangent3);
			this.push_point(this.grid.position_buffer, [-this.x_in[i], this.y_out[i], this.z[i]]);
			this.push_point(this.grid.normal_buffer, normal1);
			this.push_point(this.tangent_buffer, tangent1);
			this.push_point(this.textureCoords, [0.0, i*REPEATS], 2);
			this.push_point(this.textureCoords, [1.0, i*REPEATS], 2);
			
			this.push_point(this.grid.position_buffer, [-this.x_out[i], this.y_out[i], this.z[i]]);
			this.push_point(this.grid.normal_buffer, normal1);
			this.push_point(this.tangent_buffer, tangent1);
			this.push_point(this.grid.position_buffer, [-this.x_out[i], this.y_out[i], this.z[i]]);
			this.push_point(this.grid.normal_buffer, normal2);
			this.push_point(this.tangent_buffer, tangent2);
			this.push_point(this.textureCoords, [0.0, i*REPEATS], 2);
			this.push_point(this.textureCoords, [1.0, i*REPEATS], 2);
			
			// Tercer cuadrante
			this.push_point(this.grid.position_buffer, [-this.x_out[i], -this.y_out[i], this.z[i]]);
			this.push_point(this.grid.normal_buffer, normal2);
			this.push_point(this.tangent_buffer, tangent2);
			this.push_point(this.grid.position_buffer, [-this.x_out[i], -this.y_out[i], this.z[i]]);
			this.push_point(this.grid.normal_buffer, normal4);
			this.push_point(this.tangent_buffer, tangent4);
			this.push_point(this.textureCoords, [0.0, i*REPEATS], 2);
			this.push_point(this.textureCoords, [1.0, i*REPEATS], 2);
			
			this.push_point(this.grid.position_buffer, [-this.x_in[i], -this.y_out[i], this.z[i]]);
			this.push_point(this.grid.normal_buffer, normal4);
			this.push_point(this.tangent_buffer, tangent4);
			this.push_point(this.grid.position_buffer, [-this.x_in[i], -this.y_out[i], this.z[i]]);
			this.push_point(this.grid.normal_buffer, normal3);
			this.push_point(this.tangent_buffer, tangent3);
			this.push_point(this.textureCoords, [0.0, i*REPEATS], 2);
			this.push_point(this.textureCoords, [1.0, i*REPEATS], 2);
			
			this.push_point(this.grid.position_buffer, [-this.x_in[i], -this.y_in[i], this.z[i]]);
			this.push_point(this.grid.normal_buffer, normal3);
			this.push_point(this.tangent_buffer, tangent3);
			this.push_point(this.grid.position_buffer, [-this.x_in[i], -this.y_in[i], this.z[i]]);
			this.push_point(this.grid.normal_buffer, normal4);
			this.push_point(this.tangent_buffer, tangent4);
			this.push_point(this.textureCoords, [0.0, i*REPEATS], 2);
			this.push_point(this.textureCoords, [1.0, i*REPEATS], 2);
			
			// Cuarto cuadrante
			this.push_point(this.grid.position_buffer, [this.x_in[i], -this.y_in[i], this.z[i]]);
			this.push_point(this.grid.normal_buffer, normal4);
			this.push_point(this.tangent_buffer, tangent4);
			this.push_point(this.grid.position_buffer, [this.x_in[i], -this.y_in[i], this.z[i]]);
			this.push_point(this.grid.normal_buffer, normal2);
			this.push_point(this.tangent_buffer, tangent2);
			this.push_point(this.textureCoords, [0.0, i*REPEATS], 2);
			this.push_point(this.textureCoords, [1.0, i*REPEATS], 2);
			
			this.push_point(this.grid.position_buffer, [this.x_in[i], -this.y_out[i], this.z[i]]);
			this.push_point(this.grid.normal_buffer, normal2);
			this.push_point(this.tangent_buffer, tangent2);
			this.push_point(this.grid.position_buffer, [this.x_in[i], -this.y_out[i], this.z[i]]);
			this.push_point(this.grid.normal_buffer, normal4);
			this.push_point(this.tangent_buffer, tangent4);
			this.push_point(this.textureCoords, [0.0, i*REPEATS], 2);
			this.push_point(this.textureCoords, [1.0, i*REPEATS], 2);
			
			this.push_point(this.grid.position_buffer, [this.x_out[i], -this.y_out[i], this.z[i]]);
			this.push_point(this.grid.normal_buffer, normal4);
			this.push_point(this.tangent_buffer, tangent4);
			this.push_point(this.grid.position_buffer, [this.x_out[i], -this.y_out[i], this.z[i]]);
			this.push_point(this.grid.normal_buffer, normal3);
			this.push_point(this.tangent_buffer, tangent3);
			this.push_point(this.textureCoords, [0.0, i*REPEATS], 2);
			this.push_point(this.textureCoords, [1.0, i*REPEATS], 2);
			
			// Punto para cerrar
			this.push_point(this.grid.position_buffer, [this.x_out[i], this.y_out[i], this.z[i]]);
			this.push_point(this.grid.normal_buffer, normal3);
			this.push_point(this.tangent_buffer, tangent3);
			this.push_point(this.textureCoords, [0.0, i*REPEATS], 2);
		}
		
		for (i = 0; i < 24*2; i++) {
			this.push_point(this.grid.color_buffer, this.color);
		}
		
		this.texture = loadTexture("textures/orange.jpg");
		this.texture2 = loadTexture("textures/normal.jpg");
		
		this.webgl_tangent_buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_tangent_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.tangent_buffer), gl.STATIC_DRAW);
		
		this.webgl_texture_buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_texture_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.textureCoords), gl.STATIC_DRAW);
		
		this.grid.setupWebGLBuffers();
	}
	
	// Devuelve los parámetros de la parte superior de la pieza, para poder fácilmente generar otra que empalme bien (devuelve las dimensiones
	// de la H reducida).
	this.nueva_seccion = function() {
		var seccion = {};
		seccion.x_out = this.x_out[1];
		seccion.y_out = this.y_out[1];
		seccion.x_in = this.x_in[1];
		seccion.y_in = this.y_in[1];
		return seccion;
	}
	
	
	
	this.draw = function(view_matrix, model_matrix) {
		
		gl.useProgram(glShaderGeneric);
		gl.enableVertexAttribArray(glShaderGeneric.aVertexUV);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_texture_buffer);
		gl.vertexAttribPointer(glShaderGeneric.aVertexUV, 2, gl.FLOAT, false, 0, 0);
		
		gl.enableVertexAttribArray(glShaderGeneric.aVertexTangent);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_tangent_buffer);
		gl.vertexAttribPointer(glShaderGeneric.aVertexTangent, 3, gl.FLOAT, false, 0, 0);
		
		var norm_matrix = mat3.create();
		
		mat3.fromMat4(norm_matrix, model_matrix);
		mat3.invert(norm_matrix, norm_matrix);
		mat3.transpose(norm_matrix, norm_matrix);
		
		gl.uniformMatrix4fv(glShaderGeneric.uVMatrix, false, view_matrix);
		gl.uniformMatrix3fv(glShaderGeneric.uNMatrix, false, norm_matrix);
		gl.uniformMatrix4fv(glShaderGeneric.uMMatrix, false, model_matrix);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.grid.webgl_position_buffer);
		gl.vertexAttribPointer(glShaderGeneric.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.grid.webgl_color_buffer);
		gl.vertexAttribPointer(glShaderGeneric.aVertexColor, 3, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.grid.webgl_normal_buffer);
		gl.vertexAttribPointer(glShaderGeneric.aVertexNormal, 3, gl.FLOAT, false, 0, 0);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		gl.uniform1i(glShaderGeneric.uSampler1, 0);
		
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, this.texture2);
		gl.uniform1i(glShaderGeneric.uSampler2, 1);
		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.grid.webgl_index_buffer);
		
		
		if (params.line_strip) {
			gl.drawElements(gl.LINE_STRIP, this.grid.index_buffer.length, gl.UNSIGNED_SHORT, 0);
		} else {
			gl.drawElements(gl.TRIANGLE_STRIP, this.grid.index_buffer.length, gl.UNSIGNED_SHORT, 0);
		}//this.grid.draw(view_matrix, model_matrix);

		gl.disableVertexAttribArray(glShaderGeneric.aVertexTangent);
		gl.disableVertexAttribArray(glShaderGeneric.aVertexUV);
		
		
		gl.useProgram(glShaderColor);
		if (this.debug) {
			this.terna.draw(view_matrix, model_matrix);
		}
		
	}
}


