import  {gl, shaderProgram} from './worldData.js';
import * as world from './worldData.js';


const effectiveFPMS = 60 / 1000;


export function Model(modelFile){
  var options;
  if(typeof arguments[1] === 'object')
  {
    options = arguments[1];
  }
  else{
    options = {};
  }
  this.posX = options.posX || 0.0;
  this.posY = options.posY || 0.0;
  this.posZ = options.posZ || 0.0;
  this.texture = options.texture || null;
  this.shininess = options.shininess || 40;
  this.rotationMatrix = mat4.create();
  if(modelFile){
    this.loadFromFile(modelFile, "application/json");
  }
}

Model.prototype.loadFromFile = function(fileName, mimeType){
  const reqTypeDone = 4;
  var self = this;
  var request = new XMLHttpRequest();
  request.overrideMimeType(mimeType);
  request.open("GET", fileName);
  request.onreadystatechange = function(){
    if(request.readyState === reqTypeDone){
      var modelData = self.parseFile(request.responseText);
      self.bindBuffers(modelData);
    }
  };
  request.send();
}

Model.prototype.parseFile = function(modelDataRaw){
   var modelJSON = JSON.parse(modelDataRaw);
   return {
     positionData : modelJSON.vertexPositions,
     textureData : modelJSON.vertexTextureCoords,
     normalData : modelJSON.vertexNormals,
     indexData : modelJSON.indices
   }
}


Model.prototype.bindBuffers = function(modelData){
  this.textureCoordBuffer = gl.createBuffer();
  this.vertexPositionBuffer = gl.createBuffer();
  this.normalVertexBuffer = gl.createBuffer();
  this.vertexIndexBuffer = gl.createBuffer();

  if(!modelData.positionData || !modelData.textureData || !modelData.normalData || !modelData.indexData){
    console.log("Error during buffor binding");
    return;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelData.positionData), gl.STATIC_DRAW);
  this.vertexPositionBuffer.itemSize = 3;
  this.vertexPositionBuffer.numItems = modelData.positionData.length / 3;

  gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelData.textureData), gl.STATIC_DRAW);
  this.textureCoordBuffer.itemSize = 2;
  this.textureCoordBuffer.numItems = modelData.textureData.length / 2;

  gl.bindBuffer(gl.ARRAY_BUFFER, this.normalVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelData.normalData), gl.STATIC_DRAW);
  this.normalVertexBuffer.itemSize = 3;
  this.normalVertexBuffer.numItems = modelData.normalData.length / 3;

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(modelData.indexData), gl.STATIC_DRAW);
  this.vertexIndexBuffer.itemSize = 1;
  this.vertexIndexBuffer.numItems = modelData.indexData.length;

}

Model.prototype.computeMvMatrix = function(){
  mat4.translate(world.mvMatrix, world.mvMatrix, [this.posX, this.posY, this.posZ]);
  mat4.multiply(world.mvMatrix, world.mvMatrix, this.rotationMatrix);
  mat4.translate(world.mvMatrix, world.mvMatrix, [-this.posX, -this.posY, -this.posZ]);
}

