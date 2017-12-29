import * as world from './worldData.js';
import {gl,shaderProgram} from './worldData.js';
import {Model, Sphere, Cuboid, Hand} from './worldObjects.js';
import * as events from './events.js';
import {Camera} from "./camera.js";

var worldObjects = [];
var camera = new Camera();

function initWorldObjects(callback){
  var texture = initTexture(gl, "./Textures/bricks.jpg");
  var floor = new Cuboid(
    vec3.fromValues(-40, -15, 30),
    vec3.fromValues(40, -12, -30),
    {
      texture: texture,
      textureTile: 8
  });
  var hand = new Hand("./Models/hand.json", {texture: initTexture(gl, "./Textures/teapotTexture.jpg")} , function(err){
    console.log(hand)
    worldObjects.push(floor);
    worldObjects.push(hand);
    if(err){
      return callback(err);
    }
    return callback(null);
  });

  events.addControlSchema(hand, [
    {key: '1', handler: hand.bendFinger, parameters: [0, 4], animated: true},
    {key: '2', handler: hand.bendFinger, parameters: [1, 4], animated: true},
    {key: '3', handler: hand.bendFinger, parameters: [2, 4], animated: true},
    {key: '4', handler: hand.bendFinger, parameters: [3, 4], animated: true},
    {key: '5', handler: hand.bendFinger, parameters: [4, 4], animated: true},
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
  gl.enable(gl.DEPTH_TEST);
  passLightingData(shaderProgram);
  for(var object of worldObjects){
      object.draw();
  }
}

function passLightingData(shaderProgram){
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
      worldObjects[1].shininess = parseFloat(document.getElementById("shininess").value);
    }
	}
}

function animate(){
	var timeNow = new Date().getTime();
	if (animate.lastTime != 0) {
		var elapsed = timeNow - animate.lastTime;
    //teapot.rotate(0, 0.1 * elapsed);
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
        {key: 'a', handler: camera.truck, parameters: [-0.1]},
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
