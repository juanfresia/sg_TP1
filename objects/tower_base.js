// Define la pieza que compondrá las torres del puente. Resulta de una interpolación lineal de puntos en forma de hache.

TowerBase.prototype.color = [1.0,0.0,0.0];

function TowerBase() {	
	this.grid = new VertexGrid();
	this.terna = null;
	this.color = TowerBase.prototype.color;
	
	this.reduccion = null;
	this.alto = null;
	this.x_out = null;
	this.y_out = null;
	this.x_in = null;
	this.y_in = null;
	this.z = null;
	
	this.debug = null;
			
	this.push_point = function(buffer, point) {
		buffer.push(point[0]);
		buffer.push(point[1]);
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
				
		// Setup de buffers y de la grid
		this.grid.position_buffer = [];
		this.grid.color_buffer = [];
		this.grid.normal_buffer = [];
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
				
		for (i = 0; i <= 1; i++) {
		
			// Primer cuadrante
			this.push_point(this.grid.position_buffer, [this.x_out[i], this.y_out[i], this.z[i]]);
			this.push_point(this.grid.normal_buffer, normal1);
			
			this.push_point(this.grid.position_buffer, [this.x_in[i], this.y_out[i], this.z[i]]);
			this.push_point(this.grid.normal_buffer, normal1);
			this.push_point(this.grid.position_buffer, [this.x_in[i], this.y_out[i], this.z[i]]);
			this.push_point(this.grid.normal_buffer, normal2);
			
			this.push_point(this.grid.position_buffer, [this.x_in[i], this.y_in[i], this.z[i]]);
			this.push_point(this.grid.normal_buffer, normal2);
			this.push_point(this.grid.position_buffer, [this.x_in[i], this.y_in[i], this.z[i]]);
			this.push_point(this.grid.normal_buffer, normal1);
			
			// Segundo cuadrante			
			this.push_point(this.grid.position_buffer, [-this.x_in[i], this.y_in[i], this.z[i]]);
			this.push_point(this.grid.normal_buffer, normal1);
			this.push_point(this.grid.position_buffer, [-this.x_in[i], this.y_in[i], this.z[i]]);
			this.push_point(this.grid.normal_buffer, normal3);
			
			this.push_point(this.grid.position_buffer, [-this.x_in[i], this.y_out[i], this.z[i]]);
			this.push_point(this.grid.normal_buffer, normal3);
			this.push_point(this.grid.position_buffer, [-this.x_in[i], this.y_out[i], this.z[i]]);
			this.push_point(this.grid.normal_buffer, normal1);
			
			this.push_point(this.grid.position_buffer, [-this.x_out[i], this.y_out[i], this.z[i]]);
			this.push_point(this.grid.normal_buffer, normal1);
			this.push_point(this.grid.position_buffer, [-this.x_out[i], this.y_out[i], this.z[i]]);
			this.push_point(this.grid.normal_buffer, normal2);
			
			// Tercer cuadrante
			this.push_point(this.grid.position_buffer, [-this.x_out[i], -this.y_out[i], this.z[i]]);
			this.push_point(this.grid.normal_buffer, normal2);
			this.push_point(this.grid.position_buffer, [-this.x_out[i], -this.y_out[i], this.z[i]]);
			this.push_point(this.grid.normal_buffer, normal4);
			
			this.push_point(this.grid.position_buffer, [-this.x_in[i], -this.y_out[i], this.z[i]]);
			this.push_point(this.grid.normal_buffer, normal4);
			this.push_point(this.grid.position_buffer, [-this.x_in[i], -this.y_out[i], this.z[i]]);
			this.push_point(this.grid.normal_buffer, normal3);
			
			this.push_point(this.grid.position_buffer, [-this.x_in[i], -this.y_in[i], this.z[i]]);
			this.push_point(this.grid.normal_buffer, normal3);
			this.push_point(this.grid.position_buffer, [-this.x_in[i], -this.y_in[i], this.z[i]]);
			this.push_point(this.grid.normal_buffer, normal4);
			
			// Cuarto cuadrante
			this.push_point(this.grid.position_buffer, [this.x_in[i], -this.y_in[i], this.z[i]]);
			this.push_point(this.grid.normal_buffer, normal4);
			this.push_point(this.grid.position_buffer, [this.x_in[i], -this.y_in[i], this.z[i]]);
			this.push_point(this.grid.normal_buffer, normal2);
			
			this.push_point(this.grid.position_buffer, [this.x_in[i], -this.y_out[i], this.z[i]]);
			this.push_point(this.grid.normal_buffer, normal2);
			this.push_point(this.grid.position_buffer, [this.x_in[i], -this.y_out[i], this.z[i]]);
			this.push_point(this.grid.normal_buffer, normal4);
			
			this.push_point(this.grid.position_buffer, [this.x_out[i], -this.y_out[i], this.z[i]]);
			this.push_point(this.grid.normal_buffer, normal4);
			this.push_point(this.grid.position_buffer, [this.x_out[i], -this.y_out[i], this.z[i]]);
			this.push_point(this.grid.normal_buffer, normal3);
			
			// Punto para cerrar
			this.push_point(this.grid.position_buffer, [this.x_out[i], this.y_out[i], this.z[i]]);
			this.push_point(this.grid.normal_buffer, normal3);
		}
		
		for (i = 0; i < 24*2; i++) {
			this.push_point(this.grid.color_buffer, this.color);
		}
		
		this.grid.setupWebGLBuffers();
	}
	
	this.nueva_seccion = function() {
		var seccion = {};
		seccion.x_out = this.x_out[1];
		seccion.y_out = this.y_out[1];
		seccion.x_in = this.x_in[1];
		seccion.y_in = this.y_in[1];
		return seccion;
	}
	
	
	this.draw = function(view_matrix, model_matrix) {
		this.grid.draw(view_matrix, model_matrix);
		if (this.debug) {
			this.terna.draw(view_matrix, model_matrix);
		}
	}
}


