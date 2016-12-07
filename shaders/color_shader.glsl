
// Shader de vértices
#ifdef VERTICES
	// Atributos del vértice
	attribute vec3 aVertexPosition;
	attribute vec3 aVertexNormal;
	attribute vec3 aVertexColor;
	
	// Matrices de Vista, Modelo, Proyección y Normales
	uniform mat4 uVMatrix;
	uniform mat4 uMMatrix;
	uniform mat4 uPMatrix;
	uniform mat3 uNMatrix;
	
	// Decide si se usa o no la iluminación
	uniform bool uUseLighting;
	
	// Parámetros de iluminación
	uniform vec3 uAmbientColor;
	uniform vec3 uLightPosition;
	uniform vec3 uDirectionalColor;
	varying highp vec4 vColor;
	
	varying vec3 vVertexColor;
	varying vec3 vLightWeighting;

	void main(void) {
	
	
		// Consigo la posición proyectada del punto multiplicando por todas las matrices.
		vec4 model_world_pos = uMMatrix * vec4(aVertexPosition, 1.0);
		vec4 model_view_pos = uVMatrix * model_world_pos;
		gl_Position = uPMatrix * model_view_pos;
		
		// El color a utilizar es el mismo del vértice (no hay texturas).
		vVertexColor = aVertexColor;
		
		// ILUMINACIÓN
		
		// Calculo la posición relativa de la fuente de luz dirigida respecto al vértice y normalizo
		//vec4 new_light_position = vec4(uLightPosition, 1.0);
		//new_light_position = uVMatrix * new_light_position;
					
		vec3 light_dir = vec3(uLightPosition) - vec3(model_world_pos);
		light_dir = normalize(light_dir);
		
		if (!uUseLighting) {
			vLightWeighting = vec3(1.0, 1.0, 1.0);
		} else {
			vec3 transformedNormal = normalize(uNMatrix * aVertexNormal);
			highp float directionalLightWeighting = max(dot(transformedNormal, light_dir), 0.0);
			vLightWeighting = uAmbientColor + uDirectionalColor * directionalLightWeighting;
		}
	}
#endif

// Shader de fragmentos
#ifdef FRAGMENTOS
	precision mediump float;

	varying vec3 vVertexColor;
	varying vec3 vLightWeighting;

	void main(void) {
		gl_FragColor = vec4(vVertexColor.rgb * vLightWeighting, 1.0);
	}
#endif

