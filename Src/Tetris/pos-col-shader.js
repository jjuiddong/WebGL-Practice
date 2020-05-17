//
// Shader
// Attribute : Position + Color
//

PosColShader = {

  vertexShader: [
    "attribute vec3 aVertexPosition;",
    "attribute vec4 aVertexColor;",
    "uniform mat4 uMVMatrix;",
    "uniform mat4 uPMatrix;",
    "varying vec4 vColor;",
    
    "void main() {",
      "gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);",
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
