// Shader para objetos con hasta dos texturas, con sus respectivos
// mapas de normales.


// Shader de vértices
#ifdef VERTICES
// Atributos del vértice
attribute vec3 aVertexPosition;
attribute vec3 aVertexColor;

attribute vec2 aVertexUV;

// Matrices de Vista, Modelo, Proyección y Normales
uniform mat4 uVMatrix;
uniform mat4 uMMatrix;
uniform mat4 uPMatrix;
uniform mat3 uNMatrix;
	
// Parámetros de iluminación
uniform vec3 uLightPosition;

varying highp vec4 vColor;
uniform highp float uTime;
varying vec2 vUV;

varying highp vec3 vNormal;
varying highp vec3 vPos;
varying highp vec3 vTangent; 
varying highp vec3 vLightDir;

void main(void) {
	
	float kx = 0.1;
	float kz = 0.1;
	float wx = 0.5;
	float wz = 2.0;
	float amp = 0.01;
	
	// Consigo la posición proyectada del punto multiplicando por todas las matrices.
	vec4 model_world_pos = uMMatrix * vec4(aVertexPosition, 1.0);
	vec3 normal = vec3(0.0, 1.0, 0.0);
	vec3 binormal = vec3(0.0, 0.0, 1.0);
	
	model_world_pos[1] = model_world_pos[1] + amp * sin(model_world_pos[2]* kz + uTime * wz) * sin(model_world_pos[0]* kx + uTime * wx);
	
	normal[0] = amp * sin(model_world_pos[2]* kz + uTime * wz) * kx * cos(model_world_pos[0]* kx + uTime * wx);
	normal[2] = amp * sin(model_world_pos[2]* kz + uTime * wz) * kz * cos(model_world_pos[2]* kz + uTime * wz);
	normal[1] = 1.0;
			
	vec4 model_view_pos = uVMatrix * model_world_pos;
	gl_Position = uPMatrix * model_view_pos;
	
	// El color a utilizar es el mismo del vértice (no hay texturas).
	vColor = vec4(aVertexColor, 1.0);
	vTangent = 	normalize(cross(binormal, normal));
	vNormal = normalize(normal);
	
	vPos = model_world_pos.xyz/model_world_pos.w;
	
	vUV = aVertexUV + vec2(0.0, uTime/100.0);
	
	vec3 light_dir = uLightPosition - vec3(model_world_pos);
	vLightDir = normalize(light_dir);
	
}
#endif

// Shader de fragmentos
#ifdef FRAGMENTOS
	precision mediump float;

	varying highp vec4 vColor;
	varying highp vec3 vLightDir;

	varying highp vec3 vPos;
	varying highp vec3 vTangent; 
	varying highp vec3 vNormal;

	uniform vec3 uAmbientColor;
	uniform vec3 uDirectionalColor;
	
	uniform vec3 uCameraPos;
	
	// Número de textura, coordenadas y samplers
	varying vec2 vUV;
	
	uniform sampler2D uSamplerNormal;	// Normales
	uniform samplerCube uSamplerReflection;
	
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
		vec4 normalMap = texture2D(uSamplerNormal, vec2(vUV.s, vUV.t));
				
		normalMap = normalMap * 2.0 - vec4(1.0, 1.0, 1.0, 1.0);
		
		// Calculo la binormal y la matriz de cambio de base. NxB=T
		vec3 binormal = normalize(cross(vNormal, vTangent));
		mat3 tangent_space = transpose(mat3(vTangent, binormal, vNormal));
		
		// Convierto el vector dirección al espacio de la tangente
		vec3 lightDir_ts = normalize(tangent_space * vLightDir);
		
		vec3 eyeDir = normalize(-uCameraPos-vPos);
		vec3 eyeDir_ts = normalize(tangent_space * eyeDir);
		
		vec3 reflectDir_ts = normalize(reflect(-lightDir_ts, normalMap.rgb));
		
		// Calculo el ángulo y aplico el color
		highp float directionalLightWeighting = max(dot(normalMap.rgb, lightDir_ts), 0.0);
		
		highp float specularLightWeighting = pow(max(dot(eyeDir_ts, reflectDir_ts), 0.0), 15.0);
		
		vec3 lightColor = uAmbientColor + uDirectionalColor * directionalLightWeighting + vec3(0.9, 0.9, 0.9) * specularLightWeighting;
		
		
		// Reflexión
		vec3 eyeDir_ref = normalize(reflect(-eyeDir, normalMap.rgb));
		vec4 reflectMap = textureCube(uSamplerReflection, -eyeDir_ref);
		float reflectiveness = 0.6;
		vec3 finalColor = (1.0-reflectiveness) * vColor.rgb + reflectiveness * reflectMap.rgb;
		
		gl_FragColor = vec4(finalColor * lightColor, 0.9);
		
		//gl_FragColor = vec4(normalize(-vPos).xyz/2.0+0.5, 1.0);
		//gl_FragColor = vec4(aux.xyz/2.0+0.5, 1.0);
		
}
#endif

