
Ship.prototype.color = [0.75, 0.172, 0.172];

function Ship() {	
	this.terna = null;
	this.color = Ship.prototype.color;
	this.debug = null;
	
	this.grid = null;
			
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
	
	this.create = function() {
		// Terna para debug
		this.debug = false;
		this.terna = new Terna();
		this.terna.create();
		
		var side = 0.5;
		
		this.cube = new Surface();
		this.cube.set_color(this.color);
		this.cube.set_follow_normal(true);
		
		var path = new CubicBSpline();
		var points = [];
		points.push([3.0, 0.0, 0.0]);
		points.push([3.0, 0.0, 0.0]);
		points.push([3.0, 0.0, 0.0]);
		points.push([-3.0, 0.0, 0.0]);
		points.push([-3.0, 0.0, 0.0]);
		points.push([-3.0, 0.0, 0.0]);
		points.push([-4.0, 0.0, 13.0]);
		points.push([-4.0, 0.0, 13.0]);
		points.push([0.0, 0.0, 25.0]);
		points.push([4.0, 0.0, 13.0]);
		points.push([4.0, 0.0, 13.0]);
		points.push([3.0, 0.0, 0.0]);
		points.push([3.0, 0.0, 0.0]);
		points.push([3.0, 0.0, 0.0]);
		points.push([-3.0, 0.0, 0.0]);
		points.push([-3.0, 0.0, 0.0]);
		points.push([-3.0, 0.0, 0.0]);
		path.create(points);
		
		var base = new Rectangulo();
		base.create(0.1, 0.1, 0.6, 2.2);
		
		this.cube.create(path, 90, base, 65);
		
		
		this.cargamento = new Cargamento();
		this.cargamento.create();

		this.cosito1 = new Cube();
		this.cosito1.set_color([0.84, 0.84, 0.84]);
		this.cosito1.create(-1.0, 0.5, 2.0, 3.0, 3.1, 3.0);
		this.cosito2 = new Cube();
		this.cosito2.set_color([0.84, 0.84, 0.84]);
		this.cosito2.create(-1.6, 1.7, 2.0, 4.6, 2.3, 3.0);
		
		// La cubiertaaaaa
		
		this.cubierta = new VertexGrid();
		this.cubierta.position_buffer = [];
		this.cubierta.color_buffer = [];
		this.cubierta.normal_buffer = [];
		this.cubierta.createIndexBuffer(4, 2);
		var normal = vec3.fromValues(0.0, 1.0, 0.0);
		this.push_point(this.cubierta.position_buffer, [-2.95, 1.0, 0.5]);
		this.push_point(this.cubierta.normal_buffer, normal);
		this.push_point(this.cubierta.color_buffer, this.color);
		
		this.push_point(this.cubierta.position_buffer, [2.92, 1.0, 0.5]);
		this.push_point(this.cubierta.normal_buffer, normal);
		this.push_point(this.cubierta.color_buffer, this.color);
		
		this.push_point(this.cubierta.position_buffer, [-3.6, 1.0, 12.0]);
		this.push_point(this.cubierta.normal_buffer, normal);
		this.push_point(this.cubierta.color_buffer, this.color);
		
		this.push_point(this.cubierta.position_buffer, [3.6, 1.0, 12.0]);
		this.push_point(this.cubierta.normal_buffer, normal);
		this.push_point(this.cubierta.color_buffer, this.color);
		
		this.push_point(this.cubierta.position_buffer, [-2.9, 1.0, 16.0]);
		this.push_point(this.cubierta.normal_buffer, normal);
		this.push_point(this.cubierta.color_buffer, this.color);
		
		this.push_point(this.cubierta.position_buffer, [2.9, 1.0, 16.0]);
		this.push_point(this.cubierta.normal_buffer, normal);
		this.push_point(this.cubierta.color_buffer, this.color);
		this.cubierta.setupWebGLBuffers();
		
		this.push_point(this.cubierta.position_buffer, [0.0, 1.0, 20.8]);
		this.push_point(this.cubierta.normal_buffer, normal);
		this.push_point(this.cubierta.color_buffer, this.color);
		
		this.push_point(this.cubierta.position_buffer, [0.0, 1.0, 20.8]);
		this.push_point(this.cubierta.normal_buffer, normal);
		this.push_point(this.cubierta.color_buffer, this.color);
		this.cubierta.setupWebGLBuffers();
		
	}
		
	
	this.draw = function(view_matrix, model_matrix) {
		var tmp = mat4.create();
		mat4.copy(tmp, model_matrix);
		mat4.translate(tmp, tmp, [0.0, -1.5, 0.0]);
		mat4.rotate(tmp, tmp, -Math.PI/2, [0.0, 1.0, 0.0]);
		mat4.scale(tmp, tmp, [0.5, 0.5, 0.5]);
		this.cube.draw(view_matrix, tmp);
		this.cosito1.draw(view_matrix, tmp);
		this.cubierta.draw(view_matrix, tmp);
		this.cosito2.draw(view_matrix, tmp);
		mat4.copy(tmp, model_matrix);
		mat4.translate(tmp, tmp, [4.8, -4.5, -0.95]);
		mat4.rotate(tmp, tmp, -Math.PI/2, [0.0, 1.0, 0.0]);
		mat4.scale(tmp, tmp, [1.6, 1.8, 1.6])
		this.cargamento.draw(view_matrix, tmp);
		if (this.debug) {
			this.terna.draw(view_matrix, tmp);
		}
	}
}

