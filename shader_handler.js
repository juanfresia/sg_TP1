// Script para cargar shaders


function ShaderHandler() {
	
	var lastRead;
	
	// Para leer un archivo
	this.cargarArchivo = function(path) {
		var request = new XMLHttpRequest();
		request.open('POST', path, false);
		request.addEventListener('load', function() {
			lastRead = request.responseText;
		});
		request.send();
	}	
	
	// Compila un shader a prtir de un string fuente, un tipo y una
	// string de parámetros de tipo "#define ALGO \n #define OTRA_COSA"
	this.compilarShader = function(src, type, params) {
		var shader;
		var header;
		
		if (type == "fragment") {
			shader = gl.createShader(gl.FRAGMENT_SHADER);
			header = "#define FRAGMENTOS\n"
		} else if (type == "vertex") {
			shader = gl.createShader(gl.VERTEX_SHADER);
			header = "#define VERTICES\n"
		} else {
			console.log("Tipo de shader desconocido");
			return null;
		}
		
		// Asignamos el fuente y compilamos
		src = header + params + "\n" + src;
		gl.shaderSource(shader, src);
		gl.compileShader(shader);
		  
		// Chequeamos y reportamos si hubo algún error.
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {  
			alert("Error compilando los shaders: " + 
			gl.getShaderInfoLog(shader));
			return null;  
		}
		
		return shader;
	}
		
	// Crea un shader a partir de un archivo en path, aplicando
	// los parámetros especificados.
	this.crearPrograma = function(path, params) {
		lastRead = null;
		this.cargarArchivo(path);
		
		var src = lastRead;
		var frag_shader = this.compilarShader(src, "fragment", params);
		var vert_shader = this.compilarShader(src, "vertex", params);
		
		// Creo el programa y le asigno los shader
		var program = gl.createProgram();
		
		gl.attachShader(program, vert_shader);
		gl.attachShader(program, frag_shader);
		
		gl.linkProgram(program);
				
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			alert("Error cargando los shaders.  " + gl.getProgramInfoLog(program));
			return null;
		}
		
		return program;
	}
	
	
	this.setupCommons = function(shader) {
		shader.aVertexPosition = gl.getAttribLocation(shader, "aVertexPosition");
		
		shader.aVertexNormal = gl.getAttribLocation(shader, "aVertexNormal");
		
		shader.aVertexColor = gl.getAttribLocation(shader, "aVertexColor");
		
		shader.aVertexTangent = gl.getAttribLocation(shader, "aVertexTangent");
		
		shader.uVMatrix = gl.getUniformLocation(shader, "uVMatrix");
		shader.uMMatrix = gl.getUniformLocation(shader, "uMMatrix");
		shader.uPMatrix = gl.getUniformLocation(shader, "uPMatrix");
		shader.uNMatrix = gl.getUniformLocation(shader, "uNMatrix");
		
		shader.uAmbientColor = gl.getUniformLocation(shader, "uAmbientColor");
		shader.uDirectionalColor = gl.getUniformLocation(shader, "uDirectionalColor");
		shader.uLightPosition = gl.getUniformLocation(shader, "uLightPosition");
		
	}
	
	this.loadColorShader = function() {
		var shader = this.crearPrograma("shaders/color_shader.glsl", "");
		
		gl.linkProgram(shader);

		// Punteros a los atributos del shader
		shader.aVertexPosition = gl.getAttribLocation(shader, "aVertexPosition");
		shader.aVertexNormal = gl.getAttribLocation(shader, "aVertexNormal");
		shader.aVertexColor = gl.getAttribLocation(shader, "aVertexColor");
				
		// Punteros a las matrices y parámetros uniform
		shader.uVMatrix = gl.getUniformLocation(shader, "uVMatrix");
		shader.uMMatrix = gl.getUniformLocation(shader, "uMMatrix");
		shader.uPMatrix = gl.getUniformLocation(shader, "uPMatrix");
		shader.uNMatrix = gl.getUniformLocation(shader, "uNMatrix");
		
		// Parámetros de iluminación
		shader.uUseLighting = gl.getUniformLocation(shader, "uUseLighting");
		shader.uAmbientColor = gl.getUniformLocation(shader, "uAmbientColor");
		shader.uLightPosition = gl.getUniformLocation(shader, "uLightPosition");
		shader.uDirectionalColor = gl.getUniformLocation(shader, "uDirectionalColor");
		
		glShaders["color"] = shader;
	}
	
	this.loadTextureShader = function() {
		var shader = this.crearPrograma("shaders/texturas_simples.glsl", "");

		gl.linkProgram(shader);
		this.setupCommons(shader);
		shader.aVertexUV = gl.getAttribLocation(shader, "aVertexUV");
		shader.uSampler1 = gl.getUniformLocation(shader, "uSampler1");
		shader.uSampler2 = gl.getUniformLocation(shader, "uSampler2");
		
		glShaders["single_texture"] = shader;
		
		var shader = this.crearPrograma("shaders/texturas_simples.glsl", "#define MULTIPLE_TEXTURA\n");
		gl.linkProgram(shader);
		this.setupCommons(shader);
		shader.aVertexUV = gl.getAttribLocation(shader, "aVertexUV");
		shader.aTextureIndex = gl.getAttribLocation(shader, "aTextureIndex");
		shader.uSampler1 = gl.getUniformLocation(shader, "uSampler1");
		shader.uSampler2 = gl.getUniformLocation(shader, "uSampler2");
		shader.uSampler3 = gl.getUniformLocation(shader, "uSampler3");
		shader.uSampler4 = gl.getUniformLocation(shader, "uSampler4");
		
		glShaders["multi_texture"] = shader;
		
		
		var shader = this.crearPrograma("shaders/texturas_simples.glsl", "#define SPECULAR\n #define REFLECTION\n");
		gl.linkProgram(shader);
		this.setupCommons(shader);
		shader.aVertexUV = gl.getAttribLocation(shader, "aVertexUV");
		shader.uSampler1 = gl.getUniformLocation(shader, "uSampler1");
		shader.uSampler2 = gl.getUniformLocation(shader, "uSampler2");
		shader.uCameraPos = gl.getUniformLocation(shader, "uCameraPos");
		shader.uSamplerReflection = gl.getUniformLocation(shader, "uSamplerReflection");
		
		glShaders["specular"] = shader;
	}
	
	this.loadTerrainShader = function() {
		var shader = this.crearPrograma("shaders/terrain_shader.glsl", "");

		gl.linkProgram(shader);
		this.setupCommons(shader);
		
		shader.aVertexUV = gl.getAttribLocation(shader, "aVertexUV");
		shader.aVertexUVBig = gl.getAttribLocation(shader, "aVertexUVBig");
		shader.uSamplerSand = gl.getUniformLocation(shader, "uSamplerSand");
		shader.uSamplerSandNorm = gl.getUniformLocation(shader, "uSamplerSandNorm");
		shader.uSamplerGrass = gl.getUniformLocation(shader, "uSamplerGrass");
		shader.uSamplerGrassNorm = gl.getUniformLocation(shader, "uSamplerGrassNorm");
		shader.uSamplerStone = gl.getUniformLocation(shader, "uSamplerStone");
		shader.uSamplerStoneNorm = gl.getUniformLocation(shader, "uSamplerStoneNorm");
		shader.uSamplerAlt = gl.getUniformLocation(shader, "uSamplerAlt");
		shader.uSamplerAltNorm = gl.getUniformLocation(shader, "uSamplerAltNorm");
		shader.uSamplerBlend = gl.getUniformLocation(shader, "uSamplerBlend");
		shader.uMaxHeight = gl.getUniformLocation(shader, "uMaxHeight");
		
		glShaders["terrain"] = shader;
	}
	
	this.loadWaterShader = function() {
		var shader = this.crearPrograma("shaders/water_shader.glsl", "");

		gl.linkProgram(shader);
		
		shader.aVertexPosition = gl.getAttribLocation(shader, "aVertexPosition");
		
		shader.aVertexColor = gl.getAttribLocation(shader, "aVertexColor");
		
		shader.uVMatrix = gl.getUniformLocation(shader, "uVMatrix");
		shader.uMMatrix = gl.getUniformLocation(shader, "uMMatrix");
		shader.uPMatrix = gl.getUniformLocation(shader, "uPMatrix");
		shader.uNMatrix = gl.getUniformLocation(shader, "uNMatrix");
		
		shader.uAmbientColor = gl.getUniformLocation(shader, "uAmbientColor");
		shader.uDirectionalColor = gl.getUniformLocation(shader, "uDirectionalColor");
		shader.uLightPosition = gl.getUniformLocation(shader, "uLightPosition");
		shader.uCameraPos = gl.getUniformLocation(shader, "uCameraPos");
		
		shader.aVertexUV = gl.getAttribLocation(shader, "aVertexUV");
		shader.uSampler1 = gl.getUniformLocation(shader, "uSamplerNormal");
		shader.uSamplerReflection = gl.getUniformLocation(shader, "uSamplerReflection");
		
		shader.uTime = gl.getUniformLocation(shader, "uTime");
		
		glShaders["water"] = shader;
	}
	
	this.loadSkyBoxShader = function() {
		var shader = this.crearPrograma("shaders/skybox_shader.glsl", "");

		gl.linkProgram(shader);
		
		shader.aVertexPosition = gl.getAttribLocation(shader, "aVertexPosition");
		
		shader.aVertexColor = gl.getAttribLocation(shader, "aVertexColor");
		
		shader.uVMatrix = gl.getUniformLocation(shader, "uVMatrix");
		shader.uMMatrix = gl.getUniformLocation(shader, "uMMatrix");
		shader.uPMatrix = gl.getUniformLocation(shader, "uPMatrix");
		shader.uNMatrix = gl.getUniformLocation(shader, "uNMatrix");
		
		shader.uSkyboxLight = gl.getUniformLocation(shader, "uSkyboxLight");
		
		shader.aVertexUV = gl.getAttribLocation(shader, "aVertexUV");
		shader.uSampler1 = gl.getUniformLocation(shader, "uSampler1");
		
		glShaders["skybox"] = shader;
	}
	
	this.load = function() {
		this.loadColorShader();
		this.loadTextureShader();
		this.loadTerrainShader();
		this.loadWaterShader();
		this.loadSkyBoxShader();
	}
	
}
