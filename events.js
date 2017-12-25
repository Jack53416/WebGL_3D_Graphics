import {Camera} from "./camera.js";
import {gl} from "./worldData.js";

export var camera = new Camera();
var currentlyPressedKeys = {};
var mouseDown = false;
var lastMouseX = 0;
var lastMouseY = 0;


export function bindEvents(canvas){
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
}

function handleKeyDown(event){
	currentlyPressedKeys[event.keyCode] = true;
	/*if(String.fromCharCode(event.keyCode) == "F"){
		filter++;
		filter %= 3;
		console.log("filter: " + filter);
	}*/
}

function handleKeyUp(event){
	currentlyPressedKeys[event.keyCode] = false;
}

export function handleKeys(){
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
