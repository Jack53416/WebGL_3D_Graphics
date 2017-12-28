import {gl} from "./worldData.js";


var keyEvents = {
  eventObjects: []
};
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
	if(keyEvents[event.key])
    {
      var keyEvent = keyEvents[event.key];
      keyEvent.handler.call(keyEvents.eventObjects[keyEvent.objIndex],keyEvent.params);
    }
}

function handleKeyUp(event){
	//currentlyPressedKeys[event.keyCode] = false;
}

export function addControlSchema(object, controls){
  var index = keyEvents.addEventObject(object);

  for(var control of controls){
    keyEvents[control.key] = {handler: control.handler, params: control.parameters, objIndex: index};
  }
}

export function bindMouseEvents(object, mouseMoveHandler, mouseZoomHandler){
  var index = keyEvents.addEventObject(object);
  keyEvents.mouseMove = {handler: mouseMoveHandler, objIndex: index};
  keyEvents.mouseZoom = {handler: mouseZoomHandler, objIndex: index};
}
export function handleKeys(hand){
//1
  if(currentlyPressedKeys[49])
  {
    hand.meshes.finger2Base.rotate(0,0,1);
    hand.meshes.finger2Middle.rotate(0,0,0.7);
    hand.meshes.finger2Tip.rotate(0,0,1.2);
  }

  if(currentlyPressedKeys[50]){
    hand.meshes.finger1Base.rotate(0,0,1);
    hand.meshes.finger1Middle.rotate(0,0,0.7);
    hand.meshes.finger1Tip.rotate(0,0,1.2);
  }
  if(currentlyPressedKeys[51]){
    hand.meshes.finger3Base.rotate(0,0,1);
    hand.meshes.finger3Middle.rotate(0,0,0.7);
    hand.meshes.finger3Tip.rotate(0,0,1.2);
  }
  if(currentlyPressedKeys[52]){
    hand.meshes.finger4Base.rotate(0,0,1);
    hand.meshes.finger4Middle.rotate(0,0,0.7);
    hand.meshes.finger4Tip.rotate(0,0,1.2);
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
