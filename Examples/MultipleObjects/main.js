import * as world from './worldData.js';
import {gl,shaderProgram} from './worldData.js';
import {Star} from './worldObjects.js';

/**
 * Initializes gl buffers that stores positions of the vertices. Buffers are stored on
 * the graphic card
 * @param  {gl} gl gl object
 * @return {None}    None
 */
function initBuffers(gl) {
  	var starVertexPositionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, starVertexPositionBuffer);
		var vertices = [
			-1.0, -1.0, 0.0,
			 1.0, -1.0, 0.0,
			-1.0,  1.0, 0.0,
			 1.0,  1.0, 0.0
		];
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
		starVertexPositionBuffer.itemSize = 3;
		starVertexPositionBuffer.numItems = 4;

		var starVertexTextureCoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, starVertexTextureCoordBuffer);
		var textureCoords = [
			0.0, 0.0,
			1.0, 0.0,
			0.0, 1.0,
			1.0, 1.0
		];
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
		starVertexTextureCoordBuffer.itemSize = 2;
		starVertexTextureCoordBuffer.numItems = 4;

		Star.setVertexBuffers(starVertexTextureCoordBuffer, starVertexPositionBuffer);
}

var stars = [];
var zoom = -20.0;
var tilt = 90;
var spin = 0;

function initWorldObjects(){
	const starNum = 50;
	for(var i = 0; i < starNum; i++){
		stars.push(new Star((i / starNum) * 5, i / starNum));
	}
}
function drawScene(gl, shaderProgram, crateTexture) {
  // tells webGl about size of the canvas
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  //cleares the canvas before drawing on it
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // sets perspective projection, specifying vertical field of view to 45°,
  // passes the width to height ratio of the screen
  // and sets objects closer than 0.1 and further than 100 units as invisible
  mat4.perspective(world.pMatrix, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);
  // Initializes model-view matrix - a matrix that hold current position and rotation
  mat4.identity(world.mvMatrix);
  // moves centre of 3D space, in this case 5 into the scene(-5)
  mat4.translate(world.mvMatrix, world.mvMatrix, [0.0, 0.0, zoom]);
  mat4.rotate(world.mvMatrix, world.mvMatrix, glMatrix.toRadian(tilt), [1, 0, 0]);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
	gl.enable(gl.BLEND);

	var twinkle = document.getElementById("twinkle").checked;

	for(var star of stars){
		star.draw(tilt, spin, twinkle);
		spin += 0.1;
	}


}

var lastTime = 0;

function animate(){
	var timeNow = new Date().getTime();
	if (lastTime != 0) {
		var elapsed = timeNow - lastTime;
		for(var star of stars){
			star.animate(elapsed);
		}
	}
	lastTime = timeNow;

}

var crateTexture;

function initTexture(gl, fileName){
  var texture = gl.createTexture();
	texture.image = new Image();
  texture.image.onload = function(){
    handleLoadedTexture(texture);
  };
  texture.image.src = fileName;
  return texture;
}
/**
 * Callback, called when image ends loading process
 * @param  {glTexture} texture 	glTexture object
 * @return {None}         		 	None
 */
function handleLoadedTexture(texture){
	//All images need to flipped verticaly as in GIF format coordinates increase
	//as one moves downwards on the vertical axis, horizontal stays the same
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	//sets the current texture on which the operations are performed
  gl.bindTexture(gl.TEXTURE_2D, texture);
	//Uploads image to the texture's space on the graphic card {kind of image, detail level,
	//format of storage on the card x2, datatype used to store RGB, image itself}
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
	//specifies scaling parameters of the texture, how to scale-uo, nearest
	//use original image as it is
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	//and how to scale-down
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
	gl.generateMipmap(gl.TEXTURE_2D);
	//sets the current texture to null, for cleanup purposes
  gl.bindTexture(gl.TEXTURE_2D, null);
}

var currentlyPressedKeys = {};

function handleKeyDown(event){
	currentlyPressedKeys[event.keyCode] = true;
	if(String.fromCharCode(event.keyCode) == "F"){
		filter++;
		filter %= 3;
		console.log("filter: " + filter);
	}
}

function handleKeyUp(event){
	currentlyPressedKeys[event.keyCode] = false;
}

function handleKeys(){
	//page up
	if(currentlyPressedKeys[33])
		zoom -= 0.05;
	//page down
	if(currentlyPressedKeys[34])
		zoom += 0.05;
	//left arrow
	/*if(currentlyPressedKeys[37])
		ySpeed -= 1;
	//right arrow
	if(currentlyPressedKeys[39])
		ySpeed += 1;*/
	//up arrow
	if(currentlyPressedKeys[38])
		tilt -=1;
	//down arrow
	if(currentlyPressedKeys[40])
		tilt +=1;
}

/**
 * Calls the function to initalize webGl and shaders, start of an app
 */
(function webGLStart() {
  var canvas = document.getElementById("lesson01-canvas");
	world.initWorld(canvas);
	initBuffers(gl);
	initWorldObjects();
	var starTexture = initTexture(gl, 'star.gif');
  Star.setStarTexture(starTexture);
  // sets clear color of the canvas
  gl.clearColor(0.0, 0.0, 0.0, 1);
	document.onkeydown = handleKeyDown;
	document.onkeyup = handleKeyUp;
	tick();
})();

function tick(){
	if(!world.DEBUG)
		requestAnimationFrame(tick);
	handleKeys();
	drawScene(gl, shaderProgram, crateTexture);
	animate();
}
