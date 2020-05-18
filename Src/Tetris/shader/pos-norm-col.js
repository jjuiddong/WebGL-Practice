//
// Shader
// Attribute : Position + Normal + Color
//

PosNormColShader = {

  vertexShader: [
    "attribute vec3 aVertexPosition;",
    "attribute vec3 aVertexNormal;",
    "attribute vec4 aVertexColor;",

    "uniform mat4 mWorld;", // world matrix
    "uniform mat4 mView;", // view matrix
    "uniform mat4 mProj;", // projection matrix
    "uniform mat3 mNorm;", // normal matrix

    "varying vec3 vNormalEye;",
    "varying vec3 vPositionEye3;",
    "varying vec4 vColor;",
    
    "void main() {",
      "vec4 vertexPositionEye4 = mView * mWorld * vec4(aVertexPosition, 1.0);",
      "vPositionEye3 = vertexPositionEye4.xyz / vertexPositionEye4.w;",

      // Transform the normal to eye coordinates and send to fragment shader
      "vNormalEye = normalize(mNorm * aVertexNormal);",
      "vColor = aVertexColor;",

      "gl_Position = mProj * mView * mWorld * vec4(aVertexPosition, 1.0);",

    "}",

  ].join('\n'),


  fragmentShader : [
    // Fragment shader implemented to perform lighting according to the 
    // Phong reflection model. The interpolation method that is used is
    // Phong shading (per-fragment shading) and therefore the actual
    // lighting calculations are implemented here in the fragment shader.
    "precision mediump float;",
   
    "varying vec3 vNormalEye;",
    "varying vec3 vPositionEye3;",
    "varying vec4 vColor;",
    
    "uniform vec3 uLightPosition;",
    "uniform vec3 uAmbientLightColor;",
    "uniform vec3 uDiffuseLightColor;",
    "uniform vec3 uSpecularLightColor;",
    
    "const float shininess = 32.0;",
      
    "void main() {",
    
      // Calculate the vector (l) to the light source
      "vec3 vectorToLightSource = normalize(uLightPosition - vPositionEye3);",
      
      // Calculate n dot l for diffuse lighting
      "float diffuseLightWeighting = max(dot(vNormalEye, ",
                                            "vectorToLightSource), 0.0);",
                                            
      // Calculate the reflection vector (r) that is needed for specular light
      "vec3 reflectionVector = normalize(reflect(-vectorToLightSource, ",
                                                 "vNormalEye));",
      
      // Camera in eye space is in origin pointing along the negative z-axis.
      // Calculate viewVector (v) in eye coordinates as
      // (0.0, 0.0, 0.0) - vPositionEye3
      "vec3 viewVectorEye = -normalize(vPositionEye3);",
      
      "float rdotv = max(dot(reflectionVector, viewVectorEye), 0.0);",
      
      "float specularLightWeighting = pow(rdotv, shininess);",
      
      // Sum up all three reflection components
      "vec3 lightWeighting = uAmbientLightColor + ",
                            "uDiffuseLightColor * diffuseLightWeighting + ",
                            "uSpecularLightColor * specularLightWeighting;",

      // Sample the texture
      // modulate texel color with lightweigthing and write as final color
      "gl_FragColor = vec4(vColor.rgb * lightWeighting.rgb, vColor.a);",
    "}",

  ].join('\n')

};
