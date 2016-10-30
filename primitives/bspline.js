	// Base de BSpline cúbica
	CubicBSpline.prototype.BASE_1 = function(t) {return -t*t*t/6 + t*t/2 - t/2 + 1/6;}
	CubicBSpline.prototype.BASE_2 = function(t) {return t*t*t/2 - t*t + 2/3;}
	CubicBSpline.prototype.BASE_3 = function(t) {return -t*t*t/2 + t*t/2 + t/2 + 1/6;}
	CubicBSpline.prototype.BASE_4 = function(t) {return t*t*t/6;}	
	// Base de las derivadas
	CubicBSpline.prototype.BASE_1_D = function(t) {return -t*t/2 + t - 1/2;}
	CubicBSpline.prototype.BASE_2_D = function(t) {return 3*t*t/2 - 2*t;}
	CubicBSpline.prototype.BASE_3_D = function(t) {return -3*t*t/2 + t + 1/2;}
	CubicBSpline.prototype.BASE_4_D = function(t) {return t*t/2;}
			
	// Combinación lineal de los puntos
	CubicBSpline.prototype.interpolar = function(p1, p2, p3, p4, t) {		
		var tmp = vec3.fromValues(0.0, 0.0, 0.0);
		vec3.scaleAndAdd(tmp, tmp, p1, this.BASE_1(t));
		vec3.scaleAndAdd(tmp, tmp, p2, this.BASE_2(t));
		vec3.scaleAndAdd(tmp, tmp, p3, this.BASE_3(t));
		vec3.scaleAndAdd(tmp, tmp, p4, this.BASE_4(t));
		return tmp;
	}	
	CubicBSpline.prototype.interpolar_D = function(p1, p2, p3, p4, t) {		
		var tmp = vec3.fromValues(0.0, 0.0, 0.0);
		vec3.scaleAndAdd(tmp, tmp, p1, this.BASE_1_D(t));
		vec3.scaleAndAdd(tmp, tmp, p2, this.BASE_2_D(t));
		vec3.scaleAndAdd(tmp, tmp, p3, this.BASE_3_D(t));
		vec3.scaleAndAdd(tmp, tmp, p4, this.BASE_4_D(t));
		return tmp;
	}	
	
function CubicBSpline() {
	// Colección de puntos y cantidad de puntos		
	this.control_points = null;
	this.num_control_points = null;
	this.binormal_vector = vec3.fromValues(0.0, 0.0, 1.0);
	this.grid = null;
	
	
	this.set_up_binormal = function(vector) {
		this.binormal_vector = vector;
	}
	
	// Longitud de la curva, es decir el valor máximo que puede adoptar
	// el parámetro u en C(u)
	this.length = function() {
		return this.num_control_points-3;
	}

	// Inicializa los parámetros (interpola por defecto, curva abierta)
	this.create = function(points) {
		this.control_points = points;
		this.num_control_points = points.length;
	}

	
	this.at = function(u) {		
		if (this.control_points < 4) {
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
		var p3 = this.control_points[aux+2];
		var p4 = this.control_points[aux+3];
		return this.interpolar(p1, p2, p3, p4, t);
	}
	
	
	this.norm_at = function(u){
		var tan = this.tan_at(u);
		var tmp = vec3.create();
		vec3.cross(tmp, this.binormal_vector, tan);
		
		//vec3.cross(tmp, tmp, tan);
		vec3.normalize(tmp, tmp);
		return tmp;
	}
	

	this.tan_at = function(u){
		if (this.control_points < 4) {
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
		var p3 = this.control_points[aux+2];
		var p4 = this.control_points[aux+3];
		
		if (u < 1) {
			var son_iguales = true;
			son_iguales &= (p1[0] == p2[0]) && (p2[0] == p3[0]);
			son_iguales &= (p1[1] == p2[1]) && (p2[1] == p3[1]);
			son_iguales &= (p1[2] == p2[2]) && (p2[2] == p3[2]);
			if (son_iguales) {
				var tmp = vec3.fromValues(0.0, 0.0, 0.0);
				vec3.sub(tmp, p4, p3);
				vec3.normalize(tmp, tmp);
				return tmp;
			}
		}
		
		if (u > this.length()-1) {
			var son_iguales = true;
			son_iguales &= (p4[0] == p2[0]) && (p2[0] == p3[0]);
			son_iguales &= (p4[1] == p2[1]) && (p2[1] == p3[1]);
			son_iguales &= (p4[2] == p2[2]) && (p2[2] == p3[2]);
			if (son_iguales) {
				var tmp = vec3.fromValues(0.0, 0.0, 0.0);
				vec3.sub(tmp, p2, p1);
				vec3.normalize(tmp, tmp);
				return tmp;
			}
		}	
		
		return this.interpolar_D(p1, p2, p3, p4, t);
	}
	
		
	this.rotate = function(angle, axis) {
		var rotate_mat = mat4.create();
		mat4.identity(rotate_mat);
		mat4.rotate(rotate_mat, rotate_mat, angle, axis);
		for (i = 0; i < this.num_control_points; i++) {
			vec3.transformMat4(this.control_points[i], this.control_points[i], rotate_mat);
		}
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
