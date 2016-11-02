Rectangulo.prototype.color = [0.0,0.2,0.9];

function Rectangulo() {	
	this.grid = new VertexGrid();
	this.terna = null;
	this.color = Rectangulo.prototype.color;
	this.debug = null;
	
	this.x_a = null;
	this.y_a = null;
	this.x_b = null;
	this.y_b = null;
	
	this.perimetro = null;
		
	this.superficie = null;
			
	this.set_color = function(color) {
		this.color = color;
	}
	
	this.length = function() {
		return 1;
	}
	
	this.push_point = function(buffer, point) {
		buffer.push(point[0]);
		buffer.push(point[1]);
		buffer.push(point[2]);
	}
	
	this.set_debug = function(debug) {
		this.debug = debug;
	}
	
	this.norm_at = function(u){
		return vec3.fromValues(0.0, 0.0, 1.0);
	}
	
	this.tan_at = function(u) {
		var largoX = (xb-xa)/this.perimetro;
		var largoY = (yb-ya)/this.perimetro;
		if (u < 0 || u > 1)
			console.log("Se accedió a rectangulo con parámetro fuera de rango");
		if(u < largoX)
			return vec3.fromValues(1.0, 0.0, 0.0);
		if(u < largoX+largoY)
			return vec3.fromValues(0.0, 1.0, 0.0);
		if(u < 2*largoX+largoY)
			return vec3.fromValues(-1.0, 0.0, 0.0);
		return vec3.fromValues(0.0, -1.0, 0.0);
	}
	
	this.at = function(u) {
		var largoX = (this.x_b-this.x_a)/this.perimetro;
		var largoY = (this.y_b-this.y_a)/this.perimetro;
		if (u < 0 || u > 1)
			console.log("Se accedió a rectangulo con parámetro fuera de rango");
		if(u < largoX)
			return vec3.fromValues(u * this.perimetro + this.x_a, this.y_a, 0.0);
		if(u < largoX+largoY)
			return vec3.fromValues(this.x_b, (u - largoX) * this.perimetro + this.y_a, 0.0);
		if(u < 2*largoX+largoY)
			return vec3.fromValues(this.x_b - (u - largoX - largoY)* this.perimetro, this.y_b, 0.0);
		return vec3.fromValues(this.x_a,  +this.y_b - (u - 2*largoX -largoY) * this.perimetro, 0.0);
	}
			
	this.setupWebGLBuffers = function(step) {
		this.grid = new VertexGrid();
		this.grid.createIndexBuffer(2, 2);	
		for (var i = 0; i <= 1; i+=0.1) {
				var aux = this.at(i);
				var aux2 = this.norm_at(i);
				this.grid.position_buffer.push(aux[0]);
				this.grid.position_buffer.push(aux[1]);
				this.grid.position_buffer.push(aux[2]);
				this.grid.color_buffer.push(0.1);
				this.grid.color_buffer.push(0.1);
				this.grid.color_buffer.push(1.0);
				this.grid.normal_buffer.push(aux2[0]);
				this.grid.normal_buffer.push(aux2[1]);
				this.grid.normal_buffer.push(aux2[2]);
		}
		this.grid.setupWebGLBuffers();
	}
	
	// Define un rectangulo en el plano xy
	
	this.create = function(xa, ya, xb, yb) {
		// Terna para debug
		this.debug = false;
		this.terna = new Terna();
		this.terna.create();
		
		this.x_a = xa;
		this.y_a = ya;
		this.x_b = xb;
		this.y_b = yb;
		
		this.perimetro = 2 * (xb-xa) + 2 * (yb - ya);
		
		var normalcita = vec3.fromValues(0.0, 0.0, 1.0);
	}
		
	
	this.draw = function(view_matrix, model_matrix) {
		this.grid.draw(view_matrix, model_matrix);
		if (this.debug) {
			this.terna.draw(view_matrix, model_matrix);
		}
	}
}

