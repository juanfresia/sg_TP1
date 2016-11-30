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
	
	this.obtenerShader = function() {
		return this.crearPrograma("shaders/texturas_simples.glsl", "");
	}
	
}
