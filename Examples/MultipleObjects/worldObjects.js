import  {gl, shaderProgram} from './worldData.js';
import * as world from './worldData.js';

export var tilt = 90;
const effectiveFPMS = 60 / 1000;

export function Star(startingDistance, rotationSpeed){
  this.angle = 0;
  this.distance = startingDistance;
  this.rotationSpeed = rotationSpeed;
  this.randomizeColors();
}

Star.setStarTexture = function(texture){
  Star.texture = texture;
}

Star.setVertexBuffers = function(textureCoordBuffer, vertexPositionBuffer){
  Star.vertexTextureCoordBuffer = textureCoordBuffer;
  Star.vertexPositionBuffer = vertexPositionBuffer;
}

Star.prototype.draw = function(tilt, spin, twinkle){
  world.mvPushMatrix();
  //move to the star's postion
  world.mvMatrixRotate(this.angle, [0.0, 1.0, 0.0]);
  world.mvMatrixTranslate([this.distance, 0.0, 0.0]);
  //roteate back so it faces the viever
  world.mvMatrixRotate(-this.angle, [0.0, 1.0, 0.0]);
  world.mvMatrixRotate(-tilt, [1.0, 0.0 , 0.0]);
  if(twinkle){
    gl.uniform3f(shaderProgram.colorUniform, this.twinkleR, this.twinkleG, this.twinkleB);
    drawStar();
  }
  world.mvMatrixRotate(spin, [0.0, 0.0, 1.0]);
  gl.uniform3f(shaderProgram.colorUniform, this.r, this.g, this.b);
  drawStar();
  world.mvPopMatrix();
}

Star.prototype.animate = function(elapsedTime){
  this.angle += this.rotationSpeed * elapsedTime * effectiveFPMS;
  this.distance -= 0.01 * elapsedTime * effectiveFPMS;
  if(this.distance < 0.0){
    this.distance += 5.0;
    this.randomizeColors();
  }
}

Star.prototype.randomizeColors = function(){
  this.r = Math.random();
  this.g = Math.random();
  this.b = Math.random();
  this.twinkleR = Math.random();
  this.twinkleG = Math.random();
  this.twinkleB = Math.random();
}

function drawStar(){
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, Star.texture);
  gl.uniform1i(shaderProgram.samplerUniform, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, Star.vertexTextureCoordBuffer);
  gl.vertexAttribPointer(shaderProgram.textureCoordAttribute,
                        Star.vertexTextureCoordBuffer.itemSize,
                        gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, Star.vertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
                         Star.vertexPositionBuffer.itemSize,
                         gl.FLOAT, false, 0 ,0)
  world.setMatrixUniforms();
  gl.drawArrays(gl.TRIANGLE_STRIP, 0 , Star.vertexPositionBuffer.numItems);
}