Model.prototype.draw = function(){
  if(this.vertexPositionBuffer == null || this.normalVertexBuffer == null){
    return;
  }
  gl.uniform1f(
    shaderProgram.materialShininessUniform,
    this.shininess
  );

  world.mvPushMatrix();
  this.computeMvMatrix();

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

Model.prototype.setPosition = function(posX, posY, posZ){
  this.posX = posX;
  this.posY = posY;
  this.posZ = posZ;
}

Model.prototype.setTexture = function(texture){
  this.texture = texture;
}

Model.prototype.rotate = function(angleX, angleY){
  var newRotationMatrix = mat4.create();

  mat4.rotate(newRotationMatrix, newRotationMatrix, glMatrix.toRadian(angleX), [0, 1, 0]);
  mat4.rotate(newRotationMatrix, newRotationMatrix, glMatrix.toRadian(angleY), [1, 0, 0]);

  mat4.multiply(this.rotationMatrix, newRotationMatrix, this.rotationMatrix);
}



export function Sphere(latitudeBands, longitudeBands, radius){
  var options;
  if(typeof arguments[3] === 'object'){
    options = arguments[3];
  }
  else{
    options = {};
  }
  this.latitudeBands = latitudeBands || 30;
  this.longitudeBands = longitudeBands || 30;
  this.radius = radius || 1.0;
  this.orbitAngle = options.orbitAngle || 0;
  Model.call(this, null, options);
  this.calculateBuffers();
}

Sphere.prototype = Object.create(Model.prototype);
Sphere.prototype.constructor = Sphere;

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

  this.bindBuffers({
    positionData: vertexPositionData,
    textureData: textureCoordData,
    normalData: vertexNormalData,
    indexData: vertexIndexData
  });
}

Sphere.prototype.computeMvMatrix = function(){
  mat4.rotate(world.mvMatrix, world.mvMatrix, glMatrix.toRadian(this.orbitAngle), [0, 1, 0]);
  mat4.translate(world.mvMatrix, world.mvMatrix, [this.posX, this.posY, this.posZ]);
  mat4.multiply(world.mvMatrix, world.mvMatrix, this.rotationMatrix);
}


export function Cuboid(startPoint, endPoint){
  var options = {};
  if(typeof arguments[2] === 'object')
    options = arguments[2];

  var center = vec3.create();
  vec3.add(center, endPoint, startPoint);
  vec3.scale(center, center, 0.5);
  console.log(center);
  options.posX = center[0];
  options.posY = center[1];
  options.posZ = center[2];
  this.startPoint = startPoint;
  this.endPoint = endPoint;
  this.textureTile = options.textureTile || 1;
  Model.call(this, null, options);
  this.calculateBuffers();
}

Cuboid.prototype = Object.create(Model.prototype);
Cuboid.prototype.constructor = Cuboid;

