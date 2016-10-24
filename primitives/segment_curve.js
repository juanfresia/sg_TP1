		
function SegmentCurve() {
	// Colección de puntos y cantidad de puntos		
	this.control_points = null;
	this.num_control_points = null;
	this.normal_vector = vec3.fromValues(0.0, 1.0, 0.0);
	this.grid = null;
	
	
	// Longitud de la curva, es decir el valor máximo que puede adoptar
	// el parámetro u en C(u)
	this.length = function() {
		return this.num_control_points-1;
	}

	// Inicializa los parámetros (interpola por defecto, curva abierta)
	this.create = function(points) {
	
		this.control_points = points;
		this.num_control_points = points.length;
	}

	this.at = function(u) {
		if (this.control_points < 2) {
			console.log("ERROR: insuficiente cantidad de puntos de control para determinar curva B-Spline\n");
			return vec3.fromValues(0.0, 0.0, 0.0);
		}
		
		var aux = Math.floor(u);
		var t = u - aux;
		if (u >= this.length()) {
			aux = this.length()-1;
			t = 1;	
		}
		var p1 = this.control_points[aux];
		var p2 = this.control_points[aux+1];
		var tmp = vec3.fromValues(0.0, 0.0, 0.0);
		vec3.scaleAndAdd(tmp, tmp, p1, (1.0 - t));
		vec3.scaleAndAdd(tmp, tmp, p2, t);
		return tmp;
	}
	
	
	this.norm_at = function(u){
		var tan = this.tan_at(u);
		var tmp = this.normal_vector;
		vec3.cross(tmp, tan, tmp);
		
		vec3.cross(tmp, tmp, tan);
		vec3.normalize(tmp, tmp);
		return tmp;
	}
	

	this.tan_at = function(u){
		if (this.control_points < 2) {
			console.log("ERROR: insuficiente cantidad de puntos de control para determinar curva B-Spline\n");
			return vec3.fromValues(0.0, 0.0, 0.0);
		}
		var aux = Math.floor(u);
		var t = u - aux;
		if (u >= this.length()) {
			aux = this.length()-1;
			t = 1;	
		}
		var p1 = this.control_points[aux];
		var p2 = this.control_points[aux+1];
		var tmp = vec3.fromValues(0.0, 0.0, 0.0);
		vec3.sub(tmp,p1,p2);
		return tmp;
	}
	
		
	this.rotate = function(angle, axis) {
		var rotate_mat = mat4.create();
		mat4.identity(rotate_mat);
		mat4.rotate(rotate_mat, rotate_mat, angle, axis);
		for (i = 0; i < this.num_control_points; i++) {
			vec3.transformMat4(this.control_points[i], this.control_points[i], rotate_mat);
		}
		vec3.transformMat4(this.normal_vector, this.normal_vector, rotate_mat);
	}
		
	this.setupWebGLBuffers = function(step) {
		this.grid = new VertexGrid();
		this.grid.createIndexBuffer(this.length()/0.1, 1);
		for (i = 0; i <= (this.length()); i+=0.1) {
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
		if (this.grid)
			this.grid.draw();
	}
}
