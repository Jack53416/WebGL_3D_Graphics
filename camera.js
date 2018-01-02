
export function Camera(){
  this.eye = vec3.fromValues(0, 0, 20);
  this.center = vec3.fromValues(0, 0, 0);
  this.upVector = vec3.fromValues(0, 1, 0);
  this.angleX = 0;
  this.angleY = 0;
  this.transformMatrix = mat4.create();
  this.updateTransform();
}

Camera.prototype.updateTransform = function(){
  mat4.lookAt(this.transformMatrix, this.eye, this.center, this.upVector);
  console.log("eye: " + this.eye);
  console.log("center: " + this.center);
  console.log("up: " + this.upVector );
}

Camera.prototype.moveEye = function(posX, posY, posZ){
  var eyeShift = vec3.fromValues(posX, posY, posZ);
  vec3.add(this.eye, this.eye, eyeShift);
  this.updateTransform();
}

Camera.prototype.getZaxis = function(){
  var result = vec3.create();
  vec3.subtract(result, this.eye, this.center);
  vec3.normalize(result, result);
  return result;
}

Camera.prototype.getXaxis = function(zCameraAxis){
  var result = vec3.create();
  vec3.cross(result, this.upVector, zCameraAxis);
  vec3.normalize(result, result);
  return result;
}
Camera.prototype.truck = function(distance){
  var xCameraAxis = vec3.create();
  var zCameraAxis = this.getZaxis();
  //Calculate xCameraAxis
  vec3.cross(xCameraAxis, this.upVector, zCameraAxis);
  vec3.normalize(xCameraAxis, xCameraAxis);
  console.log(xCameraAxis);
  vec3.scale(xCameraAxis, xCameraAxis, distance);
  vec3.add(this.eye, this.eye, xCameraAxis);
  vec3.add(this.center, this.center, xCameraAxis);

  this.updateTransform();
}

Camera.prototype.zoom = function(distance){
  var zCameraAxis = this.getZaxis();
  var cameraDistance = vec3.create();
  var newEye = vec3.create();

  vec3.scale(zCameraAxis, zCameraAxis, distance);
  vec3.add(newEye, this.eye, zCameraAxis);
  vec3.subtract(cameraDistance, this.center, newEye);
  if(vec3.length(cameraDistance) < 1)
    return;
  this.eye = newEye;
//  vec3.add(this.center, this.center, zCameraAxis);
  this.updateTransform();
}

Camera.prototype.pedestal = function(distance){
  var zCameraAxis = this.getZaxis();
  var xCameraAxis = this.getXaxis(zCameraAxis);
  var yCameraAxis = vec3.create();
  vec3.cross(yCameraAxis, zCameraAxis, xCameraAxis);
  vec3.normalize(yCameraAxis, yCameraAxis);
  vec3.scale(yCameraAxis, yCameraAxis, distance);
  vec3.add(this.eye, this.eye, yCameraAxis);
  vec3.add(this.center, this.center, yCameraAxis);
  this.updateTransform();
}

Camera.prototype.tilt = function(angle){
  var zCameraAxis = this.getZaxis();
  var xCameraAxis = this.getXaxis(zCameraAxis);
  var newCenter = vec3.create();
  var tilltRotation = mat4.create();
  vec3.subtract(newCenter, this.center, this.eye);
  mat4.fromRotation(tilltRotation, glMatrix.toRadian(angle), xCameraAxis);
  vec3.transformMat4(newCenter, newCenter, tilltRotation);
  vec3.add(this.center, newCenter, this.eye);
  this.angleY -= glMatrix.toRadian(angle);
  if(Math.abs(vec3.dot(zCameraAxis, this.upVector) >= 0.985)){
    vec3.transformMat4(this.upVector, this.upVector, tilltRotation);
  }
  this.updateTransform();
}

Camera.prototype.pan = function(angle){
  var zCameraAxis = this.getZaxis();
  var xCameraAxis = this.getXaxis(zCameraAxis);
  var yCameraAxis = vec3.create();
  var newCenter = vec3.create();
  var panRotation = mat4.create();
  vec3.cross(yCameraAxis, zCameraAxis, xCameraAxis);
  vec3.subtract(newCenter, this.center, this.eye);
  mat4.fromRotation(panRotation, glMatrix.toRadian(angle), yCameraAxis);
  vec3.transformMat4(newCenter, newCenter, panRotation);
  vec3.add(this.center, newCenter, this.eye);
  this.updateTransform();
}
Camera.prototype.arcCrane = function(angleX, angleY){
  var distance = vec3.distance(this.eye, this.center);
  console.log(distance);
  this.angleX += glMatrix.toRadian(angleX);
  this.angleY += glMatrix.toRadian(angleY);
  vec3.set(this.eye,
           Math.sin(this.angleX), //* Math.cos(this.angleY),
           Math.sin(this.angleY), //* Math.sin(this.angleX),
           Math.cos(this.angleX)
    );
  vec3.normalize(this.eye, this.eye);
  vec3.scale(this.eye, this.eye, distance);
  vec3.add(this.eye, this.eye, this.center);
  this.updateTransform();

}
