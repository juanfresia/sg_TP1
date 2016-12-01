
// Curva que representa una circunferencia de radio R
function Circumference() {
	// Colección de puntos y cantidad de puntos		
	this.grid = null;
	this.radio = null;
	this.binormal_vector = vec3.fromValues(0.0, 0.0, 1.0);
	
	// Longitud de la curva, es decir el valor máximo que puede adoptar
	// el parámetro u en C(u)
	this.length = function() {
		return 1;
	}
	
	this.create = function(radio) {
		this.radio = radio;
	}
	
	this.at = function(u) {	
		if (u < 0 || u > 1)
			console.log("Se accedió a la circunferencia con parámetro fuera de rango");
		return vec3.fromValues(this.radio * Math.cos(2 * Math.PI * u), this.radio * Math.sin(2 * Math.PI * u), 0.0);
	}	
	
	this.norm_at = function(u){
		if (u < 0 || u > 1)
			console.log("Se accedió a la circunferencia con parámetro fuera de rango");
		return vec3.fromValues(Math.cos(2 * Math.PI * u), Math.sin(2 * Math.PI * u), 0.0);
	}
	

	this.tan_at = function(u){
		if (u < 0 || u > 1)
			console.log("Se accedió a la circunferencia con parámetro fuera de rango");
		return vec3.fromValues( - Math.sin(2 * Math.PI * u), Math.cos(2 * Math.PI * u), 0.0);
	}
		
	this.setupWebGLBuffers = function(step) {
		this.grid = new VertexGrid();
		this.grid.createIndexBuffer(this.length()/0.1, 1);
		for (var i = 0; i <= (this.length()); i+=0.1) {
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
		
	this.draw = function(view_matrix, model_matrix){
		this.grid.draw_line(view_matrix, model_matrix);
	}
}
