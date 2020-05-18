//
// Shader
// Attribute : Position + Color
//

PosColShader = {

  vertexShader: [
    "attribute vec3 aVertexPosition;",
    "attribute vec4 aVertexColor;",

    "uniform mat4 mWorld;", // world matrix
    "uniform mat4 mView;", // view matrix
    "uniform mat4 mProj;", // projection matrix
    "varying vec4 vColor;",
    
    "void main() {",
      "gl_Position = mProj * mView * mWorld * vec4(aVertexPosition, 1.0);",
      "vColor = aVertexColor;",
    "}",

  ].join('\n'),


  fragmentShader : [
    "precision mediump float;",
    "varying vec4 vColor;",

    "void main() {",
      "gl_FragColor = vColor;",
    "}",

  ].join('\n')

};
