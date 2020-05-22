//
// Cube Geometry
//


CubeGeo = {

    posBuff : [
        // Front face
        1.0, 1.0, 1.0, //v0
        -1.0, 1.0, 1.0, //v1
        -1.0, -1.0, 1.0, //v2
        1.0, -1.0, 1.0, //v3

        // Back face
        1.0, 1.0, -1.0, //v4
        -1.0, 1.0, -1.0, //v5
        -1.0, -1.0, -1.0, //v6
        1.0, -1.0, -1.0, //v7

        // Left face
        -1.0, 1.0, 1.0, //v8
        -1.0, 1.0, -1.0, //v9
        -1.0, -1.0, -1.0, //v10
        -1.0, -1.0, 1.0, //v11

        // Right face
        1.0, 1.0, 1.0, //12
        1.0, -1.0, 1.0, //13
        1.0, -1.0, -1.0, //14
        1.0, 1.0, -1.0, //15

        // Top face
        1.0, 1.0, 1.0, //v16
        1.0, 1.0, -1.0, //v17
        -1.0, 1.0, -1.0, //v18
        -1.0, 1.0, 1.0, //v19

        // Bottom face
        1.0, -1.0, 1.0, //v20
        1.0, -1.0, -1.0, //v21
        -1.0, -1.0, -1.0, //v22
        -1.0, -1.0, 1.0, //v23
    ],

    normBuff : [
        // Front face
        0.0, 0.0, 1.0, //v0
        0.0, 0.0, 1.0, //v1
        0.0, 0.0, 1.0, //v2
        0.0, 0.0, 1.0, //v3

        // Back face
        0.0, 0.0, -1.0, //v4
        0.0, 0.0, -1.0, //v5
        0.0, 0.0, -1.0, //v6
        0.0, 0.0, -1.0, //v7

        // Left face
        -1.0, 0.0, 0.0, //v8
        -1.0, 0.0, 0.0, //v9
        -1.0, 0.0, 0.0, //v10
        -1.0, 0.0, 0.0, //v11

        // Right face
        1.0, 0.0, 0.0, //12
        1.0, 0.0, 0.0, //13
        1.0, 0.0, 0.0, //14
        1.0, 0.0, 0.0, //15

        // Top face
        0.0, 1.0, 0.0, //v16
        0.0, 1.0, 0.0, //v17
        0.0, 1.0, 0.0, //v18
        0.0, 1.0, 0.0, //v19

        // Bottom face
        0.0, -1.0, 0.0, //v20
        0.0, -1.0, 0.0, //v21
        0.0, -1.0, 0.0, //v22
        0.0, -1.0, 0.0, //v23
    ],

    colorBuff: [
        255, 0, 0, 255,
        255, 0, 0, 255,
        255, 0, 0, 255,
        255, 0, 0, 255,

        255, 0, 0, 255,
        255, 0, 0, 255,
        255, 0, 0, 255,
        255, 0, 0, 255,

        255, 0, 0, 255,
        255, 0, 0, 255,
        255, 0, 0, 255,
        255, 0, 0, 255,

        255, 0, 0, 255,
        255, 0, 0, 255,
        255, 0, 0, 255,
        255, 0, 0, 255,

        255, 0, 0, 255,
        255, 0, 0, 255,
        255, 0, 0, 255,
        255, 0, 0, 255,

        255, 0, 0, 255,
        255, 0, 0, 255,
        255, 0, 0, 255,
        255, 0, 0, 255
    ],

    indices: [
        0, 1, 2, 0, 2, 3,    // Front face
        4, 6, 5, 4, 7, 6,    // Back face
        8, 9, 10, 8, 10, 11,  // Left face
        12, 13, 14, 12, 14, 15, // Right face
        16, 17, 18, 16, 18, 19, // Top face
        20, 22, 21, 20, 23, 22  // Bottom face
    ]

};
