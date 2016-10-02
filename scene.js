// ***********************************
//	Contiene todos los objetos de la escena con sus respectivas matrices
//	de modelado, y se encarga de dibujar todos los componentes.
// ***********************************

function Scene() {
	var model_matrix = mat4.create();
	var view_matrix = mat4.create();
	var norm_matrix = mat3.create();
	var my_grid = null;
	var asd = null;
	
	// Crea todas las estructuras de la scena
	this.init = function() {
		my_grid = new Surface();
		my_grid.create(new Curva(), 50, new Curva2(), 20);
		my_grid.setupWebGLBuffers();
		
		asd = new Terna();
		asd.create();
	}
	
	// Dibuja las estructuras una por una, teniendo en cuenta parámetros externos como el tiempo o la matriz de vista (o lo que sea que se necesite, puede que tengamos que pasar directamente los shaders para agregar las deformaciones al agua por ejemplo.
	this.draw = function(time) {
			
		// Configurar iluminación
		gl.uniform1i(glShaderColor.uUseLighting, false);
		gl.uniform3fv(glShaderColor.uAmbientColor, vec3.fromValues(0.2, 0.2, 0.2));
		gl.uniform3fv(glShaderColor.uLightPosition, vec3.fromValues(0.0, 4.0, 0.0));
		gl.uniform3fv(glShaderColor.uDirectionalColor, vec3.fromValues(0.4, 0.4, 0.4));
		
		
		// Preparamos una matriz de modelo y de vista.
		mat4.identity(model_matrix);
		mat4.identity(view_matrix);
		mat4.translate(view_matrix, view_matrix, [0.0, 0.0, -10.0]);	
		mat4.rotate(model_matrix, model_matrix, time, [0.0, 1.0, 0.0]);
		
		mat3.fromMat4(norm_matrix, model_matrix);
		mat3.invert(norm_matrix, norm_matrix);
		mat3.transpose(norm_matrix, norm_matrix);
		gl.uniformMatrix3fv(glShaderColor.uNMatrix, false, norm_matrix);
		
		gl.uniformMatrix4fv(glShaderColor.uMMatrix, false, model_matrix);
		gl.uniformMatrix4fv(glShaderColor.uVMatrix, false, view_matrix);
		
		
		my_grid.draw();
			
		mat4.identity(model_matrix);
		mat4.translate(model_matrix, model_matrix, [0.0, 4.0, 0.0]);
		mat4.rotate(model_matrix, model_matrix, time, [0.0, 1.0, 0.0]);
		gl.uniformMatrix4fv(glShaderColor.uMMatrix, false, model_matrix);
		asd.draw();
	}
}
	
		
		