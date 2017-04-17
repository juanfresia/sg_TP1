// Script con las funciones para controlar la entrada por mouse y teclado.
// Devuelve una matriz de vista que permite ser modificada en tiempo de ejecución mediante mouse y teclado.


function InputHandler() {
	var view_mat = null;
	var mouse_down = null;
	var mode = null;
	
	this.mouse_coord = {
		cur_x:0.0,
		cur_y:0.0,
		pre_x:0.0,
		pre_y:0.0,
		speed_factor:0.01
		//zoom_speed:1.2
	};
	
	this.orbit_cam = {
		center:[0.0, 0.0, 0.0],
		radius:100,
		phi:0.0,
		theta:0.0
	};	
	
	// Los valores iniciales están hardcodeados para que empiece mirando al puente.
	this.free_cam = {
		pos:[25.0, -45.0, -40.0],		// Posicion del observador
		theta:-0.82,					// Angulo en el plano xz que indica hacia donde se está mirando
		phi:0.42						// Angulo en el plano xy que indica si se esta mirando hacia arriba o hacia abajo
	};
	
		
	// Configura los handlers para los elementos del html
	this.setup_handlers = function() {
		var body = document.getElementById("my_body");
		var canvas = document.getElementById("my_canvas");
		
		body.handler = this;
		canvas.handler = this;
		
		this.view_mat = mat4.create();
		mat4.identity(this.view_mat);
		
		this.set_free();
	};
	
	// Configura los handlers para el modo órbita de la cámara
	this.set_orbit = function() {
		var body = document.getElementById("my_body");
		var canvas = document.getElementById("my_canvas");
		
		body.onkeydown = this.on_key_down_orbit;
		canvas.onmousemove = this.on_mouse_move_orbit;
		canvas.onmousedown = this.on_mouse_down_orbit;
		canvas.onmouseup = this.on_mouse_up_orbit;
		canvas.onwheel = this.on_mouse_wheel_orbit;
		
		this.mode = "orbit";
		this.recalculate_matrix();
	};
	
	// Elije el centro de la cámara de órbita
	this.set_orbit_center = function(center) {
		this.orbit_cam.center[0] = -center[0];
		this.orbit_cam.center[1] = -center[1];
		this.orbit_cam.center[2] = -center[2];
	}
	
	// Configura los handlers para el modo cámara libre
	this.set_free = function() {
		var body = document.getElementById("my_body");
		var canvas = document.getElementById("my_canvas");
		
		body.onkeydown = this.on_key_down_free;
		canvas.onmousemove = this.on_mouse_move_free;
		canvas.onmousedown = this.on_mouse_down_free;
		canvas.onmouseup = this.on_mouse_up_free;
		canvas.onwheel = this.on_mouse_wheel_free;
		
		this.mode = "free";
		this.recalculate_matrix();
	}
	
	
	
	
	
	// ------------------------------------------
	// ---------------  LIBRE  ------------------
	// ------------------------------------------
	// Presionar '1' para entrar en el modo cámara libre.
	// Controles: hacer click y arrastrar para cambiar la dirección en la que se está mirando.
	//				'w' y 'a' caminar hacia adelante y atrás (sin modificar altura).
	//				's' y 'd' caminar hacia izquierda y derecha.
	//				'q' y 'e' ascender o descender
	
	this.on_key_down_free = function(e) {
		switch (e.keyCode) {
		case 87:
		case 38:			// 'w' o 'ArrowUp'
			this.handler.free_cam.pos[2] += Math.cos(this.handler.free_cam.theta) * params.velocidad_mov / 10;
			this.handler.free_cam.pos[0] += Math.sin(this.handler.free_cam.theta) * params.velocidad_mov / 10;
			break;
		case 65:
		case 37:			// 'a' o 'ArrowLeft'
			this.handler.free_cam.pos[2] += Math.cos(this.handler.free_cam.theta + Math.PI/2) * params.velocidad_mov / 10;
			this.handler.free_cam.pos[0] += Math.sin(this.handler.free_cam.theta + Math.PI/2) * params.velocidad_mov / 10;
			break;
		case 83:
		case 40:			// 's' o 'ArrowDown'
			this.handler.free_cam.pos[2] -= Math.cos(this.handler.free_cam.theta) * params.velocidad_mov / 10;
			this.handler.free_cam.pos[0] -= Math.sin(this.handler.free_cam.theta) * params.velocidad_mov / 10;
			break;
		case 68:
		case 39:			// 'd' o 'ArrowRight'
			this.handler.free_cam.pos[2] += Math.cos(this.handler.free_cam.theta - Math.PI/2) * params.velocidad_mov / 10;
			this.handler.free_cam.pos[0] += Math.sin(this.handler.free_cam.theta - Math.PI/2) * params.velocidad_mov / 10;
			break;
		case 81:			// 'q'
			this.handler.free_cam.pos[1] -= params.velocidad_mov / 10;
			break;
		case 69:			// 'e'
			this.handler.free_cam.pos[1] += params.velocidad_mov / 10;
			break;
			
		case 50:			// '2'
			this.handler.set_orbit();
			alert("Camara en modo orbita");
			break;
		} 
		this.handler.recalculate_matrix();
	}
	this.on_mouse_move_free = function(e) {
		if (this.handler.mouse_down) {
			var delta_x = this.handler.pre_x - e.clientX;
			var delta_y = this.handler.pre_y - e.clientY;
			
			this.handler.pre_x = e.clientX;
			this.handler.pre_y = e.clientY;
			
			this.handler.free_cam.theta += delta_x * this.handler.mouse_coord.speed_factor;
			this.handler.free_cam.phi -= delta_y * this.handler.mouse_coord.speed_factor;
			
			if (this.handler.free_cam.phi < -Math.PI/2)
				this.handler.free_cam.phi = -Math.PI/2;
				
			if (this.handler.free_cam.phi > Math.PI/2)
				this.handler.free_cam.phi = Math.PI/2;
				
			this.handler.recalculate_matrix();
		}
	};	
	this.on_mouse_up_free = function(e) {
		this.handler.mouse_down = false;
	};	
	this.on_mouse_down_free = function(e) {
		this.handler.pre_x = e.clientX;
		this.handler.pre_y = e.clientY;
		this.handler.mouse_down = true;
	};	
	this.on_mouse_wheel_free = function(e) {
	};
		
	
	// ------------------------------------------
	// ---------------  ORBITA  -----------------
	// ------------------------------------------
	// Presionar '2' para entrar en el modo cámara órbita
	// Controles: únicamente con el mouse, click y arrastrar para cambiar el ángulo de visión.
	//			  usar la rueda del mouse para acercarse o alejarse.
	
	this.on_key_down_orbit = function(e) {
		console.log(e.keyCode);
		switch (e.keyCode) {
		case 49:		// '1'
			this.handler.set_free();
			alert("Camara en modo libre");
			break;
		case 107:		// '+'
			this.handler.orbit_cam.radius -= params.velocidad_mov/10.0;
			if (this.handler.orbit_cam.radius < 0)
				this.handler.orbit_cam.radius = 0;
			this.handler.recalculate_matrix();
			break;
		case 109:		// '-'
			this.handler.orbit_cam.radius += params.velocidad_mov/10.0;
			if (this.handler.orbit_cam.radius < 0)
				this.handler.orbit_cam.radius = 0;
			this.handler.recalculate_matrix();
			break;
		} 
	}
	this.on_mouse_move_orbit = function(e) {
		if (this.handler.mouse_down) {
			var delta_x = this.handler.pre_x - e.clientX;
			var delta_y = this.handler.pre_y - e.clientY;
			
			this.handler.pre_x = e.clientX;
			this.handler.pre_y = e.clientY;
			
			this.handler.orbit_cam.theta += delta_x * this.handler.mouse_coord.speed_factor;
			this.handler.orbit_cam.phi -= delta_y * this.handler.mouse_coord.speed_factor;
			
			if (this.handler.orbit_cam.phi < -Math.PI/2)
				this.handler.orbit_cam.phi = -Math.PI/2;
				
			if (this.handler.orbit_cam.phi > Math.PI/2)
				this.handler.orbit_cam.phi = Math.PI/2;
				
			this.handler.recalculate_matrix();
		}
	};	
	this.on_mouse_up_orbit = function(e) {
		this.handler.mouse_down = false;
	};	
	this.on_mouse_down_orbit = function(e) {
		this.handler.pre_x = e.clientX;
		this.handler.pre_y = e.clientY;
		this.handler.mouse_down = true;
	};	
	this.on_mouse_wheel_orbit = function(e) {
		this.handler.orbit_cam.radius += e.deltaY * Math.sign(params.velocidad_mov);
		if (this.handler.orbit_cam.radius < 0)
			this.handler.orbit_cam.radius = 0;
		
		this.handler.recalculate_matrix();
	};
	
	
	// Metodo para actualizar la matriz.
	this.recalculate_matrix = function() {
		mat4.identity(this.view_mat);		
		if (this.mode == "orbit") {
			mat4.translate(this.view_mat, this.view_mat, [0.0, 0.0, -this.orbit_cam.radius]);
			mat4.rotate(this.view_mat, this.view_mat, this.orbit_cam.phi, [1.0, 0.0, 0.0]);
			mat4.rotate(this.view_mat, this.view_mat, this.orbit_cam.theta, [0.0, -1.0, 0.0]);
		} else if (this.mode == "free") {
			mat4.rotate(this.view_mat, this.view_mat, this.free_cam.phi, [1.0, 0.0, 0.0]);
			mat4.rotate(this.view_mat, this.view_mat, this.free_cam.theta, [0.0, -1.0, 0.0]);
			mat4.translate(this.view_mat, this.view_mat, this.free_cam.pos);
		}
	}
		
	this.get_view_matrix = function() {
		return this.view_mat;
	}
	
	this.get_camera_pos = function() {
		if (this.mode == "free") {
			return this.free_cam.pos;
		}
		if (this.mode == "orbit") {
			var pos = vec3.create();
			
			pos[2] -= this.orbit_cam.radius * Math.cos(this.orbit_cam.theta) * Math.sin(this.orbit_cam.phi);
			pos[0] -= this.orbit_cam.radius * Math.sin(this.orbit_cam.theta) * Math.sin(this.orbit_cam.phi);
			pos[1] -= this.orbit_cam.radius * Math.cos(this.orbit_cam.phi);
			return pos;
		} else {
			return [0.0, 0.0, 0.0];
		}
	}
	
}



