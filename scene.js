// ***********************************
//	Contiene todos los objetos de la escena con sus respectivas matrices
//	de modelado, y se encarga de dibujar todos los componentes.
// ***********************************

function Scene() {
	var model_matrix = mat4.create();
	var view_matrix = mat4.create();
	var norm_matrix = mat3.create();

	var prueba = null;
	var terna = null;
	
	// Crea todas las estructuras de la scena
	this.init = function() {
		terna = new Terna();
		terna.create();
		
		preview = new TowerBase();
		preview.set_color([1.0,1.0,0.0]);
		preview.create(1, 1, params.ancho_corte, params.prof_corte, 1.0, 1.0);
		
		prueba = new Tower();
		prueba.create(1,1,params.ancho_corte,params.prof_corte,params.reduccion,1);
	}
	
	// Dibuja las estructuras una por una, teniendo en cuenta parámetros externos como el tiempo o la matriz de vista (o lo que sea que se necesite, puede que tengamos que pasar directamente los shaders para agregar las deformaciones al agua por ejemplo.
	this.draw = function(time) {
		var tmp = mat4.create();
		mat4.identity(tmp);
			
		// Configurar iluminación
		gl.uniform1i(glShaderColor.uUseLighting, true);
		gl.uniform3fv(glShaderColor.uAmbientColor, vec3.fromValues(0.1, 0.1, 0.1));
		gl.uniform3fv(glShaderColor.uLightPosition, vec3.fromValues(2.0, 2.0, 0.0));
		gl.uniform3fv(glShaderColor.uDirectionalColor, vec3.fromValues(0.1, 0.1, 0.1));
		
		mat4.identity(view_matrix);
		mat4.translate(view_matrix, view_matrix, [0.0, -4-params.zoom/6, -params.zoom]);	
		mat4.rotate(view_matrix, view_matrix, Math.PI/4, [-1.0, 0.0, 0.0]);	
		mat4.rotate(view_matrix, view_matrix, time, [0.0, 0.0, 1.0]);	
		gl.uniformMatrix4fv(glShaderColor.uVMatrix, false, view_matrix);
				
		// Preparamos una matriz de modelo y de vista.
		mat4.identity(model_matrix);

		prueba.draw(view_matrix, model_matrix);
		terna.draw(view_matrix, model_matrix);
		
		mat4.identity(view_matrix);
		mat4.translate(view_matrix, view_matrix, [0.0, -params.zoom/6, -params.zoom]);	
		mat4.identity(model_matrix);
		mat4.translate(model_matrix, model_matrix, [-15,5,0]);
		mat4.scale(model_matrix, model_matrix, [5,5,5]);
		gl.uniformMatrix4fv(glShaderColor.uVMatrix, false, view_matrix);
		preview.draw(view_matrix, model_matrix);
		
	}
}
	
		
		
