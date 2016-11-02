// ***********************************
//	Contiene todos los objetos de la escena con sus respectivas matrices
//	de modelado, y se encarga de dibujar todos los componentes.
// ***********************************

function Scene() {
	var model_matrix = mat4.create();
	var view_matrix = mat4.create();
	var norm_matrix = mat3.create();

	var terreno = null;
	var puente = null;
	var terna = null;
	var agua = null;
	var carreteras = null;
	
	var barco = null;
	
	var desplazamiento_puente = null;
	
	// Crea todas las estructuras de la scena
	this.init = function() {
		terna = new Terna();
		terna.create();
				
		puente = new Bridge();
		puente.create();
		
		terreno = new Terrain();
		terreno.create(get_curve_input_points());
		
		agua = new Water();
		agua.create();
		
		desplazamiento_puente = [0.0, 0.0, 0.0];
		desplazamiento_puente[2] = params.puente_pos * params.ter_ancho - params.ter_ancho/2;
		desplazamiento_puente[0] = terreno.curva_at_y(-desplazamiento_puente[2])[0];
		
		var borde = params.ter_ancho/2;
		var fin_puente_izq = -params.puente_largo/2 + desplazamiento_puente[0];
		var fin_puente_der = params.puente_largo/2 + desplazamiento_puente[0];
		var path_carretera_izq = [];
		var path_carretera_der = [];	
				
		// Creo las calles para completar el puente
		for (var i = 0; i < 3; i++) {
			path_carretera_izq.push([-borde, params.ter_alto, desplazamiento_puente[2]]);
			path_carretera_der.push([borde, params.ter_alto, desplazamiento_puente[2]]);
		}
		for (var i = 0; i < 3; i++) {
			path_carretera_izq.push([fin_puente_izq, params.ter_alto, desplazamiento_puente[2]]);
			path_carretera_der.push([fin_puente_der, params.ter_alto, desplazamiento_puente[2]]);
		}
		
		carreteras = [];
		var curva_tmp = new CubicBSpline();
		curva_tmp.create(path_carretera_izq);		
		carreteras[0] = new BridgeBase();
		carreteras[0].create(curva_tmp);
		
		var curva_tmp = new CubicBSpline();
		curva_tmp.create(path_carretera_der);
		carreteras[1] = new BridgeBase();
		carreteras[1].create(curva_tmp);
		
		// Creo el barco
		barco = new Ship();
		barco.create();
		
		this.init_shader();
	}
	
	this.init_shader = function() {
		// Configurar iluminación
		
		gl.useProgram(glShaderColor);
		gl.uniform1i(glShaderColor.uUseLighting, true);
		gl.uniform3fv(glShaderColor.uAmbientColor, vec3.fromValues(0.1, 0.1, 0.1));
		gl.uniform3fv(glShaderColor.uLightPosition, vec3.fromValues(1000.0, 1000.0, 1000.0));
		gl.uniform3fv(glShaderColor.uDirectionalColor, vec3.fromValues(0.5, 0.5, 0.5));

		gl.useProgram(glShaderWater);
		gl.uniform1i(glShaderWater.uUseLighting, true);
		gl.uniform3fv(glShaderWater.uAmbientColor, vec3.fromValues(0.3, 0.3, 0.3));
		gl.uniform3fv(glShaderWater.uLightPosition, vec3.fromValues(1000.0, 1000.0, 1000.0));
		gl.uniform3fv(glShaderWater.uDirectionalColor, vec3.fromValues(0.5, 0.5, 0.5));
		
		gl.useProgram(glShaderColor);
	}
	
	// Dibuja las estructuras una por una, teniendo en cuenta parámetros externos como el tiempo o la matriz de vista (o lo que sea que se necesite, puede que tengamos que pasar directamente los shaders para agregar las deformaciones al agua por ejemplo.
	this.draw = function(time, view_matrix) {
		var tmp = mat4.create();
		mat4.identity(tmp);
		
		gl.uniformMatrix4fv(glShaderColor.uVMatrix, false, view_matrix);
				
		// Preparamos una matriz de modelo y de vista.
		
		mat4.identity(model_matrix);
		terna.draw(view_matrix, model_matrix);
		carreteras[0].draw(view_matrix, model_matrix);
		carreteras[1].draw(view_matrix, model_matrix);
				
		mat4.translate(model_matrix, model_matrix, desplazamiento_puente);
		puente.draw(view_matrix, model_matrix);
		
		mat4.identity(model_matrix);
		mat4.rotate(model_matrix, model_matrix, Math.PI/2, [-1.0, 0.0, 0.0]);
		agua.draw(view_matrix, model_matrix);
		terreno.draw(view_matrix, model_matrix);
		
		// Dibujo el barco
		mat4.identity(model_matrix);
		var foward = vec3.fromValues(1.0, 0.0, 0.0);
		var barco_pos = vec3.fromValues(0.0, params.ter_alto, 0.0);
		
		var u = time/20 % 1;
		var costa_pos = terreno.curva_at_y(-u * params.ter_ancho + params.ter_ancho/2);
		var costa_tan = terreno.curva_tan_at_y(-u * params.ter_ancho + params.ter_ancho/2);
		vec3.normalize(costa_tan, costa_tan);
		barco_pos[2] = -costa_pos[1];
		barco_pos[0] = costa_pos[0];
		if (params.puente_num_torres % 2 == 1) 
			barco_pos[0] += params.rio_ancho/8;
			
		mat4.translate(model_matrix, model_matrix, barco_pos);
		var angle = Math.acos(vec3.dot(foward, costa_tan));
		if (angle != 0) {			
			mat4.rotate(model_matrix, model_matrix, angle, [0.0, 1.0, 0.0]);
		}
			
		barco.draw(view_matrix, model_matrix);
		
	}
}
	
		
		
