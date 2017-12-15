export const DEBUG = false;

export var gl;
export var shaderProgram;

export var mvMatrix = mat4.create();
var mvMatrixStack = [];
export var pMatrix = mat4.create();

export function mvPushMatrix(){
	var copy = mat4.create();
	mat4.copy(copy, mvMatrix);
	mvMatrixStack.push(copy);
}

export function mvPopMatrix() {
	if(mvMatrixStack.length == 0){
		throw "Invalid popMatrix";
	}
	mvMatrix = mvMatrixStack.pop();
}

export function setMatrixUniforms() {
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);

	var normalMatrix = mat3.create();
	mat3.normalFromMat4(normalMatrix, mvMatrix);
	gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);

}

export function mvMatrixRotate(degrees, rotationVector){
  mat4.rotate(mvMatrix, mvMatrix, glMatrix.toRadian(degrees), rotationVector);
}

export function mvMatrixTranslate(translationVector){
  mat4.translate(mvMatrix, mvMatrix, translationVector);
}


export function initWorld(canvas){
  gl = initGL(canvas);
  shaderProgram = initShaders(gl);
}


/**
 * gets WebGL context
 * @param  {canvas} canvas canvas html5 object
 * @return {gl}            gl context
 */
function initGL(canvas) {
  var gl = null;
  try {
    gl = canvas.getContext("webgl");
    if(DEBUG)
      gl = WebGLDebugUtils.makeDebugContext(gl, throwOnGLError, logAndValidate);
      gl.viewportWidth = canvas.width;
      gl.viewportHeight = canvas.height;
			console.log(canvas.width);
			console.log(canvas.height);
  } catch (ex) {
    console.log(ex);
  }
  if (!gl) {
    alert("Could not initialise WebGL");
  }
  console.log("gl init done");
  return gl;
}

//Debug related functions

function logAndValidate(functionName, args) {
  logGLCall(functionName, args);
  validateNoneOfTheArgsAreUndefined (functionName, args);
}

function throwOnGLError(err, funcName, args) {
  throw WebGLDebugUtils.glEnumToString(err) + " was caused by call to: " + funcName;
};

function logGLCall(functionName, args) {
  console.log("gl." + functionName + "(" +
  WebGLDebugUtils.glFunctionArgsToString(functionName, args) + ")");
}

function validateNoneOfTheArgsAreUndefined(functionName, args) {
  for (var ii = 0; ii < args.length; ++ii) {
    if (args[ii] === undefined) {
      console.error("undefined passed to gl." + functionName + "(" +
                     WebGLDebugUtils.glFunctionArgsToString(functionName, args) + ")");
    }
  }
}

/**
 * Searches through html page and creates either vertex or fragment shader, based on
 * the element's type. Then it passes it to WebGL to be compiled to run on graphic
 * card
 * @param  {[type]} gl [description]
 * @param  {[type]} id [description]
 * @return {[type]}    [description]
 */
function getShader(gl, id) {
  var shaderScript = document.getElementById(id);
  if (!shaderScript) {
    return null;
  }
  var str = "";
  var k = shaderScript.firstChild;
  while (k) {
    if (k.nodeType == 3) {
      str += k.textContent;
    }
    k = k.nextSibling;
  }

  var shader;
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  }
  else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  }
  else {
    return null;
  }

  gl.shaderSource(shader, str);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}

/**
 * Initializes shaders, they are necessary in WebGL in order to get WebGL running
 * on the graphic cards and to apply model-view matrix and  projection matrix to
 * scene without having to move around every point and every vertex
 * in (relatively) slow JavaScript.
 * @param  {gl}  gl             WebGL context
 * @return {glShaderProgram}    shaderProgram running on graphic card
 */
function initShaders(gl) {
  var shaderProgram;
  var fragmentShader = getShader(gl, "shader-fs");
  var vertexShader = getShader(gl, "shader-vs");

  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Could not initialise shaders");
  }

  gl.useProgram(shaderProgram);
  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
  gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

	shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
	gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
  shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
	shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, "uAmbientColor");
	shaderProgram.lightingDirectionUniform = gl.getUniformLocation(shaderProgram, "uLightingDirection");
	shaderProgram.directionalColorUniform = gl.getUniformLocation(shaderProgram, "uDirectionalColor");
	shaderProgram.useLightingUniform = gl.getUniformLocation(shaderProgram, "uUseLighting");

  return shaderProgram;
}
