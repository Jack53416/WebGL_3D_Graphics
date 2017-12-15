import * as world from './worldData.js';
import {gl,shaderProgram} from './worldData.js';
import {Sphere} from './worldObjects.js';

/**
 * Initializes gl buffers that stores positions of the vertices. Buffers are stored on
 * the graphic card
 * @param  {gl} gl gl object
 * @return {None}    None
 */
function initBuffers(gl) {
// inside Sphere class
}

var sphere = null;
var zoom = -20.0;

function initWorldObjects(){
  const radius = 2;
  const boundsNum = 50;
  sphere = new Sphere(boundsNum, boundsNum, radius);
}
function drawScene() {
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
  gl.enable(gl.DEPTH_TEST);

  var lighting = document.getElementById("lighting").checked;
	gl.uniform1i(shaderProgram.useLightingUniform, lighting);
	if(lighting){
		gl.uniform3f(
			shaderProgram.ambientColorUniform,
			parseFloat(document.getElementById("ambientR").value),
			parseFloat(document.getElementById("ambientG").value),
			parseFloat(document.getElementById("ambientB").value)
		);

		var ligtingDirection = [
			parseFloat(document.getElementById("lightDirectionX").value),
			parseFloat(document.getElementById("lightDirectionY").value),
			parseFloat(document.getElementById("lightDirectionZ").value)
		];

		var adjustedLD = vec3.create();
		vec3.normalize(adjustedLD, ligtingDirection);
		vec3.scale(adjustedLD, adjustedLD, -1);
		gl.uniform3fv(shaderProgram.lightingDirectionUniform, adjustedLD);

		gl.uniform3f(
			shaderProgram.directionalColorUniform,
			parseFloat(document.getElementById("directionalR").value),
			parseFloat(document.getElementById("directionalG").value),
			parseFloat(document.getElementById("directionalB").value)
		);
	}
  sphere.draw();
}

var lastTime = 0;

function animate(){
	var timeNow = new Date().getTime();
	if (lastTime != 0) {
		var elapsed = timeNow - lastTime;
    if(!mouseDown){
      sphere.rotate(0.005, 0);
    }
	}
	lastTime = timeNow;

}

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
var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;

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
		ySpeed += 1;
	//up arrow
	if(currentlyPressedKeys[38])
		tilt -=1;
	//down arrow
	if(currentlyPressedKeys[40])
		tilt +=1;*/
}

function handleMouseDown(event){
  mouseDown = true;
  lastMouseX = event.clientX;
  lastMouseY = event.clientY;
}

function handleMouseUp(event){
  mouseDown = false;
}

function handleMouseMove(event){
  if(!mouseDown)
    return;

  var newX = event.clientX;
  var newY = event.clientY;

  var deltaX = newX - lastMouseX;
  var deltaY = newY - lastMouseY;
  console.log("dx = " + deltaX);
  console.log("dy = " + deltaY);
  sphere.rotate(deltaX / 10, deltaY / 10);

  lastMouseX = newX;
  lastMouseY = newY;
}

/**
 * Calls the function to initalize webGl and shaders, start of an app
 */
(function webGLStart() {
  var canvas = document.getElementById("lesson01-canvas");
  var canvasBorder = canvas.getBoundingClientRect();
  canvas.width = canvasBorder.width;
  canvas.height = canvasBorder.height;
	world.initWorld(canvas);
	initBuffers(gl);
	initWorldObjects();
	var moonTexture = initTexture(gl, 'moon.gif');
  Sphere.setTexture(moonTexture);
  // sets clear color of the canvas
  gl.clearColor(0.0, 0.0, 0.0, 1);
	document.onkeydown = handleKeyDown;
	document.onkeyup = handleKeyUp;
  canvas.onmousedown = handleMouseDown;
  document.onmouseup = handleMouseUp;
  document.onmousemove = handleMouseMove;

  window.addEventListener("resize", function(){
    var canvasBorder = canvas.getBoundingClientRect();
    canvas.width = canvasBorder.width;
    canvas.height = canvasBorder.height;
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height
  });

	tick();
})();

function tick(){
	if(!world.DEBUG)
		requestAnimationFrame(tick);
	drawScene();
	animate();
  handleKeys();
}
