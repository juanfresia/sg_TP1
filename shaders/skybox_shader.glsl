// Shader para objetos con hasta dos texturas, con sus respectivos
// mapas de normales.


// Shader de vértices
#ifdef VERTICES
attribute vec3 aVertexPosition;
attribute vec3 aVertexColor;
attribute vec2 aVertexUV;

uniform mat4 uVMatrix;
uniform mat4 uMMatrix;
uniform mat4 uPMatrix;
uniform mat3 uNMatrix;

varying highp vec4 vColor;

varying vec2 vUV;

void main(void) {
	// Consigo la posición proyectada del punto multiplicando por todas las matrices.
	vec4 model_world_pos = uMMatrix * vec4(aVertexPosition, 1.0);
	vec4 model_view_pos = uVMatrix * model_world_pos;
	
	gl_Position = uPMatrix * model_view_pos;
	
	// El color a utilizar es el mismo del vértice (no hay texturas).
	vColor = vec4(aVertexColor, 1.0);
	vUV = aVertexUV;
}

#endif

// Shader de fragmentos
#ifdef FRAGMENTOS
	precision mediump float;	

	varying highp vec4 vColor;
	uniform vec3 uSkyboxLight;
	
	// Número de textura, coordenadas y samplers
	varying vec2 vUV;
	
	uniform sampler2D uSampler1;	// Textura 1
	
	// Funcion transponer auxiliar
	mat3 transpose(mat3 m) {
		mat3 aux = mat3(0.0);
		aux[0][0] = m[0][0];
		aux[1][1] = m[1][1];
		aux[2][2] = m[2][2];
		
		aux[0][1] = m[1][0];
		aux[1][0] = m[0][1];
		
		aux[0][2] = m[2][0];
		aux[2][0] = m[0][2];
		
		aux[1][2] = m[2][1];
		aux[2][1] = m[1][2];
		return aux;
	}

	void main(void) {
		vec4 textureColor = texture2D(uSampler1, vec2(vUV.s, vUV.t));
		
		gl_FragColor = vec4(textureColor.rgb * uSkyboxLight, 1.0);
}
#endif

