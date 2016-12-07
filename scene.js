// ***********************************
//	Contiene todos los objetos de la escena con sus respectivas matrices
//	de modelado, y se encarga de dibujar todos los componentes.
// ***********************************

function Scene() {
	
	const LIGHT_POS = [-0.8, 1.2, 1.2];
	const AMBIENT_LIGHT = [0.4, 0.4, 0.4];
	const SUN_LIGHT = [0.8, 0.8, 0.6];
	
	var model_matrix = mat4.create();
	var view_matrix = mat4.create();
	var norm_matrix = mat3.create();

	var skybox = null;

	var terreno = null;
	var puente = null;
	var terna = null;
	var agua = null;
	var carreteras = null;
		
	var arboles = null;
	
	var ship_angle = null;
	var ship_pos = null;
	
	var desplazamiento_puente = null;
	
	var altura_terreno = null;
	
	// Crea todas las estructuras de la scena
	this.init = function() {
		terna = new Terna();
		terna.create();
		
		skybox = new SkyBox();
		skybox.create(params.ter_ancho + 200.0);
		
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
			path_carretera_der.push([fin_puente_der, params.ter_alto, desplazamiento_puente[2]]);
		}
		for (var i = 0; i < 3; i++) {
			path_carretera_izq.push([fin_puente_izq, params.ter_alto, desplazamiento_puente[2]]);
			path_carretera_der.push([borde, params.ter_alto, desplazamiento_puente[2]]);
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
		
		arboles = [];
		arboles_pos = [];
		for (var i = 0; i < 3; i++) {
			arboles.push(new Tree());
			arboles[i].create();
		}
		
		for (var i = 0; i < 100; i++) {
			var estilo = Math.floor((Math.random() * 3));
			var x = Math.random() * params.ter_ancho - params.ter_ancho/2;
			var y = Math.random() * params.ter_ancho - params.ter_ancho/2;
			var ancho = Math.random() * 5.0 + 2.0;
			var alto = Math.random() * 10.0 + 10.0;
			if (this.check_position(x, y)) {
				arboles_pos.push([x, y, ancho, alto, estilo]);
			}
		}
		
		altura_terreno = params.ter_alto;
		
		this.init_shader();
	}
	
	this.init_shader = function() {
		// Configurar iluminación
		
		var light_position = [0.0, 0.0, 0.0];
		for (var i = 0; i <= 2; i++) {
			light_position[i]  = LIGHT_POS[i] * params.ter_ancho/2.0;
		}
		
		gl.useProgram(glShaderColor);
		gl.uniform1i(glShaderColor.uUseLighting, true);
		gl.uniform3fv(glShaderColor.uAmbientColor, vec3.fromValues(AMBIENT_LIGHT[0], AMBIENT_LIGHT[1], AMBIENT_LIGHT[2]));
		gl.uniform3fv(glShaderColor.uLightPosition, vec3.fromValues(light_position[0], light_position[1], light_position[2]));
		gl.uniform3fv(glShaderColor.uDirectionalColor, vec3.fromValues(SUN_LIGHT[0], SUN_LIGHT[1], SUN_LIGHT[2]));
		
		
		for (var elem in glShaders) {
			var shader = glShaders[elem];
			gl.useProgram(shader);
			gl.uniform3fv(shader.uAmbientColor, vec3.fromValues(AMBIENT_LIGHT[0], AMBIENT_LIGHT[1], AMBIENT_LIGHT[2]));
			gl.uniform3fv(shader.uLightPosition, vec3.fromValues(light_position[0], light_position[1], light_position[2]));
			gl.uniform3fv(shader.uDirectionalColor, vec3.fromValues(SUN_LIGHT[0], SUN_LIGHT[1], SUN_LIGHT[2]));
		}
		
		var shader = glShaders["terrain"];
		gl.useProgram(shader);
		gl.uniform1f(shader.uMaxHeight, params.ter_alto);
		
		gl.useProgram(glShaderColor);
	}
	
	
	// 
	this.check_position = function(x, y) {
		var puente_y = params.puente_pos * params.ter_ancho - params.ter_ancho * 0.5;
		if (((puente_y + params.puente_ancho) > y) && ((puente_y - params.puente_ancho) < y)) {
			return false;
		}
		
		var rio_x = terreno.curva_at_y(y)[0];
		if ((rio_x + params.rio_ancho/2 > x) && (rio_x - params.rio_ancho/2 < x)) {
			return false;
		}
		return true;
	}


	// Dibuja las estructuras una por una, teniendo en cuenta parámetros externos como el tiempo o la matriz de vista (o lo que sea que se necesite, puede que tengamos que pasar directamente los shaders para agregar las deformaciones al agua por ejemplo.
	this.draw = function(time, view_matrix, camera_pos) {
		var tmp = mat4.create();
		mat4.identity(tmp);
		
		var my_shader = glShaders["water"];
		gl.useProgram(my_shader);
		gl.uniform3fv(my_shader.uCameraPos, camera_pos);
		
		my_shader = glShaders["specular"];
		gl.useProgram(my_shader);
		gl.uniform3fv(my_shader.uCameraPos, camera_pos);
		
		gl.useProgram(glShaderColor);
		gl.uniformMatrix4fv(glShaderColor.uVMatrix, false, view_matrix);
		
		
		// Preparamos una matriz de modelo y de vista.
		
		mat4.identity(model_matrix);
		skybox.draw(view_matrix, model_matrix, params.sky_light);
		terna.draw(view_matrix, model_matrix);
		carreteras[0].draw(view_matrix, model_matrix);
		carreteras[1].draw(view_matrix, model_matrix);
				
		mat4.translate(model_matrix, model_matrix, desplazamiento_puente);
		puente.draw(view_matrix, model_matrix);

		for (var i = 0; i < arboles_pos.length; i++) {
			mat4.identity(model_matrix);
			mat4.translate(model_matrix, model_matrix, [arboles_pos[i][0], altura_terreno, arboles_pos[i][1]]);
			mat4.scale(model_matrix, model_matrix, [arboles_pos[i][2], arboles_pos[i][3], arboles_pos[i][2]]);
			arboles[arboles_pos[i][4]].draw(view_matrix, model_matrix);
		}
		
		mat4.identity(model_matrix);
		mat4.translate(model_matrix, model_matrix, LIGHT_POS);
		terna.draw(view_matrix, model_matrix);
		
		mat4.identity(model_matrix);
		mat4.rotate(model_matrix, model_matrix, Math.PI/2, [-1.0, 0.0, 0.0]);
		terreno.draw(view_matrix, model_matrix);
		
		
		gl.enable(gl.BLEND);
		gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
		gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ZERO);
		agua.draw(view_matrix, model_matrix);
		gl.disable(gl.BLEND);
		
		
	}
}
