// Funciones para crear el canvas que dibuja curvas en 2D

var curve_canvas = null;
var curve_gl = null;
var curve_shader = null;

var curve_up_points = [[0.0, 1.0, 0.0], [0.0, 1.0, 0.0], [0.0, 1.0, 0.0]];
var curve_down_points = [[0.0, -1.0, 0.0], [0.0, -1.0, 0.0], [0.0, -1.0, 0.0]];

var curve_points = [[-0.4, -0.8, 0.0], [0.6, 0.0, 0.0], [-0.2, 0.6, 0.0]];
var curve_spline = null;


// Linkea el canvas y lo obtiene el contexto webGL para poder graficar en el
function init_curve_canvas() {
	curve_canvas = document.getElementById("curve_canvas");
	try {
		curve_gl = curve_canvas.getContext("webgl");
	} catch (e) {
		console.log("Error cargando WebGL");
	}
	
	curve_gl.clearColor(1.0, 1.0, 1.0, 1.0);
	curve_gl.enable(curve_gl.DEPTH_TEST);
	curve_gl.depthFunc(curve_gl.LEQUAL);
	
	curve_gl.clear(curve_gl.COLOR_BUFFER_BIT|curve_gl.DEPTH_BUFFER_BIT);
	curve_gl.viewport(0, 0, curve_canvas.width, curve_canvas.height);
	
	init_curve_shaders();
	init_curve_handlers();
}

// Compila y configura los shaders 2D
function init_curve_shaders() {
	var fragmentShader = getShader(curve_gl, "curve-shader-vs");
	var vertexShader = getShader(curve_gl, "curve-shader-fs");
	
	curve_shader = curve_gl.createProgram();
	curve_gl.attachShader(curve_shader, vertexShader);
	curve_gl.attachShader(curve_shader, fragmentShader);
	curve_gl.linkProgram(curve_shader);
	
	if (!curve_gl.getProgramParameter(curve_shader, curve_gl.LINK_STATUS)) {
		alert("Error cargando los shaders.  " + curve_gl.getProgramInfoLog(curve_shader));
		return null;
	}
	
	curve_shader.aVertexPosition = curve_gl.getAttribLocation(curve_shader, "aVertexPosition");
	curve_gl.enableVertexAttribArray(curve_shader.aVertexPosition);
		
	curve_shader.uVMatrix = curve_gl.getUniformLocation(curve_shader, "uVMatrix");
	curve_shader.uPMatrix = curve_gl.getUniformLocation(curve_shader, "uPMatrix");
	
	
	curve_gl.useProgram(curve_shader);
	
	var PMatrix = mat4.create();
	var VMatrix = mat4.create();
	
	mat4.ortho(PMatrix, -1.0, 1.0, -1.0, 1.0, -10, 10);
	mat4.lookAt(VMatrix, [0.0, 0.0, 10], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
	
	curve_gl.uniformMatrix4fv(curve_shader.uPMatrix, false, PMatrix);
	curve_gl.uniformMatrix4fv(curve_shader.uVMatrix, false, VMatrix);
}

// Inicializa los handlers para el nuevo canvas
function init_curve_handlers() {
	curve_canvas.onmousedown = on_mouse_click_curve_input;
	curve_update();
}	

// Funcion comparadora auxiliar que ordena por coordenada y
function comparator(a, b) {
	return (a[1] - b[1]);
}

// Regenera la curva y vuelve a dibujar
function curve_update() {
	curve_gl.clear(curve_gl.COLOR_BUFFER_BIT|curve_gl.DEPTH_BUFFER_BIT);
	curve_spline = new CubicBSpline();
	curve_spline.create(curve_down_points.concat(curve_points, curve_up_points));
	curve_spline.setupWebGLBuffers(0.1);
	curve_spline.grid.draw_2D();
	draw_points();
}

// Obtiene el punto más cercano
function get_closest_point_index(x, y) {
	var min = null;
	var index = 0;
	var target = vec3.fromValues(x, y, 0.0);
	for (var i = 0; i < curve_points.length; i++) {
		var act = vec3.dist(curve_points[i], target);
		if (min == null || act < min) {
			min = act;
			index = i;
		}
	}
	return index;
}

// Vuelve al segmento inicial
function clear_points() {
	curve_points = [];
	curve_update();
}

// El handler de click
function on_mouse_click_curve_input(e) {
	if (e.buttons == 1 && e.shiftKey == false) {	// Click izquierdo
		var x = 2*(e.clientX-curve_canvas.offsetLeft)/curve_canvas.width - 1.0;
		var y = -2*(e.clientY-curve_canvas.offsetTop)/curve_canvas.height + 1.0;
		curve_points.push([x, y, 0.0]);
		curve_points.sort(comparator);
		curve_update();
		
	} else if (e.buttons == 1 && e.shiftKey == true) {	// Shift-click
		var x = 2*(e.clientX-curve_canvas.offsetLeft)/curve_canvas.width - 1.0;
		var y = -2*(e.clientY-curve_canvas.offsetTop)/curve_canvas.height + 1.0;
		if (curve_points.length > 0) {
			var index = get_closest_point_index(x, y);
			curve_points.splice(index, 1);
			curve_update();
		}
	}
}	

// Devuelve los puntos ingresados a la curva
function get_curve_input_points(){
	var tmp = [];
	for (var i = 0; i < curve_points.length; i++) {
		tmp[i] = [0.0, 0.0, 0.0];
		vec3.copy(tmp[i], curve_points[i]);
	}
	return tmp;
}

function draw_points() {
	var pos_buffer = curve_gl.createBuffer();
	var points = curve_down_points.concat(curve_points, curve_up_points);
	var aux = [];
	for (var i = 0; i < points.length; i++) {
		for (var j = 0; j < 3; j++) {
			aux.push(points[i][0]);
			aux.push(points[i][1]);
			aux.push(points[i][2]);
		}
	}
	curve_gl.bindBuffer(curve_gl.ARRAY_BUFFER, pos_buffer);
	curve_gl.bufferData(curve_gl.ARRAY_BUFFER, new Float32Array(aux), curve_gl.STATIC_DRAW);
	pos_buffer.itemSize = 3;
	pos_buffer.numItems = aux.length/3;
	curve_gl.vertexAttribPointer(curve_shader.aVertexPosition, 3, curve_gl.FLOAT, false, 0, 0);
		
	curve_gl.drawArrays(curve_gl.POINTS, 0, pos_buffer.numItems);
}