Cuboid.prototype.calculateBuffers = function(){
  var length = Math.abs(this.startPoint[0] - this.endPoint[0]);
  var width = Math.abs(this.startPoint[2] - this.endPoint[2]);
  var height = Math.abs(this.startPoint[1] - this.endPoint[1]);
  var lengthCoeff = 1;
  var widthCoeff = 1;
  var heigthCoeff = 1;
  if(length > width){
    widthCoeff =  width / length;
  }
  if(length < width){
    lengthCoeff = length / width;
  }
  if(height < length){
    heigthCoeff = height / length;
  }
  if(height > length){
    lengthCoeff = length / height;
  }
  if(height > width)
  {
    widthCoeff = width / height;
  }
  var vertexPositions = [
    // Front face
     this.startPoint[0], this.startPoint[1], this.startPoint[2],
     this.endPoint[0],   this.startPoint[1], this.startPoint[2],
     this.endPoint[0],   this.endPoint[1],   this.startPoint[2],
     this.startPoint[0], this.endPoint[1],   this.startPoint[2],
    // Back face
    this.startPoint[0], this.startPoint[1], this.endPoint[2],
    this.startPoint[0], this.endPoint[1],   this.endPoint[2],
    this.endPoint[0],   this.endPoint[1],   this.endPoint[2],
    this.endPoint[0],   this.startPoint[1], this.endPoint[2],
    // Top face
    this.startPoint[0], this.endPoint[1],  this.endPoint[2],
    this.startPoint[0], this.endPoint[1],  this.startPoint[2],
     this.endPoint[0],  this.endPoint[1],  this.startPoint[2],
     this.endPoint[0],  this.endPoint[1],  this.endPoint[2],
    // Bottom face
    this.startPoint[0], this.startPoint[1], this.endPoint[2],
    this.endPoint[0],   this.startPoint[1],  this.endPoint[2],
    this.endPoint[0],   this.startPoint[1],  this.startPoint[2],
    this.startPoint[0], this.startPoint[1], this.startPoint[2],
    // Right face
    this.endPoint[0],  this.startPoint[1], this.endPoint[2],
    this.endPoint[0],  this.endPoint[1],   this.endPoint[2],
    this.endPoint[0],  this.endPoint[1],   this.startPoint[2],
    this.endPoint[0],  this.startPoint[1], this.startPoint[2],
    // Left face
    this.startPoint[0],  this.startPoint[1], this.endPoint[2],
    this.startPoint[0],  this.startPoint[1], this.startPoint[2],
    this.startPoint[0],  this.endPoint[1],   this.startPoint[2],
    this.startPoint[0],  this.endPoint[1],   this.endPoint[2],
  ];
  var vertexNormals = [
  	// Front face
  	 0.0,  0.0,  1.0,
  	 0.0,  0.0,  1.0,
  	 0.0,  0.0,  1.0,
  	 0.0,  0.0,  1.0,
  	// Back face
  	 0.0,  0.0, -1.0,
  	 0.0,  0.0, -1.0,
  	 0.0,  0.0, -1.0,
  	 0.0,  0.0, -1.0,
  	// Top face
  	 0.0,  1.0,  0.0,
  	 0.0,  1.0,  0.0,
  	 0.0,  1.0,  0.0,
  	 0.0,  1.0,  0.0,
  	// Bottom face
  	 0.0, -1.0,  0.0,
  	 0.0, -1.0,  0.0,
  	 0.0, -1.0,  0.0,
  	 0.0, -1.0,  0.0,
  	// Right face
  	 1.0,  0.0,  0.0,
  	 1.0,  0.0,  0.0,
  	 1.0,  0.0,  0.0,
  	 1.0,  0.0,  0.0,
  	// Left face
  	-1.0,  0.0,  0.0,
  	-1.0,  0.0,  0.0,
  	-1.0,  0.0,  0.0,
  	-1.0,  0.0,  0.0
  ];
  var textureCoords = [
    // Front face
    0.0, 0.0,
    this.textureTile * lengthCoeff, 0.0,
    this.textureTile * lengthCoeff, this.textureTile * heigthCoeff,
    0.0, this.textureTile * heigthCoeff,
    // Back face
    this.textureTile * lengthCoeff, 0.0,
    this.textureTile * lengthCoeff, this.textureTile * heigthCoeff,
    0.0, this.textureTile * heigthCoeff,
    0.0, 0.0,
    // Top face
    0.0, this.textureTile * widthCoeff,
    0.0, 0.0,
    this.textureTile * lengthCoeff, 0.0,
    this.textureTile * lengthCoeff, this.textureTile * widthCoeff,
    // Bottom face
    this.textureTile * lengthCoeff, this.textureTile * widthCoeff,
    0.0, this.textureTile * widthCoeff,
    0.0, 0.0,
    this.textureTile * lengthCoeff, 0.0,
    // Right face
    this.textureTile * widthCoeff, 0.0,
    this.textureTile * widthCoeff, this.textureTile * heigthCoeff,
    0.0, this.textureTile * heigthCoeff,
    0.0, 0.0,
    // Left face
    0.0, 0.0,
    this.textureTile * widthCoeff, 0.0,
    this.textureTile * widthCoeff, this.textureTile * heigthCoeff,
    0.0, this.textureTile * heigthCoeff,
  ];
  var vertexIndices = [
    0, 1, 2,      0, 2, 3,    // Front face
    4, 5, 6,      4, 6, 7,    // Back face
    8, 9, 10,     8, 10, 11,  // Top face
    12, 13, 14,   12, 14, 15, // Bottom face
    16, 17, 18,   16, 18, 19, // Right face
    20, 21, 22,   20, 22, 23  // Left face
  ];

  this.bindBuffers({
    positionData: vertexPositions,
    normalData: vertexNormals,
    textureData: textureCoords,
    indexData: vertexIndices
  });
}
