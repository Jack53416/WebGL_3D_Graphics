import * as world from './worldData.js';
import {gl,shaderProgram} from './worldData.js';
import {Model, Sphere} from './worldObjects.js';
import {Camera} from './camera.js';

var camera = new Camera();
/**
 * Initializes gl buffers that stores positions of the vertices. Buffers are stored on
 * the graphic card
 * @param  {gl} gl gl object
 * @return {None}    None
 */
function initBuffers(gl) {
// inside Sphere class
}

var teapot;
function initWorldObjects(){
  var texture = initTexture(gl, "teapotTexture.jpg");
  teapot = new Sphere(
    30,
    30,
    2,
  {texture: texture});
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
  mat4.multiply(world.mvMatrix, camera.transformMatrix, world.mvMatrix);
  gl.enable(gl.DEPTH_TEST);

  var lighting = document.getElementById("lighting").checked;
  var specularHighlights = document.getElementById("specular").checked;
  var useTextures = document.getElementById("textures").checked;
	gl.uniform1i(shaderProgram.useLightingUniform, lighting);
  gl.uniform1i(shaderProgram.showSpecularHighlightsUniform, specularHighlights);
  gl.uniform1i(shaderProgram.useTexturesUniform, useTextures);
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
      parseFloat(document.getElementById("lightPositionZ").value),
    );
    gl.uniform3f(
      shaderProgram.pointLightingDiffuseColorUniform,
      parseFloat(document.getElementById("diffusePointR").value),
      parseFloat(document.getElementById("diffusePointG").value),
      parseFloat(document.getElementById("diffusePointB").value)
    );
    if(specularHighlights){
      gl.uniform3f(
        shaderProgram.pointLightingSpecularColorUniform,
        parseFloat(document.getElementById("specularPointR").value),
        parseFloat(document.getElementById("specularPointG").value),
        parseFloat(document.getElementById("specularPointB").value)
      );

      teapot.shininess = parseFloat(document.getElementById("shininess").value);
    }
	}
  teapot.draw();
}


animate.lastTime = 0;

function animate(){
	var timeNow = new Date().getTime();
	if (animate.lastTime != 0) {
		var elapsed = timeNow - animate.lastTime;
    teapot.rotate(0, 0.1 * elapsed);
	}
	animate.lastTime = timeNow;
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
var lastMouseX = 0;
var lastMouseY = 0;

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
	//left arrow or a
	if(currentlyPressedKeys[37] || currentlyPressedKeys[65])
		camera.truck(-0.1);
	//right arrow or d
	if(currentlyPressedKeys[39] || currentlyPressedKeys[68])
		camera.truck(+0.1);
	//up arrow or w
	if(currentlyPressedKeys[38] || currentlyPressedKeys[87] )
		camera.pedestal(0.1)
	//down arrow or s
	if(currentlyPressedKeys[40] || currentlyPressedKeys[83])
		camera.pedestal(-0.1);
    //q
  if(currentlyPressedKeys[81])
    camera.tilt(-1.0);
  //e
  if(currentlyPressedKeys[69])
    camera.tilt(1.0);
  //z
  if(currentlyPressedKeys[90])
    camera.pan(-1.0);
  //c
  if(currentlyPressedKeys[67])
    camera.pan(1.0);

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
  camera.arcCrane(deltaX / 2, deltaY / 2);
  lastMouseX = newX;
  lastMouseY = newY;
}


function MouseWheelHandler(e) {
  // cross-browser wheel delta
  var e = window.event || e; // old IE support
  var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
  camera.zoom(-delta);

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
  gl.clearColor(0.0, 0.0, 0.0, 0.4);
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

  canvas.onmousedown = handleMouseDown;
  document.onmouseup = handleMouseUp;
  document.onmousemove = handleMouseMove;
  var cameraOptions = {
    eye:{
      xSlider: document.getElementById("eyeX"),
      ySlider: document.getElementById("eyeY"),
      zSlider: document.getElementById("eyeZ")
    }
  };
  if(world.DEBUG)
	 setTimeout(tick, 1000);
  else
    tick();
})();
function tick(){
	if(!world.DEBUG)
		requestAnimationFrame(tick);
	drawScene();
	animate();
  handleKeys();
}
