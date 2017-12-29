precision mediump float;
varying vec2 vTextureCoord;
varying vec3 vTransformedNormal;
varying vec4 vPosition;
varying vec4 vLightLocation;

uniform float uMaterialShininess;
uniform bool uShowSpecularHighlights;
uniform bool uUseLighting;
uniform bool uUseTextures;
uniform bool uIsLightObject;

uniform vec3 uAmbientColor;

uniform vec3 uPointLightingSpecularColor;
uniform vec3 uPointLightingDiffuseColor;
uniform sampler2D uSampler;

vec3 calculateLightWeighting(vec3 lightLocation, vec3 position , vec3 normalVector);
float calculateSpecularWeighting(vec3 position, vec3 lightDirection, vec3 normalVector, float shininess);


void main(void) {
  vec3 lightWeighting;
  vec4 fragmentColor = vec4(1.0, 1.0, 1.0, 1.0);

  if(uIsLightObject){
    gl_FragColor = vec4(fragmentColor.rgb  * (0.3 * uPointLightingDiffuseColor + 0.7 * uPointLightingSpecularColor), fragmentColor.a);
    return;
  }

  lightWeighting = calculateLightWeighting(
      vLightLocation.xyz,
      vPosition.xyz,
      vTransformedNormal);

  if (uUseTextures) {
      fragmentColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
  }
  gl_FragColor = vec4(fragmentColor.rgb * lightWeighting, fragmentColor.a);
}


vec3 calculateLightWeighting(vec3 lightLocation, vec3 position , vec3 normalVector){
  vec3 result = vec3(1.0, 1.0, 1.0); ;
  float specularLightWeighting = 0.0;
  float diffuseLightWeighting = 0.0;
  vec3 lightDirection;

  if (!uUseLighting) {
    return result;
  }

  lightDirection = normalize(lightLocation - position);
  normalVector = normalize(normalVector);
  diffuseLightWeighting = max(dot(normalVector, lightDirection), 0.0);

  if(uShowSpecularHighlights){
    specularLightWeighting = calculateSpecularWeighting(position, lightDirection, normalVector, uMaterialShininess);
  }

  result = uAmbientColor
                  + uPointLightingSpecularColor * specularLightWeighting
                  + uPointLightingDiffuseColor * diffuseLightWeighting;
  return result;
}


float calculateSpecularWeighting(vec3 position, vec3 lightDirection, vec3 normalVector, float shininess){
  vec3 eyeDirection = normalize(-position);
  vec3 reflectionDirection = reflect(-lightDirection, normalVector);
  return pow(max(dot(reflectionDirection, eyeDirection), 0.0), shininess);
}
