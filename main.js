import * as world from './worldData.js';
import {gl,shaderProgram} from './worldData.js';
import {Model, Sphere, Cuboid, Hand, PointLight, ModelGroup} from './worldObjects.js';
import * as events from './events.js';
import {Camera} from "./camera.js";

var worldObjects = [];
var camera = new Camera();
var light;
var hand;

function initWorldObjects(callback){
  var texture = initTexture(gl, "./Textures/bricks.jpg");
  var floor = new Cuboid(
    vec3.fromValues(-40, -15, 30),
    vec3.fromValues(40, -12, -30),
    {
      texture: texture,
      textureTile: 8
  });

  light = new PointLight({
    posX: parseFloat(document.getElementById("lightPositionX").value),
    posY: parseFloat(document.getElementById("lightPositionY").value),
    posZ: parseFloat(document.getElementById("lightPositionZ").value),
    texture: initTexture(gl, "./Textures/lightpaper.png"),
    shininess: 10
  });
  events.bindLightEvents(light);

  hand = new Hand("./Models/hand.json", {texture: initTexture(gl, "./Textures/teapotTexture.jpg")} , function(err){
    console.log(hand)
    console.log(ModelGroup.prototype);
    console.log(Sphere.prototype);
    worldObjects.push(floor);
    worldObjects.push(hand);
    worldObjects.push(light);
    if(err){
      return callback(err);
    }
    return callback(null);
  });

  document.getElementById("animationSpeed").oninput = (event) =>{
    hand.animationSpeed = event.hasOwnProperty('srcElement') ? Number(event.srcElement.value) : Number(event.target.value);
    events.editEventsArguments([
      {key: '1', parameters: [0, hand.animationSpeed]},
      {key: '2', parameters: [1, hand.animationSpeed]},
      {key: '3', parameters: [2, hand.animationSpeed]},
      {key: '4', parameters: [3, hand.animationSpeed]},
      {key: '5', parameters: [4, hand.animationSpeed]},
      {key: '6', parameters: [0, -hand.animationSpeed]},
      {key: '7', parameters: [1, -hand.animationSpeed]},
      {key: '8', parameters: [2, -hand.animationSpeed]},
      {key: '9', parameters: [3, -hand.animationSpeed]},
      {key: '0', parameters: [4, -hand.animationSpeed]}
    ]);
  }
  document.getElementById("animate").onchange = (event) => {
    hand.animated =  event.hasOwnProperty('srcElement') ? event.srcElement.checked : event.target.checked;
  }

  events.addControlSchema(hand, [
    {key: '1', handler: hand.bendFinger, parameters: [0, hand.animationSpeed], animated: true},
    {key: '2', handler: hand.bendFinger, parameters: [1, hand.animationSpeed], animated: true},
    {key: '3', handler: hand.bendFinger, parameters: [2, hand.animationSpeed], animated: true},
    {key: '4', handler: hand.bendFinger, parameters: [3, hand.animationSpeed], animated: true},
    {key: '5', handler: hand.bendFinger, parameters: [4, hand.animationSpeed], animated: true},
    {key: '6', handler: hand.bendFinger, parameters: [0, -hand.animationSpeed], animated: true},
    {key: '7', handler: hand.bendFinger, parameters: [1, -hand.animationSpeed], animated: true},
    {key: '8', handler: hand.bendFinger, parameters: [2, -hand.animationSpeed], animated: true},
    {key: '9', handler: hand.bendFinger, parameters: [3, -hand.animationSpeed], animated: true},
    {key: '0', handler: hand.bendFinger, parameters: [4, -hand.animationSpeed], animated: true},
    {key: 'k', handler: hand.rotate, parameters: [1, [1,0,0]], animated: true},
    {key: 'l', handler: hand.rotate, parameters: [-1, [1,0,0]], animated: true},
    {key: 'o', handler: hand.rotate, parameters: [1, [0,0,1]], animated: true},
    {key: 'p', handler: hand.rotate, parameters: [-1, [0,0,1]], animated: true},
    {key: 'n', handler: hand.rotate, parameters: [1, [0,1,0]], animated: true},
    {key: 'm', handler: hand.rotate, parameters: [-1, [0,1,0]], animated: true}
  ]);

}

function drawScene() {
  // tells webGl about size of the canvas
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  //cleares the canvas before drawing on it
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // sets perspective projection, specifying vertical field of view to 45°,
  // passes the width to height ratio of the screen
  // and sets objects closer than 0.1 and further than 100 units as invisible
  mat4.perspective(world.pMatrix, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 200.0);
  // Initializes model-view matrix - a matrix that hold current position and rotation
  mat4.identity(world.mvMatrix);
  mat4.multiply(world.mvMatrix, camera.transformMatrix, world.mvMatrix);
  gl.uniformMatrix4fv(shaderProgram.cameraMatrixUniform, false, world.mvMatrix);
  gl.enable(gl.DEPTH_TEST);
  passLightingData(shaderProgram);
  for(var object of worldObjects){
      object.draw();
  }
}

function passLightingData(shaderProgram){
  var lighting = document.getElementById("lighting").checked;
  var useTextures = document.getElementById("textures").checked;

  gl.uniform1i(shaderProgram.useLightingUniform, lighting);
  gl.uniform1i(shaderProgram.useTexturesUniform, useTextures);
	if(lighting){
		gl.uniform3f(
			shaderProgram.ambientColorUniform,
			parseFloat(document.getElementById("ambientR").value),
			parseFloat(document.getElementById("ambientG").value),
			parseFloat(document.getElementById("ambientB").value)
		);
  }

}

animate.lastTime = 0;
function animate(){
	var timeNow = new Date().getTime();
	if (animate.lastTime != 0) {
		var elapsed = timeNow - animate.lastTime;
    if(hand.animated)
      hand.rotate(0.05 * elapsed, [1,0,0]);
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

/**
 * Calls the function to initalize webGl and shaders, start of an app
 */
(function webGLStart() {
  var canvas = document.getElementById("WebGLCanvas");
  var canvasBorder = canvas.getBoundingClientRect();
  canvas.width = canvasBorder.width;
  canvas.height = canvasBorder.height;
  world.initGL(canvas);
  async.parallel([
    world.initShaders,
    initWorldObjects,
    function(callback){
      events.bindCanvasEvents(canvas);
      events.addControlSchema(camera,[
        {key: 'a', handler: camera.truck, parameters: [-0.1], animated: true},
        {key: 'd', handler: camera.truck, parameters: [0.1]},
        {key: 'w', handler: camera.pedestal, parameters: [0.1]},
        {key: 's', handler: camera.pedestal, parameters: [-0.1]},
        {key: 'q', handler: camera.tilt, parameters: [-1]},
        {key: 'e', handler: camera.tilt, parameters: [1]},
        {key: 'z', handler: camera.pan, parameters: [1]},
        {key: 'c', handler: camera.pan, parameters: [-1]}
      ]);
      events.bindMouseEvents(camera, camera.arcCrane, camera.zoom);
      callback(null);
    }
  ],
  (err, result) =>{
    if(err){
      return console.error(err);
    }
   gl.clearColor(0.0, 0.0, 0.0, 0.4);
   light.pushLightColor();
   light.pushSpecularColor();
   light.pushSpecularFlag();
   if(world.DEBUG)
     setTimeout(tick, 1000);
    else
      tick();
  });
})();

function tick(){
	if(!world.DEBUG)
		requestAnimationFrame(tick);
	drawScene();
	animate();
  events.handleKeys();
}
