// Script con las funciones para controlar la entrada por mouse y teclado.
// Devuelve una matriz de vista que permite ser modificada en tiempo de ejecución mediante mouse y teclado.


function InputHandler() {
	var view_mat = null;
	
	this.orbit_cam = {
		center:[0.0, 0.0, 0.0],
		radius:500,
		phi:0.0,
		theta:Math.PI/2
	};
	
	
	// Configura los handlers para los elementos del html
	this.setup_handlers = function() {
		var body = document.getElementById("my_body");
		var canvas = document.getElementById("my_canvas");
		
		body.onkeydown = this.on_key_down;
		canvas.onmousemove = this.on_mouse_move;
		canvas.onmousedown = this.on_mouse_down;
		canvas.onmouseup = this.on_mouse_up;
		canvas.onmousewheel = this.on_mouse_up;
		
		body.handler = this;
		canvas.handler = this;
		
		this.view_mat = mat4.create();
		mat4.identity(this.view_mat);
		mat4.translate(this.view_mat, this.view_mat, [0.0, 0.0, -500]);
	};
	
	// Los handlers
	this.on_key_down = function(e) {
		switch (e.keyCode) {
		case 87:
		case 38:			// 'w' o 'ArrowUp'
			this.handler.orbit_cam.radius += 10;
			break;
		case 65:
		case 37:			// 'a' o 'ArrowLeft'
			this.handler.orbit_cam.theta -= Math.PI/100;
			break;
		case 83:
		case 40:			// 's' o 'ArrowDown'
			this.handler.orbit_cam.radius -= 10;
			break;
		case 68:
		case 39:			// 'd' o 'ArrowRight'
			this.handler.orbit_cam.phi += Math.PI/100;
			break;
		}
		this.handler.recalculate_matrix();
	};
	this.on_mouse_move = function(e) {
	};
	this.on_mouse_up = function(e) {
	};
	this.on_mouse_down = function(e) {
	};
	this.on_mouse_wheel = function(e) {
	};
	
	
	this.recalculate_matrix = function() {
		mat4.identity(this.view_mat);
		mat4.translate(this.view_mat, this.view_mat, [0.0, 0.0, -this.orbit_cam.radius]);
		mat4.rotate(this.view_mat, this.view_mat, this.orbit_cam.theta, [1.0, 0.0, 0.0]);
		mat4.rotate(this.view_mat, this.view_mat, this.orbit_cam.phi, [0.0, 1.0, 0.0]);
	}
	
	this.get_view_matrix = function() {
		return this.view_mat;
	}
	
	
}



