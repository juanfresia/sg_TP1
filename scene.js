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
		coast_line = new CubicBSpline();
		cp = [];
		cp.push([-8,-4,0]);
		cp.push([-8,-4,0]);
		cp.push([-8,-4,0]);
		cp.push([-4,4,0]);
		cp.push([0,-8,0]);
		cp.push([4,4,0]);
		cp.push([8,-4,0]);
		cp.push([8,-4,0]);
		cp.push([8,-4,0]);
		coast_line.create(cp);
		coast_line.rotate(Math.PI/2, [-1.0, 0.0, 0.0]);
		coast_line.setupWebGLBuffers(0.1);
	
		coast = new CubicBSpline();
		cp = [];
		cp.push([3,0,0]);
		cp.push([0,3,0]);
		cp.push([-3,0,0]);
		cp.push([0,-3,0]);
		cp.push([3,0,0]);
		cp.push([0,3,0]);
		cp.push([-3,0,0]);
		cp.push([0,-3,0]);
		coast.create(cp);
		coast.rotate(Math.PI/2, [0.0, -1.0, 0.0]);
		coast.setupWebGLBuffers(0.1);
	/*
		coast_line = new CubicBSpline();
		cp = [];
		cp.push([-8,-4,0]);
		cp.push([-8,-4,0]);
		cp.push([-8,-4,0]);
		cp.push([-4,4,0]);
		cp.push([0,-8,0]);
		cp.push([4,4,0]);
		cp.push([8,-4,0]);
		cp.push([8,-4,0]);
		cp.push([8,-4,0]);
		coast_line.create(cp);
		coast_line.rotate(Math.PI/2, [-1.0, 0.0, 0.0]);
		coast_line.setupWebGLBuffers(0.1);
	
		coast = new CubicBSpline();
		cp = [];
		cp.push([-4,-2,0]);
		cp.push([-4,-2,0]);
		cp.push([-4,-2,0]);
		cp.push([0,-2,0]);
		cp.push([0,4,0]);
		cp.push([4,4,0]);
		cp.push([10,4,0]);
		cp.push([10,4,0]);
		cp.push([10,4,0]);
		cp.push([10,4,0]);
		coast.create(cp);
		coast.rotate(Math.PI/2, [0.0, -1.0, 0.0]);
		coast.setupWebGLBuffers(0.1);
	*/
	
		my_grid = new Surface();
		my_grid.setFollowNormal(true);
		my_grid.create(coast_line, 50, coast, 20);
		
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
		mat4.translate(view_matrix, view_matrix, [0.0, 0.0, -15.0]);	
		mat4.rotate(model_matrix, model_matrix, time, [0.0, 1.0, 0.0]);
		
		mat3.fromMat4(norm_matrix, model_matrix);
		mat3.invert(norm_matrix, norm_matrix);
		mat3.transpose(norm_matrix, norm_matrix);
		gl.uniformMatrix3fv(glShaderColor.uNMatrix, false, norm_matrix);
		
		gl.uniformMatrix4fv(glShaderColor.uMMatrix, false, model_matrix);
		gl.uniformMatrix4fv(glShaderColor.uVMatrix, false, view_matrix);
		
				
		my_grid.draw();		
		
		
		mat4.identity(model_matrix);
		mat4.rotate(model_matrix, model_matrix, time, [0.0, 1.0, 0.0]);
		mat4.translate(model_matrix, model_matrix, [0.0, -2.0, 0.0]);
		gl.uniformMatrix4fv(glShaderColor.uMMatrix, false, model_matrix);
		coast_line.draw();
		

		mat4.identity(model_matrix);
		mat4.rotate(model_matrix, model_matrix, time, [0.0, 1.0, 0.0]);
		mat4.translate(model_matrix, model_matrix, [0.0, 0.0, 0.0]);
		gl.uniformMatrix4fv(glShaderColor.uMMatrix, false, model_matrix);
		coast.draw();
		
		mat4.identity(model_matrix);
		mat4.translate(model_matrix, model_matrix, [0.0, 4.0, 0.0]);
		mat4.rotate(model_matrix, model_matrix, time, [0.0, 1.0, 0.0]);
		gl.uniformMatrix4fv(glShaderColor.uMMatrix, false, model_matrix);
		asd.draw();
	}
}
	
		
		
