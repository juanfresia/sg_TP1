// Shader para objetos con hasta dos texturas, con sus respectivos
// mapas de normales.


// Shader de vértices
#ifdef VERTICES
attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec3 aVertexColor;

attribute vec2 aVertexUV;
attribute vec3 aVertexTangent;

#ifdef MULTIPLE_TEXTURA
	attribute float aTextureIndex;
	varying float vtextureIndex;
#endif

uniform mat4 uVMatrix;
uniform mat4 uMMatrix;
uniform mat4 uPMatrix;
uniform mat3 uNMatrix;

uniform vec3 uLightPosition;

varying highp vec4 vColor;
varying highp vec3 vNormal;
varying highp vec3 vTangent; 


varying highp vec3 vLightDir;
varying vec2 vUV;

void main(void) {

	// Consigo la posición proyectada del punto multiplicando por todas las matrices.
	vec4 model_world_pos = uMMatrix * vec4(aVertexPosition, 1.0);
	vec4 model_view_pos = uVMatrix * model_world_pos;
	
	gl_Position = uPMatrix * model_view_pos;
	
	// El color a utilizar es el mismo del vértice (no hay texturas).
	vColor = vec4(aVertexColor, 1.0);
	
	vec3 light_dir = uLightPosition - vec3(model_world_pos);
	vLightDir = normalize(light_dir);
	
	vNormal = normalize(uNMatrix * aVertexNormal);
	vTangent = normalize(uNMatrix * aVertexTangent);
	vUV = aVertexUV;
	
	#ifdef MULTIPLE_TEXTURA
		vtextureIndex = aTextureIndex;
	#endif
}

#endif

// Shader de fragmentos
#ifdef FRAGMENTOS
	precision mediump float;	

	varying highp vec4 vColor;
	varying highp vec3 vLightDir;

	varying highp vec3 vTangent; 
	varying highp vec3 vNormal;

	uniform vec3 uAmbientColor;
	uniform vec3 uDirectionalColor;
	
	// Número de textura, coordenadas y samplers
	varying vec2 vUV;
	
	uniform sampler2D uSampler1;	// Textura 1
	uniform sampler2D uSampler2;	// Mapa de normales 1

	#ifdef MULTIPLE_TEXTURA
		varying float vtextureIndex;
		uniform sampler2D uSampler3;	// Textura 2
		uniform sampler2D uSampler4;	// Mapa de normales 2
	#endif
	
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
		vec4 normalMap = texture2D(uSampler2, vec2(vUV.s, vUV.t));
		
		#ifdef MULTIPLE_TEXTURA
			if (vtextureIndex >= 1.5) {
				textureColor = texture2D(uSampler3, vec2(vUV.s, vUV.t));
				normalMap = texture2D(uSampler4, vec2(vUV.s, vUV.t));
			}
		#endif
		
		normalMap = normalMap * 2.0 - vec4(1.0, 1.0, 1.0, 0.0);
		
		// Calculo la binormal y la matriz de cambio de base. NxB=T
		vec3 binormal = normalize(cross(vTangent, vNormal));
		mat3 tangent_space = transpose(mat3(vTangent, binormal, vNormal));
		
		// Convierto el vector dirección al espacio de la tangente
		vec3 lightDir_ts = normalize(tangent_space * vLightDir);
		
		// Calculo el ángulo y aplico el color
		highp float directionalLightWeighting = max(dot(normalMap.rgb, lightDir_ts), 0.0);
		vec3 lightColor = uAmbientColor + uDirectionalColor * directionalLightWeighting;
		gl_FragColor = vec4(textureColor.rgb * lightColor, textureColor.a);
				
		//gl_FragColor = vec4(lightDir_ts/2.0+0.5, textureColor.a);
		//gl_FragColor = vec4(directionalLightWeighting,directionalLightWeighting,directionalLightWeighting, textureColor.a);
		
}
#endif

