import {gl} from "./worldData.js";


var keyEvents = {
  eventObjects: []
};
var eventFifo = {};

var mouseDown = false;
var lastMouseX = 0;
var lastMouseY = 0;

Array.prototype.containsObject = function(obj) {
    var i;
    for (i = 0; i < this.length; i++) {
        if (this[i] === obj) {
            return i;
        }
    }

    return -1;
}

keyEvents.addEventObject = function(object){
  var index = null;
  if(object){
    index = keyEvents.eventObjects.containsObject(object);
    if(index < 0){
      keyEvents.eventObjects.push(object);
      index = keyEvents.eventObjects.length - 1;
    }
  }

  return index;
}

export function bindCanvasEvents(canvas){
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
	if(!keyEvents[event.key])
    return;
  var keyEvent = keyEvents[event.key];
  if(!keyEvent.animated)
    keyEvent.handler.apply(keyEvents.eventObjects[keyEvent.objIndex],keyEvent.parameters);
  else{
     if(!eventFifo.hasOwnProperty(event.key)){
       eventFifo[event.key] = keyEvent;
     }
  }
}

function handleKeyUp(event){
  if(eventFifo.hasOwnProperty(event.key)){
    delete eventFifo[event.key];
  }
}

export function addControlSchema(object, controls){
  var index = keyEvents.addEventObject(object);

  for(var control of controls){
    control.objIndex = index;
    keyEvents[control.key] = control;
  }
}

export function bindMouseEvents(object, mouseMoveHandler, mouseZoomHandler){
  var index = keyEvents.addEventObject(object);
  keyEvents.mouseMove = {handler: mouseMoveHandler, objIndex: index};
  keyEvents.mouseZoom = {handler: mouseZoomHandler, objIndex: index};
}
export function handleKeys(){
  for(var key in eventFifo){
    let keyEvent = eventFifo[key];
    keyEvent.handler.apply(keyEvents.eventObjects[keyEvent.objIndex],keyEvent.parameters);
  }
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

  if(keyEvents.mouseMove){
    let keyEvent = keyEvents.mouseMove;
    keyEvent.handler.call(keyEvents.eventObjects[keyEvent.objIndex], deltaX / 2, deltaY /2);
  }
  lastMouseX = newX;
  lastMouseY = newY;
}

function MouseWheelHandler(e) {
  // cross-browser wheel delta
  var e = window.event || e; // old IE support
  var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
  if(keyEvents.mouseZoom){
    let keyEvent = keyEvents.mouseZoom;
    keyEvent.handler.call(keyEvents.eventObjects[keyEvent.objIndex], delta);
  }

  return false;
}
