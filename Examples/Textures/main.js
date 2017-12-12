"use strict";

var mvMatrix = mat4.create();
var mvMatrixStack = [];
var pMatrix = mat4.create();

function mvPushMatrix(){
	var copy = mat4.create();
	mat4.copy(copy, mvMatrix);
	mvMatrixStack.push(copy);
}

function mvPopMatrix() {
	if(mvMatrixStack.length == 0){
		throw "Invalid popMatrix";
	}
	mvMatrix = mvMatrixStack.pop();
}

function setMatrixUniforms(gl, shaderProgram) {
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

var cubeVertexPositionBuffer;
var cubeVertexTextureCoordBuffer;
var cubeVertexIndexBuffer;
/**
 * Initializes gl buffers that stores positions of the vertices. Buffers are stored on
 * the graphic card
 * @param  {gl} gl gl object
 * @return {None}    None
 */
function initBuffers(gl) {
  cubeVertexPositionBuffer = gl.createBuffer();
  // sets the current buffer to cubeVertexPositionBuffer, so all following buffer operations
  // will be performed on that buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
  //defines the vertices for tne cube with center (0,0,0)
  var vertices = [
              // Front face
              -1.0, -1.0,  1.0,
               1.0, -1.0,  1.0,
               1.0,  1.0,  1.0,
              -1.0,  1.0,  1.0,
              // Back face
              -1.0, -1.0, -1.0,
              -1.0,  1.0, -1.0,
               1.0,  1.0, -1.0,
               1.0, -1.0, -1.0,
              // Top face
              -1.0,  1.0, -1.0,
              -1.0,  1.0,  1.0,
               1.0,  1.0,  1.0,
               1.0,  1.0, -1.0,
              // Bottom face
              -1.0, -1.0, -1.0,
               1.0, -1.0, -1.0,
               1.0, -1.0,  1.0,
              -1.0, -1.0,  1.0,
              // Right face
               1.0, -1.0, -1.0,
               1.0,  1.0, -1.0,
               1.0,  1.0,  1.0,
               1.0, -1.0,  1.0,
              // Left face
              -1.0, -1.0, -1.0,
              -1.0, -1.0,  1.0,
              -1.0,  1.0,  1.0,
              -1.0,  1.0, -1.0,
          ];
  //creates float32 array based on javascript list and tells webgl to fill with it current buffer
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  // 3 separete vertex positions, each made up of 24 numbers
  cubeVertexPositionBuffer.itemSize = 3;
  cubeVertexPositionBuffer.numItems = 24;

  cubeVertexTextureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
	//specifies where given vertex lies in the texture, with texture dimensions
	//being 1.0 x 1.0
  var textureCoords = [
    // Front face
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    // Back face
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,
    // Top face
    0.0, 1.0,
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    // Bottom face
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,
    1.0, 0.0,
    // Right face
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,
    // Left face
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
  cubeVertexTextureCoordBuffer.itemSize = 2;
  cubeVertexTextureCoordBuffer.numItems = 24;
  cubeVertexIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
  var cubeVertexIndices = [
      0, 1, 2,      0, 2, 3,    // Front face
      4, 5, 6,      4, 6, 7,    // Back face
      8, 9, 10,     8, 10, 11,  // Top face
      12, 13, 14,   12, 14, 15, // Bottom face
      16, 17, 18,   16, 18, 19, // Right face
      20, 21, 22,   20, 22, 23  // Left face
  ];
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
  cubeVertexIndexBuffer.itemSize = 1;
  cubeVertexIndexBuffer.numItems = 36;
}

var xRot = 0;
var yRot = 0;
var zRot = 0;

function drawScene(gl, shaderProgram, neheTexture) {
  // tells webGl about size of the canvas
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  //cleares the canvas before drawing on it
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // sets perspective projection, specifying vertical field of view to 45°,
  // passes the width to height ratio of the screen
  // and sets objects closer than 0.1 and further than 100 units as invisible
  mat4.perspective(pMatrix, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);

  // Initializes model-view matrix - a matrix that hold current position and rotation
  mat4.identity(mvMatrix);
  // moves centre of 3D space, in this case 5 into the scene(-5)
  mat4.translate(mvMatrix, mvMatrix, [0.0, 0.0, -5.0]);

  mat4.rotate(mvMatrix, mvMatrix, glMatrix.toRadian(xRot), [1, 0, 0]);
  mat4.rotate(mvMatrix, mvMatrix, glMatrix.toRadian(yRot), [0, 1, 0]);
  mat4.rotate(mvMatrix, mvMatrix, glMatrix.toRadian(zRot), [0, 0, 1]);

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
  gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, cubeVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

	// sets the active texture to one that was loaded before
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, neheTexture);
	//passes the value 0 to the shader uniform variable
  gl.uniform1i(shaderProgram.samplerUniform, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);

  //Tells WebGL to take into account model view matrix and projection matrix
  setMatrixUniforms(gl, shaderProgram);
  gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0)
}

	var lastTime = 0;

function animate(){
	var timeNow = new Date().getTime();
	if (lastTime != 0) {
		var elapsed = timeNow - lastTime;

    xRot += (90 * elapsed) / 1000.0;
    yRot += (90 * elapsed) / 1000.0;
    zRot += (90 * elapsed) / 1000.0;
	}
	lastTime = timeNow;

}

var gl;
var shaderProgram;
var neheTexture;

function initTexture(gl){
  var neheTexture = gl.createTexture();
  neheTexture.image = new Image();
  neheTexture.image.onload = function(){
    handleLoadedTexture(neheTexture);
  };
  neheTexture.image.src = 'nehe.gif';
  return neheTexture;
}
/**
 * Callback, called when image ends loading process
 * @param  {glTexture} texture 	glTexture object
 * @return {None}         		 	None
 */
function handleLoadedTexture(texture){
	//sets the current texture on which the operations are performed
  gl.bindTexture(gl.TEXTURE_2D, texture);
	//All images need to flipped verticaly as in GIF format coordinates increase
	//as one moves downwards on the vertical axis, horizontal stays the same
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	//Uploads image to the texture's space on the graphic card {kind of image, detail level,
	//format of storage on the card x2, datatype used to store RGB, image itself}
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
	//specifies scaling parameters of the texture, how to scale-uo, nearest
	//use original image as it is
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	//and how to scale-down
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	//sets the current texture to null, for cleanup purposes
  gl.bindTexture(gl.TEXTURE_2D, null);
}

/**
 * Calls the function to initalize webGl and shaders, start of an app
 */
function webGLStart() {
  var canvas = document.getElementById("lesson01-canvas");
  gl = initGL(canvas);
  shaderProgram = initShaders(gl);
  initBuffers(gl);
  neheTexture = initTexture(gl);
  // sets clear color of the canvas
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // enables depth testing, objects behind anorher object won't be visible
  gl.enable(gl.DEPTH_TEST);

  drawScene(gl, shaderProgram, neheTexture);

  tick(gl);
}

	function tick(){
		requestAnimationFrame(tick);
		drawScene(gl, shaderProgram, neheTexture);
		animate();
	}
