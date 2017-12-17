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

var spheres = [];
var zoom = -20.0;

function initWorldObjects(){
  const radius = 2;
  const boundsNum = 30;
  var moon = new Sphere(boundsNum, boundsNum, radius);
  var earth = new Sphere(boundsNum*2, boundsNum*2, radius*2);
  var moonTexture = initTexture(gl, 'moon.gif');
  var earthTexture = initTexture(gl, 'earth.gif');
  moon.setTexture(moonTexture);
  earth.setTexture(earthTexture);
  moon.setPosition(10, 0, 0);
  earth.setPosition(10, 0 ,0);
  moon.setOrbitAngle(180);
  earth.setOrbitAngle(0);
  spheres.push(moon);
  spheres.push(earth);
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

    gl.uniform3f(
      shaderProgram.pointLightingLocationUniform,
      parseFloat(document.getElementById("lightPositionX").value),
      parseFloat(document.getElementById("lightPositionY").value),
      parseFloat(document.getElementById("lightPositionZ").value) + zoom
    );

		gl.uniform3f(
      shaderProgram.pointLightingColorUniform,
			parseFloat(document.getElementById("pointR").value),
			parseFloat(document.getElementById("pointG").value),
			parseFloat(document.getElementById("pointB").value)
		);
	}
  for(var sphere of spheres){
    sphere.draw();
  }
}

var lastTime = 0;

function animate(){
	var timeNow = new Date().getTime();
	if (lastTime != 0) {
		var elapsed = timeNow - lastTime;
    for(var sphere of spheres){
      sphere.rotate(0.02 * elapsed, 0);
      sphere.setOrbitAngle(sphere.orbitAngle += 0.01 * elapsed);
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

function MouseWheelHandler(e) {
  // cross-browser wheel delta
  var e = window.event || e; // old IE support
  var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
  zoom += delta;

  return false;
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

  // sets clear color of the canvas
  gl.clearColor(0.0, 0.0, 0.0, 1);
	document.onkeydown = handleKeyDown;
	document.onkeyup = handleKeyUp;

  window.addEventListener("resize", function(){
    var canvasBorder = canvas.getBoundingClientRect();
    canvas.width = canvasBorder.width;
    canvas.height = canvasBorder.height;
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height
  });

  if (canvas.addEventListener) {
    // IE9, Chrome, Safari, Opera
    canvas.addEventListener("mousewheel", MouseWheelHandler, false);
    // Firefox
    canvas.addEventListener("DOMMouseScroll", MouseWheelHandler, false);
  }
  // IE 6/7/8
    else canvas.attachEvent("onmousewheel", MouseWheelHandler);

	tick();
})();

function tick(){
	if(!world.DEBUG)
		requestAnimationFrame(tick);
	drawScene();
	animate();
  handleKeys();
}
