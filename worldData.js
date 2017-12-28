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

/**
 * gets WebGL context
 * @param  {canvas} canvas canvas html5 object
 * @return  none
 */
export function initGL(canvas) {
  var glContext = null;
  try {
    glContext = canvas.getContext("webgl");
    if(DEBUG)
      glContext = WebGLDebugUtils.makeDebugContext(glContext, throwOnGLError, logAndValidate);
      glContext.viewportWidth = canvas.width;
      glContext.viewportHeight = canvas.height;
  } catch (ex) {
    console.log(ex);
  }
  if (!glContext) {
    alert("Could not initialise WebGL");
  }
  console.log("gl init done");
  gl = glContext;
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

export function initShaders(callback){
	async.waterfall([
		async.apply(loadShaders,[
			{path: '/Shaders/fragmentGeneric.glsl', type: "fragment"},
			{path: '/Shaders/vertexGeneric.glsl', type: "vertex"}
		]),
		createShaderProgram,

	], (err, result)=>{
		if(err){
			console.error(err);
			alert(err);
			return callback(err);
		}
		shaderProgram = result;
		return callback(null);
	});
}

 function loadShaders(shaderFiles, callback){
	async.mapLimit(shaderFiles, 5, async function(shaderFile){
		const response = await fetch(shaderFile.path);
		return response.text();
	},
	(err, result) =>{
		if(err)
			throw(err);
		var shaders = [];

		for(var [index, shaderFile] of shaderFiles.entries()){
			var shader = null;
			if(shaderFile.type === "fragment"){
				shader = gl.createShader(gl.FRAGMENT_SHADER);
			}
			else if(shaderFile.type === "vertex"){
				shader = gl.createShader(gl.VERTEX_SHADER);
			}
			else
				return callback("Ivalid shader type");

			gl.shaderSource(shader, result[index]);
			gl.compileShader(shader);
			if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
				let debugInfo = gl.getShaderInfoLog(shader);
				return callback(shaderFile.path + " compile Error\n" + debugInfo);
			}
			shaders.push(shader);
		}
		return callback(null,shaders);
	});
}

function createShaderProgram(shaders, callback){
	var shaderProgram = gl.createProgram();
	for(var shader of shaders){
		gl.attachShader(shaderProgram, shader);
	}
	gl.linkProgram(shaderProgram);
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		callback("Could not link shaders!");
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
	shaderProgram.useLightingUniform = gl.getUniformLocation(shaderProgram, "uUseLighting");
	shaderProgram.pointLightingLocationUniform = gl.getUniformLocation(shaderProgram, "uPointLightingLocation");
	shaderProgram.pointLightingSpecularColorUniform = gl.getUniformLocation(shaderProgram, "uPointLightingSpecularColor");
	shaderProgram.pointLightingDiffuseColorUniform = gl.getUniformLocation(shaderProgram, "uPointLightingDiffuseColor");
	shaderProgram.useTexturesUniform = gl.getUniformLocation(shaderProgram, "uUseTextures");
	shaderProgram.showSpecularHighlightsUniform = gl.getUniformLocation(shaderProgram, "uShowSpecularHighlights");
	shaderProgram.materialShininessUniform = gl.getUniformLocation(shaderProgram, "uMaterialShininess");
	callback(null, shaderProgram);
}
