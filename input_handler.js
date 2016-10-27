// Script con las funciones para controlar la entrada por mouse y teclado.
// Devuelve una matriz de vista que permite ser modificada en tiempo de ejecución mediante mouse y teclado.


function InputHandler() {
	var view_mat = null;
	var mouse_down = null;
	
	this.mouse_coord = {
		cur_x:0.0,
		cur_y:0.0,
		pre_x:0.0,
		pre_y:0.0,
		speed_factor:0.01,
		zoom_speed:10
	};
	
	this.orbit_cam = {
		center:[0.0, 0.0, 0.0],
		radius:500,
		phi:0.0,
		theta:0.0
	};
	
	
	// Configura los handlers para los elementos del html
	this.setup_handlers = function() {
		var body = document.getElementById("my_body");
		var canvas = document.getElementById("my_canvas");
		
		body.onkeydown = this.on_key_down;
		canvas.onmousemove = this.on_mouse_move;
		canvas.onmousedown = this.on_mouse_down;
		canvas.onmouseup = this.on_mouse_up;
		canvas.onwheel = this.on_mouse_wheel;
		
		body.handler = this;
		canvas.handler = this;
		
		this.view_mat = mat4.create();
		mat4.identity(this.view_mat);
		this.recalculate_matrix();
	};
	
	// Los handlers
	this.on_key_down = function(e) {
		switch (e.keyCode) {
		case 87:
		case 38:			// 'w' o 'ArrowUp'
			break;
		case 65:
		case 37:			// 'a' o 'ArrowLeft'
			break;
		case 83:
		case 40:			// 's' o 'ArrowDown'
			break;
		case 68:
		case 39:			// 'd' o 'ArrowRight'
			break;
		}
	};
	
	this.on_mouse_move = function(e) {
		if (this.handler.mouse_down) {
			var delta_x = this.handler.pre_x - e.clientX;
			var delta_y = this.handler.pre_y - e.clientY;
			
			this.handler.pre_x = e.clientX;
			this.handler.pre_y = e.clientY;
			
			this.handler.orbit_cam.phi += delta_x * this.handler.mouse_coord.speed_factor;
			this.handler.orbit_cam.theta -= delta_y * this.handler.mouse_coord.speed_factor;
			
			if (this.handler.orbit_cam.theta < -Math.PI/2)
				this.handler.orbit_cam.theta = -Math.PI/2;
				
			if (this.handler.orbit_cam.theta > Math.PI/2)
				this.handler.orbit_cam.theta = Math.PI/2;
				
			this.handler.recalculate_matrix();
		}
	};
	
	this.on_mouse_up = function(e) {
		this.handler.mouse_down = false;
	};
	
	this.on_mouse_down = function(e) {
		this.handler.pre_x = e.clientX;
		this.handler.pre_y = e.clientY;
		this.handler.mouse_down = true;
	};
	
	this.on_mouse_wheel = function(e) {
		this.handler.orbit_cam.radius += 1/3 * e.deltaY * this.handler.mouse_coord.zoom_speed;
		if (this.handler.orbit_cam.radius < 0)
			this.handler.orbit_cam.radius = 0;
		
		this.handler.recalculate_matrix();
	};
	
	
	this.recalculate_matrix = function() {
		mat4.identity(this.view_mat);
		mat4.translate(this.view_mat, this.view_mat, [0.0, 0.0, -this.orbit_cam.radius]);
		mat4.rotate(this.view_mat, this.view_mat, this.orbit_cam.theta, [1.0, 0.0, 0.0]);
		mat4.rotate(this.view_mat, this.view_mat, this.orbit_cam.phi, [0.0, -1.0, 0.0]);
	}
	
	this.get_view_matrix = function() {
		return this.view_mat;
	}
	
	
}



