
function Curva() {

	// Devuelve la longitud de la curva, el valor máximo del parámetro u.
	this.lenght = function() {
		return 1;
	}
	
	// Devuelve un vec3 con el punto que cae en la posición u
	this.at = function(u) {
		
		return [Math.cos(Math.PI*u*params.periodoC1),Math.sin(Math.PI*u*params.periodoC1),u*params.periodoC1];
		//return [u, 4*u*u, 0];
	}

	// Devuelve un vec3 con la dirección de la normal en u
	this.norm_at = function(u) {
		return [0,0,1];
	}

	// Devuelve un vec3 con la dirección de la tangente en u
	this.tan_at = function(u) {
		return [-Math.sin(Math.PI*u*params.periodoC1),Math.cos(Math.PI*u*params.periodoC1),1];
		//return [1,1,0];
	}
	
}

function Curva2() {

	// Devuelve la longitud de la curva, el valor máximo del parámetro u.
	this.lenght = function() {
		return 1;
	}
	
	// Devuelve un vec3 con el punto que cae en la posición u
	this.at = function(u) {
		return [0,0.5*Math.cos(Math.PI*2*u),0.5*Math.sin(2*Math.PI*u)];
	}

	// Devuelve un vec3 con la dirección de la normal en u
	this.norm_at = function(u) {		
		return [0,Math.cos(Math.PI*2*u),Math.sin(2*Math.PI*u)];
	}

	// Devuelve un vec3 con la dirección de la tangente en u
	this.tan_at = function(u) {
		return [0,-Math.sin(Math.PI*2*u),Math.cos(Math.PI*2*u)];
	}
	
}