import  {gl, shaderProgram} from './worldData.js';
import * as world from './worldData.js';

export var tilt = 90;
const effectiveFPMS = 60 / 1000;

export function Sphere(latitudeBands, longitudeBands, radius){
  this.latitudeBands = latitudeBands;
  this.longitudeBands = longitudeBands;
  this.radius = radius;
  this.rotationMatrix = mat4.create();
  this.calculateBuffers();
}

Sphere.prototype.setTexture = function(texture){
  this.texture = texture;
}

Sphere.prototype.rotate = function(angleX, angleY){
  var newRotationMatrix = mat4.create();

  mat4.rotate(newRotationMatrix, newRotationMatrix, glMatrix.toRadian(angleX), [0, 1, 0]);
  mat4.rotate(newRotationMatrix, newRotationMatrix, glMatrix.toRadian(angleY), [1, 0, 0]);

  mat4.multiply(this.rotationMatrix, newRotationMatrix, this.rotationMatrix);
}

Sphere.prototype.setPosition = function(posX, posY, posZ){
  this.posX = posX;
  this.posY = posY;
  this.posZ = posZ;
}

Sphere.prototype.setOrbitAngle = function(orbitAngle){
  this.orbitAngle = orbitAngle;
}

Sphere.prototype.calculateBuffers = function(){
  var vertexPositionData = [];
  var vertexNormalData = [];
  var textureCoordData = [];
  var vertexIndexData = [];

  for(var latNumber = 0; latNumber <= this.latitudeBands; ++latNumber){
    var theta = latNumber * Math.PI / this.latitudeBands;
    var sinTheta = Math.sin(theta);
    var cosTheta = Math.cos(theta);

    for(var longNumber = 0; longNumber <= this.longitudeBands; ++longNumber){
      var phi = longNumber * 2 * Math.PI / this.longitudeBands;
      var sinPhi = Math.sin(phi);
      var cosPhi = Math.cos(phi);

      var xPos = cosPhi * sinTheta;
      var yPos = cosTheta;
      var zPos = sinPhi * sinTheta;

      var uPos = 1 - (longNumber / this.longitudeBands);
      var vPos = 1 - (latNumber / this.latitudeBands);

      var first = (latNumber * (this.longitudeBands + 1) + longNumber);
      var second = first + this.longitudeBands + 1;


      vertexNormalData.push(xPos);
      vertexNormalData.push(yPos);
      vertexNormalData.push(zPos);
      textureCoordData.push(uPos);
      textureCoordData.push(vPos);
      vertexPositionData.push(this.radius * xPos);
      vertexPositionData.push(this.radius * yPos);
      vertexPositionData.push(this.radius * zPos);

      if(latNumber < this.latitudeBands && longNumber < this.longitudeBands){
        vertexIndexData.push(first);
        vertexIndexData.push(second);
        vertexIndexData.push(first + 1);

        vertexIndexData.push(second);
        vertexIndexData.push(second + 1);
        vertexIndexData.push(first + 1);
      }
    }
  }

  this.bindBuffers(vertexPositionData, textureCoordData, vertexNormalData, vertexIndexData);
}

Sphere.prototype.bindBuffers = function(positionData, textureData, normalData, indexData){
  this.textureCoordBuffer = gl.createBuffer();
  this.vertexPositionBuffer = gl.createBuffer();
  this.normalVertexBuffer = gl.createBuffer();
  this.vertexIndexBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionData), gl.STATIC_DRAW);
  this.vertexPositionBuffer.itemSize = 3;
  this.vertexPositionBuffer.numItems = positionData.length / 3;

  gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureData), gl.STATIC_DRAW);
  this.textureCoordBuffer.itemSize = 2;
  this.textureCoordBuffer.numItems = textureData.length / 2;

  gl.bindBuffer(gl.ARRAY_BUFFER, this.normalVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
  this.normalVertexBuffer.itemSize = 3;
  this.normalVertexBuffer.numItems = normalData.length / 3;

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);
  this.vertexIndexBuffer.itemSize = 1;
  this.vertexIndexBuffer.numItems = indexData.length;
}

Sphere.prototype.draw = function(){
  world.mvPushMatrix();
  mat4.rotate(world.mvMatrix, world.mvMatrix, glMatrix.toRadian(this.orbitAngle), [0, 1, 0]);
  mat4.translate(world.mvMatrix, world.mvMatrix, [this.posX, this.posY, this.posZ]);
  mat4.multiply(world.mvMatrix, world.mvMatrix, this.rotationMatrix);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, this.texture);

  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
                         this.vertexPositionBuffer.itemSize,
                         gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordBuffer);
  gl.vertexAttribPointer(shaderProgram.textureCoordAttribute,
                         this.textureCoordBuffer.itemSize,
                         gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, this.normalVertexBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute,
                         this.normalVertexBuffer.itemSize,
                         gl.FLOAT, false, 0 , 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
  world.setMatrixUniforms();

  gl.drawElements(gl.TRIANGLES, this.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
  world.mvPopMatrix();
}
