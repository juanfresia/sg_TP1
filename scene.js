// ***********************************
//	Contiene todos los objetos de la escena con sus respectivas matrices
//	de modelado, y se encarga de dibujar todos los componentes.
// ***********************************

function Scene() {
	var mvMatrix = mat4.create();
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
	this.draw = function(u_model_view_matrix, time) {
		// Preparamos una matriz de modelo+vista.
		mat4.identity(mvMatrix);
		mat4.translate(mvMatrix, mvMatrix, [0.0, 0.0, -5.0]);
		mat4.rotate(mvMatrix, mvMatrix, time, [0.0, 1.0, 0.0]);

		gl.uniformMatrix4fv(u_model_view_matrix, false, mvMatrix);
		my_grid.draw();
	
		
		mat4.identity(mvMatrix);
		mat4.translate(mvMatrix, mvMatrix, [-3.0, -2.0, -5.0]);
		mat4.rotate(mvMatrix, mvMatrix, time, [0.0, 1.0, 0.0]);
		gl.uniformMatrix4fv(u_model_view_matrix, false, mvMatrix);
		asd.draw();
		}
}


		
		
		