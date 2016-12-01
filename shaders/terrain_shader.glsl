// Shader para el terreno
// Tiene dos coordenadas UV para poder hacer blending entre dos texturas


// Shader de vértices
#ifdef VERTICES
attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec3 aVertexColor;

attribute vec2 aVertexUV;
attribute vec2 aVertexUVBig;
attribute vec3 aVertexTangent;

uniform mat4 uVMatrix;
uniform mat4 uMMatrix;
uniform mat4 uPMatrix;
uniform mat3 uNMatrix;

uniform vec3 uLightPosition;

varying highp vec4 vColor;
varying highp vec3 vNormal;
varying highp vec3 vTangent; 

varying highp vec3 vPos;

varying highp vec3 vLightDir;
varying vec2 vUV;
varying vec2 vUVBig;

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
	vUVBig = aVertexUVBig;
	
	// Posición en coordenadas del mundo
	vPos = model_world_pos.xyz/model_world_pos.w;
	
}

#endif







// Shader de fragmentos
#ifdef FRAGMENTOS
	precision mediump float;

	// Altura máxima del terreno
	uniform float uMaxHeight;
	// Posición en coordenadas del mundo
	varying highp vec3 vPos;
	
	varying highp vec4 vColor;
	varying highp vec3 vLightDir;

	varying highp vec3 vTangent; 
	varying highp vec3 vNormal;

	uniform vec3 uAmbientColor;
	uniform vec3 uDirectionalColor;
	
	varying vec2 vUV;
	varying vec2 vUVBig;

	uniform sampler2D uSamplerSand;
	uniform sampler2D uSamplerSandNorm;
	uniform sampler2D uSamplerGrass;
	uniform sampler2D uSamplerGrassNorm;
	uniform sampler2D uSamplerStone;
	uniform sampler2D uSamplerStoneNorm;	
	
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
		vec4 textureColor = vec4(0.0);
		vec4 normalMap = vec4(0.0);
		
		// Por sobre la mitad de la pendiente -> uso pasto
		if (vPos.y >= uMaxHeight) {
			textureColor = texture2D(uSamplerGrass, vUV);
			normalMap=  texture2D(uSamplerGrassNorm, vUV);
		} else {	// Uso arena
			textureColor = texture2D(uSamplerSand, vUV);
			normalMap = texture2D(uSamplerSandNorm, vUV);
		}
		
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
		
}
#endif

