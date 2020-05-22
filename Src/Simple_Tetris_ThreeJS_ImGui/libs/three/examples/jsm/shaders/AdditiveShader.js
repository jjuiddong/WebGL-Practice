/**
 * @author jjuiddong / http://jjuiddong.co.kr/
 *
 * Add two textures
 */



var AdditiveShader = {

	uniforms: {

		"tDiffuse1": { value: null },
		"tDiffuse2": { value: null },
		"srcAlpha1":  { value: 0.5 },
		"srcAlpha2":  { value: 0.5 },
		"opacity":   { value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform float opacity;",
		"uniform float srcAlpha1;",
		"uniform float srcAlpha2;",

		"uniform sampler2D tDiffuse1;",
		"uniform sampler2D tDiffuse2;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 texel1 = texture2D( tDiffuse1, vUv );",
			"vec4 texel2 = texture2D( tDiffuse2, vUv );",
			//"gl_FragColor = opacity * (srcAlpha1 * texel1) + (srcAlpha2 * texel2);",
			"gl_FragColor = opacity * ((1.0 - texel1.x) * texel2);",

		"}"

	].join("\n")

};

export { AdditiveShader };