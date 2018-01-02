attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

 //Uniform variables that can be accessed outside of the shader
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat3 uNMatrix;

uniform mat4 uCameraMatrix;

varying vec2 vTextureCoord;
varying vec3 vTransformedNormal;
varying vec4 vPosition;
varying vec4 vLightLocation;

uniform vec3 uPointLightingLocation;
//Shader is called for every vertex passed to it by aVertexPosition, by vertexPositionAttribute
//in the drawScen. It simply multiplies its postion by projection and model view matrices
//and pushes out the result as the final vertex position
void main(void) {
    vPosition = uMVMatrix * vec4(aVertexPosition, 1.0);
    vLightLocation = uCameraMatrix * vec4(uPointLightingLocation, 1.0);
    //accpets texture cooridanets as varting variable and passes it straight to
    //fragment shader, than shader interpolates texture linearly between vertices specified
    //earlier
    vTextureCoord = aTextureCoord;
    vTransformedNormal = uNMatrix * aVertexNormal;
    gl_Position = uPMatrix * vPosition;
}
