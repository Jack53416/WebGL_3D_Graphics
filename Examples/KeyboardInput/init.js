"use strict";
/**
 * gets WebGL context
 * @param  {canvas} canvas canvas html5 object
 * @return {gl}            gl context
 */
export function initGL(canvas) {
  var gl = null;
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (ex) {
      console.log(ex);
    }
    if (!gl) {
        alert("Could not initialise WebGL");
    }
    console.log("gl init done");
    return gl;
}
/**
 * Searches through html page and creates either vertex or fragment shader, based on
 * the element's type. Then it passes it to WebGL to be compiled to run on graphic
 * card
 * @param  {[type]} gl [description]
 * @param  {[type]} id [description]
 * @return {[type]}    [description]
 */
export function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }
    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }
    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }
    gl.shaderSource(shader, str);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }
    return shader;
}
/**
 * Initializes shaders, they are necessary in WebGL in order to get WebGL running
 * on the graphic cards and to apply model-view matrix and  projection matrix to
 * scene without having to move around every point and every vertex
 * in (relatively) slow JavaScript.
 * @param  {gl}  gl             WebGL context
 * @return {glShaderProgram}    shaderProgram running on graphic card
 */
export function initShaders(gl) {
    var shaderProgram;
    var fragmentShader = getShader(gl, "shader-fs");
    var vertexShader = getShader(gl, "shader-vs");

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram);
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
    gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");

    return shaderProgram;
}
