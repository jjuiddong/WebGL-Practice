
// phong shader


PhongShader = {

  vertexShader: [
    // Vertex shader implemented to perform lighting according to the 
    // Phong reflection model. The interpolation method that is used is
    // Phong shading (per-fragment shading) and therefore the actual
    // lighting calculations are performed in the fragment shader.
    "attribute vec3 aVertexPosition;",
    "attribute vec3 aVertexNormal;",
    "attribute vec2 aTextureCoordinates;",
    
    "uniform mat4 uMVMatrix;",
    "uniform mat4 uPMatrix;",
    "uniform mat3 uNMatrix;",
   
    "varying vec2 vTextureCoordinates;",
    "varying vec3 vNormalEye;",
    "varying vec3 vPositionEye3;",
    
    "void main() {",
      // Get vertex position in eye coordinates and send to the fragment shader
      "vec4 vertexPositionEye4 = uMVMatrix * vec4(aVertexPosition, 1.0);",
      "vPositionEye3 = vertexPositionEye4.xyz / vertexPositionEye4.w;",
       
      // Transform the normal to eye coordinates and send to fragment shader
      "vNormalEye = normalize(uNMatrix * aVertexNormal);",

      // Transform the geometry
      "gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);",
      "vTextureCoordinates = aTextureCoordinates;",
    "}",

  ].join('\n'),


  fragmentShader : [
    // Fragment shader implemented to perform lighting according to the 
    // Phong reflection model. The interpolation method that is used is
    // Phong shading (per-fragment shading) and therefore the actual
    // lighting calculations are implemented here in the fragment shader.
    "precision mediump float;",
   
    "varying vec2 vTextureCoordinates;",
    "varying vec3 vNormalEye;",
    "varying vec3 vPositionEye3;",
    
    "uniform vec3 uLightPosition;",
    "uniform vec3 uAmbientLightColor;",
    "uniform vec3 uDiffuseLightColor;",
    "uniform vec3 uSpecularLightColor;",
    
    "uniform sampler2D uSampler;",
    
    "const float shininess = 32.0;",
      
    "void main() {",
    
      // Calculate the vector (l) to the light source
      "vec3 vectorToLightSource = normalize(uLightPosition - vPositionEye3);",
      // Calculate n dot l for diffuse lighting
      "float diffuseLightWeighting = max(dot(vNormalEye, vectorToLightSource), 0.0);",
      // Calculate the reflection vector (r) that is needed for specular light
      "vec3 reflectionVector = normalize(reflect(-vectorToLightSource, vNormalEye));",

      // Camera in eye space is in origin pointing along the negative z-axis.
      // Calculate viewVector (v) in eye coordinates as
      // (0.0, 0.0, 0.0) - vPositionEye3
      "vec3 viewVectorEye = -normalize(vPositionEye3);",
      
      "float rdotv = max(dot(reflectionVector, viewVectorEye), 0.0);",
      
      "float specularLightWeighting = pow(rdotv, shininess);",
      
      // Sum up all three reflection components
      "vec3 lightWeighting = uAmbientLightColor + ",
                            "uDiffuseLightColor * diffuseLightWeighting +",
                            "uSpecularLightColor * specularLightWeighting;",
      // Sample the texture
      "vec4 texelColor = texture2D(uSampler, vTextureCoordinates);",
      // modulate texel color with lightweigthing and write as final color
      "gl_FragColor = vec4(lightWeighting.rgb * texelColor.rgb, texelColor.a);",
    "}",
  ].join('\n')

};
