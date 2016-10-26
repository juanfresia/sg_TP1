
function BridgeSide() {	
	this.terna = null;
	this.debug = null;
	
	
	// Las torres y sus matrices
	this.torres = null;
	this.torres_mat = null;
	
	// El cable (no tiene matriz)
	this.cable = null;
	
	// Los tensores
	this.tensor = null;
	this.tensores_mat = null;

	this.set_debug = function(debug) {
		this.debug = debug;
	}
	
	this.create = function(curva_cables, torre_pos, torre_alt, tensor_alt) {
		// Terna para debug
		this.debug = false;
		this.terna = new Terna();
		this.terna.create();

		var matriz_aux = mat4.create();		
		mat4.identity(matriz_aux);		
		
		// Primero creo las torres
		this.torres = [];
		this.torres_mat = [];
		
		for (var i = 0; i < torre_pos.length; i++) {
			var h1 = torre_alt[i] + params.puente_ph1;				// La altura del terreno + la altura de la calle sobre el terreno
			var h2 = params.puente_ph3 - torre_alt[i];		// Considero h3 la altura sobre el terreno
			this.torres[i] = new Tower();
			this.torres[i].create(1, 1, params.ancho_corte,params.prof_corte,params.reduccion, h1, h2);
			
			this.torres_mat[i] = mat4.create();
			mat4.copy(this.torres_mat[i], matriz_aux);
			mat4.translate(this.torres_mat[i], this.torres_mat[i], [torre_pos[i], -params.puente_ph1, 0.0]);
			mat4.rotate(this.torres_mat[i], this.torres_mat[i], -Math.PI/2, [1.0, 0.0, 0.0]);
		}
		
		
		// El cable
		this.cable = new Surface();
		this.cable.set_follow_normal(true);
		this.cable.set_color([0.5, 0.5, 0.5]);
		var circulo = new Circumference();
		circulo.create(0.1);		
		this.cable.create(curva_cables, 100, circulo, 20);		
		
		
		// Los tirantes
		this.tensor = new Tensor();
		this.tensor.create(0.05);
		this.tensores_mat = [];
		
		for (var i = 0; i < tensor_alt.length; i++) {
			
			var estirar = tensor_alt[i][2] - tensor_alt[i][1];
			var x_pos = tensor_alt[i][0];
			var y_pos = tensor_alt[i][1];
			
			this.tensores_mat[i] = mat4.create();
			mat4.copy(this.tensores_mat[i], matriz_aux);
			mat4.translate(this.tensores_mat[i], this.tensores_mat[i], [x_pos, y_pos, 0.0]);
			mat4.scale(this.tensores_mat[i], this.tensores_mat[i], [1.0, estirar, 1.0]);
		}
		
	}
		
	
	this.draw = function(view_matrix, model_matrix) {
		// Las torres
		for (var i = 0; i < this.torres.length; i++) {
			var tmp = mat4.create();
			mat4.copy(tmp, this.torres_mat[i]);
			mat4.mul(tmp, model_matrix, tmp);
			this.torres[i].draw(view_matrix, tmp);
		}
		
		// El cable
		this.cable.draw(view_matrix, model_matrix);
			
		// Los tensores
		for (var i = 0; i < this.tensores_mat.length; i++) {
			var tmp = mat4.create();
			mat4.copy(tmp, this.tensores_mat[i]);
			mat4.mul(tmp, model_matrix, tmp);
			this.tensor.draw(view_matrix, tmp);
		}
			
		if (this.debug) {
			this.terna.draw(view_matrix, model_matrix);
		}
	}
}

