SystemJS.config({
    map: {
        "imgui-js": "https://flyover.github.io/imgui-js",
    },
    packages: {
        "imgui-js": { main: "imgui.js" },
    }
});

let ImGui;
let ImGui_Impl;
Promise.resolve().then(() => {
    return System.import("imgui-js").then((module) => {
        ImGui = module;
        return ImGui.default();
    });
}).then(() => {
    return System.import("imgui-js/example/imgui_impl").then((module) => {
        ImGui_Impl = module;
    });
}).then(() => {

    // tetris variable
    var gl;
    var pwgl = {};
    // model
    var _ground = {};
    var _cube = {};
    //shader
    var _posShader = {}; // pos
    var _posColShader = {}; // pos + color
    var _pnShader = {}; // pos + normal
    var _pncShader = {}; // pos + normal + color
    var _canvas;
    // tetris
    var _isGameOver = false;
    var _incTime = 0;
    var _ctrlType = getRandomInt(0, 4); // control block type
    var _nextCtrlType = getRandomInt(0, 4);
    var _ctrlDir = 0; // control block direction
    var _ctrlPos = new Vector2(3, 19); // control block pos(x,y) {0~9, 0~19}
    var _ctrlOldPos = new Vector2(0, 0);
    _ctrlOldPos.copy(_ctrlPos);

    var _blocks = new Array(); // tetris block array, blocks[x:10][y:20]
    var _nextBlocks = new Array(); // next block

    // control block 4 X 4 X 4 X 4
    // ctrlBlock[type][direction][y][x]
    var _ctrlBlocks = [
        [
            [[1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]],

            [[0, 0, 0, 1],
            [0, 0, 0, 1],
            [0, 0, 0, 1],
            [0, 0, 0, 1]],

            [[1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]],

            [[0, 0, 0, 1],
            [0, 0, 0, 1],
            [0, 0, 0, 1],
            [0, 0, 0, 1]],
        ],

        [
            [[0, 0, 0, 1],
            [0, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]],

            [[0, 0, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 1],
            [0, 0, 0, 0]],

            [[0, 1, 1, 1],
            [0, 1, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]],

            [[0, 0, 1, 1],
            [0, 0, 0, 1],
            [0, 0, 0, 1],
            [0, 0, 0, 0]],
        ],

        [
            [[0, 1, 1, 1],
            [0, 0, 1, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]],

            [[0, 0, 0, 1],
            [0, 0, 1, 1],
            [0, 0, 0, 1],
            [0, 0, 0, 0]],

            [[0, 0, 1, 0],
            [0, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]],

            [[0, 0, 1, 0],
            [0, 0, 1, 1],
            [0, 0, 1, 0],
            [0, 0, 0, 0]],
        ],

        [
            [[0, 0, 1, 1],
            [0, 0, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]],

            [[0, 0, 1, 1],
            [0, 0, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]],

            [[0, 0, 1, 1],
            [0, 0, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]],

            [[0, 0, 1, 1],
            [0, 0, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]],
        ],

    ];
    keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

    _canvas = document.getElementById("output");
    const devicePixelRatio = window.devicePixelRatio || 1;
    _canvas.width = _canvas.scrollWidth * devicePixelRatio;
    _canvas.height = _canvas.scrollHeight * devicePixelRatio;
    window.addEventListener("resize", () => {
        const devicePixelRatio = window.devicePixelRatio || 1;
        _canvas.width = _canvas.scrollWidth * devicePixelRatio;
        _canvas.height = _canvas.scrollHeight * devicePixelRatio;
    });
    window.addEventListener('keydown', onKeyDown, false);

    ImGui.CreateContext();
    ImGui_Impl.Init(_canvas);
    gl = _canvas.getContext("webgl", { stencil: true });
    ImGui.StyleColorsDark();
    const clear_color = new ImGui.ImVec4(0.45, 0.55, 0.60, 1.00);

    startup();


    function setupBlocks() {
        // tetris block array
        // blocks[x:10][y:20]
        for (var i = 0; i < 10; ++i) {
            _blocks[i] = new Array();
            for (var k = 0; k < 20; ++k) {
                _blocks[i][k] = 0;
            }
        }

        // create next block array
        for (var x = 0; x < 4; ++x) {
            _nextBlocks[x] = new Array();
            for (var y = 0; y < 4; ++y) {
                _nextBlocks[x][y] = 0;
            }
        }

    }

    function setupShaders() {

        // load pos shader
        {
            var shaderProgram = gl.createProgram();
            ShaderHelper.loadShader(gl, shaderProgram, PosShader);

            gl.useProgram(shaderProgram);
            _posShader.program = shaderProgram;
            _posShader.pos = gl.getAttribLocation(shaderProgram, "aVertexPosition");
            _posShader.mWorld = gl.getUniformLocation(shaderProgram, "mWorld");
            _posShader.mView = gl.getUniformLocation(shaderProgram, "mView");
            _posShader.mProj = gl.getUniformLocation(shaderProgram, "mProj");
        }

        // load pos-norm shader
        {
            var shaderProgram = gl.createProgram();
            ShaderHelper.loadShader(gl, shaderProgram, PosNormShader);

            gl.useProgram(shaderProgram);
            _pnShader.program = shaderProgram;
            _pnShader.pos = gl.getAttribLocation(shaderProgram, "aVertexPosition");
            _pnShader.norm = gl.getAttribLocation(shaderProgram, "aVertexNormal");
            _pnShader.mWorld = gl.getUniformLocation(shaderProgram, "mWorld");
            _pnShader.mView = gl.getUniformLocation(shaderProgram, "mView");
            _pnShader.mProj = gl.getUniformLocation(shaderProgram, "mProj");
            _pnShader.mNInv = gl.getUniformLocation(shaderProgram, "mNorm");

            _pnShader.uLightPos = gl.getUniformLocation(shaderProgram, "uLightPosition");
            _pnShader.uAmbient = gl.getUniformLocation(shaderProgram, "uAmbientLightColor");
            _pnShader.uDiffuse = gl.getUniformLocation(shaderProgram, "uDiffuseLightColor");
            _pnShader.uSpecular = gl.getUniformLocation(shaderProgram, "uSpecularLightColor");
        }

        // load pos-norm-color shader
        {
            var shaderProgram = gl.createProgram();
            ShaderHelper.loadShader(gl, shaderProgram, PosNormColShader);

            gl.useProgram(shaderProgram);
            _pncShader.program = shaderProgram;
            _pncShader.pos = gl.getAttribLocation(shaderProgram, "aVertexPosition");
            _pncShader.norm = gl.getAttribLocation(shaderProgram, "aVertexNormal");
            _pncShader.col = gl.getAttribLocation(shaderProgram, "aVertexColor");
            _pncShader.mWorld = gl.getUniformLocation(shaderProgram, "mWorld");
            _pncShader.mView = gl.getUniformLocation(shaderProgram, "mView");
            _pncShader.mProj = gl.getUniformLocation(shaderProgram, "mProj");
            _pncShader.mNInv = gl.getUniformLocation(shaderProgram, "mNorm");

            _pncShader.uLightPos = gl.getUniformLocation(shaderProgram, "uLightPosition");
            _pncShader.uAmbient = gl.getUniformLocation(shaderProgram, "uAmbientLightColor");
            _pncShader.uDiffuse = gl.getUniformLocation(shaderProgram, "uDiffuseLightColor");
            _pncShader.uSpecular = gl.getUniformLocation(shaderProgram, "uSpecularLightColor");
        }

        pwgl.world = mat4.create();
        pwgl.view = mat4.create();
        pwgl.proj = mat4.create();
        pwgl.modelViewMatrixStack = [];
    }


    function setupGround() {
        _ground.pos = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, _ground.pos);

        var cnt = 150;
        var w = 150.0;
        var h = 150.0;

        var buff = [];
        for (var i = 0; i < cnt; ++i) {
            // vertex x,y,z
            buff.push(0.0);
            buff.push(0.0);
            buff.push(i);

            // vertex x,y,z
            buff.push(w);
            buff.push(0.0);
            buff.push(i);
        }

        for (var i = 0; i < cnt; ++i) {
            // vertex x,y,z
            buff.push(i);
            buff.push(0);
            buff.push(0);

            // vertex x,y,z
            buff.push(i);
            buff.push(0);
            buff.push(h);
        }

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(buff), gl.STATIC_DRAW);
        _ground.itemSize = 3;
        _ground.numItems = cnt * 4;
    }


    function setupCube() {
        _cube.pos = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, _cube.pos);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(CubeGeo.posBuff), gl.STATIC_DRAW);
        _cube.pos.itemSize = 3;
        _cube.pos.numItems = 24;

        _cube.norm = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, _cube.norm);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(CubeGeo.normBuff), gl.STATIC_DRAW);
        _cube.norm.itemSize = 3;
        _cube.norm.numItems = 24;

        _cube.col = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, _cube.col);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(CubeGeo.colorBuff), gl.STATIC_DRAW);
        _cube.col.itemSize = 4;
        _cube.col.numItems = 24;

        _cube.index = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, _cube.index);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(CubeGeo.indices), gl.STATIC_DRAW);
        _cube.index.itemSize = 1;
        _cube.index.numItems = 36;
    }


    function setupBuffers() {
        setupGround();
        setupCube();
    }


    function setupLights() {
        gl.uniform3fv(pwgl.uniformLightPositionLoc, [0.0, 20.0, 0.0]);
        gl.uniform3fv(pwgl.uniformAmbientLightColorLoc, [0.2, 0.2, 0.2]);
        gl.uniform3fv(pwgl.uniformDiffuseLightColorLoc, [0.7, 0.7, 0.7]);
        gl.uniform3fv(pwgl.uniformSpecularLightColorLoc, [0.8, 0.8, 0.8]);
    }


    function renderGround() {
        gl.useProgram(_posShader.program);

        mat4.identity(pwgl.world);
        mat4.translate(pwgl.world, [-25, 0, -50]);
        gl.uniformMatrix4fv(_posShader.mWorld, false, pwgl.world);
        gl.uniformMatrix4fv(_posShader.mView, false, pwgl.view);
        gl.uniformMatrix4fv(_posShader.mProj, false, pwgl.proj);
        gl.bindBuffer(gl.ARRAY_BUFFER, _ground.pos);
        gl.vertexAttribPointer(_posShader.pos, _ground.itemSize, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(_posShader.pos);
        gl.drawArrays(gl.LINES, 0, _ground.numItems);
    }


    // render outline
    function renderLine() {
        renderCubeBlock(_pnShader, [66.4, 20, 1], [0.1, 20, 0.1], [1, 1, 1, 1], 0);
        renderCubeBlock(_pnShader, [45.9, 20, 1], [0.1, 20, 0.1], [1, 1, 1, 1], 0);
        renderCubeBlock(_pnShader, [56.1, 0, 1], [10.3, 0.1, 0.1], [1, 1, 1, 1], 0);
    }


    // flag=1 : render color
    function renderCube(shader, flag) {
        gl.useProgram(shader.program);

        // update camera matrix (view, projection matrix)
        gl.uniformMatrix4fv(shader.mWorld, false, pwgl.world);
        gl.uniformMatrix4fv(shader.mView, false, pwgl.view);
        gl.uniformMatrix4fv(shader.mProj, false, pwgl.proj);

        // update lighting
        gl.uniform3fv(shader.uLightPos, [0.0, 20.0, 0.0]);
        gl.uniform3fv(shader.uAmbient, [0.2, 0.2, 0.2]);
        gl.uniform3fv(shader.uDiffuse, [0.7, 0.7, 0.7]);
        gl.uniform3fv(shader.uSpecular, [0.8, 0.8, 0.8]);

        // update normal matrix (model space -> view space)
        var normalMatrix = mat3.create();
        mat4.toInverseMat3(pwgl.view, normalMatrix);
        mat3.transpose(normalMatrix);
        gl.uniformMatrix3fv(shader.mNInv, false, normalMatrix);

        gl.bindBuffer(gl.ARRAY_BUFFER, _cube.pos);
        gl.vertexAttribPointer(shader.pos, _cube.pos.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, _cube.norm);
        gl.vertexAttribPointer(shader.norm, _cube.norm.itemSize, gl.FLOAT, false, 0, 0);

        if ((flag != undefined) && (flag == 1)) {
            gl.bindBuffer(gl.ARRAY_BUFFER, _cube.col);
            gl.enableVertexAttribArray(shader.col);
            gl.vertexAttribPointer(shader.col, _cube.col.itemSize, gl.FLOAT, false, 0, 0);
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, _cube.index);

        gl.enableVertexAttribArray(shader.pos);
        gl.enableVertexAttribArray(shader.norm);
        gl.drawElements(gl.TRIANGLES, _cube.index.numItems, gl.UNSIGNED_SHORT, 0);
    }


    // render cube block
    // shader : shader obj
    // pos : [x,y,z]
    // scale : [x,y,z]
    // color : [r,g,b,a]
    // flag : 0=nothing, 1=vertex color
    function renderCubeBlock(shader, pos, scale, color, flag) {
        gl.useProgram(shader.program);

        // update camera matrix (view, projection matrix)
        mat4.identity(pwgl.world);
        mat4.translate(pwgl.world, pos);
        mat4.scale(pwgl.world, scale);

        gl.uniformMatrix4fv(shader.mWorld, false, pwgl.world);
        gl.uniformMatrix4fv(shader.mView, false, pwgl.view);
        gl.uniformMatrix4fv(shader.mProj, false, pwgl.proj);

        // update lighting
        gl.uniform3fv(shader.uLightPos, [0.0, 20.0, 0.0]);
        gl.uniform3fv(shader.uAmbient, [color[0] * 0.2, color[1] * 0.2, color[2] * 0.2]);
        gl.uniform3fv(shader.uDiffuse, [color[0] * 0.7, color[1] * 0.7, color[2] * 0.7]);
        gl.uniform3fv(shader.uSpecular, [0.8, 0.8, 0.8]);

        // update normal matrix (model space -> view space)
        var normalMatrix = mat3.create();
        mat4.toInverseMat3(pwgl.view, normalMatrix);
        mat3.transpose(normalMatrix);
        gl.uniformMatrix3fv(shader.mNInv, false, normalMatrix);

        gl.bindBuffer(gl.ARRAY_BUFFER, _cube.pos);
        gl.vertexAttribPointer(shader.pos, _cube.pos.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, _cube.norm);
        gl.vertexAttribPointer(shader.norm, _cube.norm.itemSize, gl.FLOAT, false, 0, 0);

        if ((flag != undefined) && (flag == 1)) {
            gl.bindBuffer(gl.ARRAY_BUFFER, _cube.col);
            gl.enableVertexAttribArray(shader.col);
            gl.vertexAttribPointer(shader.col, _cube.col.itemSize, gl.FLOAT, false, 0, 0);
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, _cube.index);

        gl.enableVertexAttribArray(shader.pos);
        gl.enableVertexAttribArray(shader.norm);
        gl.drawElements(gl.TRIANGLES, _cube.index.numItems, gl.UNSIGNED_SHORT, 0);
    }


    // render blocks
    function renderBlocks() {
        var color = [1.0, 1.0, 0, 1];
        var offset = [47, 1.0, 2];

        for (var i = 0; i < 10; ++i) {
            for (var k = 0; k < 20; ++k) {
                if (_blocks[i][k] == 0)
                    continue;

                var x = i * 2.03 + offset[0];
                var y = k * 2.03 + offset[1];
                var z = 0 + offset[2];
                renderCubeBlock(_pnShader, [x, y, z], [1, 1, 1], color, 0);
            }
        }
    }


    // render control blocks
    function renderCtrlBlocks() {
        var color = [1.0, 1, 0, 1];
        var offset = [47, 1.0, 2];
        var posX = _ctrlPos.x; // control block pos
        var posY = _ctrlPos.y;

        for (var x = 0; x < 4; ++x) {
            for (var y = 0; y < 4; ++y) {
                if (_ctrlBlocks[_ctrlType][_ctrlDir][y][x] != 0) {
                    if ((x + posX < 0)
                        || (x + posX > 9)
                        || (posY - y < 0)
                        || (posY - y > 19)) {
                        continue;
                    }

                    var xx = (x + posX) * 2.03 + offset[0];
                    var yy = (posY - y) * 2.03 + offset[1];
                    var zz = 0 + offset[2];
                    renderCubeBlock(_pnShader, [xx, yy, zz], [1, 1, 1], color, 0);
                }
            }
        }
    }


    // render control blocks
    function renderNextBlocks() {
        var color = [1.0, 0, 0, 1];
        var offset = [35, 25, 2];

        for (var x = 0; x < 4; ++x) {
            for (var y = 0; y < 4; ++y) {
                if (_ctrlBlocks[_nextCtrlType][0][y][x] != 0) {
                    var xx = x * 2.03 + offset[0];
                    var yy = (3 - y) * 2.03 + offset[1];
                    var zz = 0 + offset[2];
                    renderCubeBlock(_pnShader, [xx, yy, zz], [1, 1, 1], color, 0);
                }
            }
        }
    }


    // update control block to blocks
    // spawn next block
    function nextBlock() {
        updateControlBlocks(true);
        //updateBlocks();
        shiftBlocks();

        _ctrlType = _nextCtrlType;
        _nextCtrlType = getRandomInt(0, 4);
        _ctrlDir = 0;
        _ctrlPos.set(3, 19);

        updateNextControlBlocks();

        var rets = checkBlocks(_ctrlPos);
        if (rets.isLimit || rets.isBlock) {
            _isGameOver = true;
        }
    }


    // check is possible control block mapping to blocks
    // controlPos : control block pos
    // return isLimit?, isBlock?
    //      isLimit : move xy limit?
    //      isBlock : move another block location?
    function checkBlocks(controlPos) {
        var isStop = false;
        var isBlock = false;
        var posX = controlPos.x;
        var posY = controlPos.y;

        for (var x = 0; x < 4 && !isStop; ++x) {
            for (var y = 0; y < 4 && !isStop; ++y) {
                if (_ctrlBlocks[_ctrlType][_ctrlDir][y][x] != 0) {
                    // check limit
                    if (x + posX < 0) {
                        isStop = true;
                    }
                    if (x + posX > 9) {
                        isStop = true;
                    }
                    if (posY - y < 0) {
                        isStop = true;
                        isBlock = true;
                    }
                    if (posY - y > 19) {
                        isStop = true;
                    }

                    if (isStop)
                        break;

                    // check another block?
                    if (_blocks[x + posX][posY - y] != 0) {
                        isStop = true;
                        isBlock = true;
                        break;
                    }
                }
            }
        }

        return {
            isLimit: isStop,
            isBlock: isBlock
        };
    }


    // update only control block to cubes visible
    // mappingToBlocks : update ctrl block to blocks?
    function updateControlBlocks(mappingToBlocks) {
        var posX = _ctrlPos.x; // control block pos
        var posY = _ctrlPos.y;

        for (var x = 0; x < 4; ++x) {
            for (var y = 0; y < 4; ++y) {
                if (_ctrlBlocks[_ctrlType][_ctrlDir][y][x] != 0) {
                    if ((x + posX < 0)
                        || (x + posX > 9)
                        || (posY - y < 0)
                        || (posY - y > 19)) {
                        continue;
                    }

                    //cubes[x + posX][posY - y].visible = true;

                    if (mappingToBlocks) {
                        _blocks[x + posX][posY - y] = 1;
                    }
                }
            }
        }
    }


    function updateNextControlBlocks() {
        for (var x = 0; x < 4; ++x) {
            for (var y = 0; y < 4; ++y) {
                if (_ctrlBlocks[_nextCtrlType][0][y][x] != 0) {
                    _nextBlocks[x][3 - y] = 1;
                }
                else {
                    _nextBlocks[x][3 - y] = 0;
                }
            }
        }
    }


    // remove block line
    function shiftBlocks() {
        for (var y = 0; y < 20; ++y) {
            var cnt = 0;
            for (var x = 0; x < 10; ++x) {
                if (_blocks[x][y])
                    ++cnt;
            }

            // full one line?
            if (cnt == 10) {
                // remove : copy to y -> y-1
                for (var cy = y + 1; cy < 20; ++cy)
                    for (var cx = 0; cx < 10; ++cx)
                        _blocks[cx][cy - 1] = _blocks[cx][cy];

                // to line empty
                for (var cx = 0; cx < 10; ++cx)
                    _blocks[cx][19] = 0;

                --y;
            }
        }
    }


    function handleContextLost(event) {
        event.preventDefault();
        cancelRequestAnimFrame(pwgl.requestId);
    }


    function init() {
        setupBlocks();
        setupShaders();
        setupBuffers();
        setupLights();
        gl.clearColor(0.1, 0.1, 0.1, 1.0);
        gl.enable(gl.DEPTH_TEST);

        // Initialize some variables related to the animation
        pwgl.animationStartTime = undefined;
        pwgl.nbrOfFramesForFPS = 0;
        pwgl.previousFrameTimeStamp = Date.now();
        pwgl.oldTime = 0;
    }


    function handleContextRestored(event) {
        init();
        pwgl.requestId = requestAnimFrame(draw, _canvas);
    }


    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }


    function startup() {
        _canvas = WebGLDebugUtils.makeLostContextSimulatingCanvas(_canvas);
        _canvas.addEventListener('webglcontextlost', handleContextLost, false);
        _canvas.addEventListener('webglcontextrestored', handleContextRestored, false);
        init();
        render();
    }


    function onKeyDown(event) {
        if (_isGameOver) return;

        switch (event.keyCode) {
            case keys.UP:
                {
                    _ctrlDir += 1;
                    _ctrlDir %= 4;

                    var rets = checkBlocks(_ctrlPos)
                    if (rets.isLimit || rets.isBlock) {
                        _ctrlDir += 4;
                        _ctrlDir -= 1;
                        _ctrlDir %= 4;
                    }
                }
                break;

            case keys.BOTTOM:
                if (_ctrlPos.y > 0) {
                    var rets = checkBlocks(new Vector2(_ctrlPos.x, _ctrlPos.y - 1));
                    if (!rets.isLimit && !rets.isBlock) {
                        _ctrlOldPos.copy(_ctrlPos);
                        _ctrlPos.y -= 1;
                    }
                }
                break;

            case keys.LEFT:
                var rets = checkBlocks(new Vector2(_ctrlPos.x + 1, _ctrlPos.y));
                if (!rets.isLimit && !rets.isBlock) {
                    _ctrlOldPos.copy(_ctrlPos);
                    _ctrlPos.x += 1;
                }
                break;

            case keys.RIGHT:
                var rets = checkBlocks(new Vector2(_ctrlPos.x - 1, _ctrlPos.y));
                if (!rets.isLimit && !rets.isBlock) {
                    _ctrlOldPos.copy(_ctrlPos);
                    _ctrlPos.x -= 1;
                }
                break;
        }
    }


    function render(time) {

        var currentTime = Date.now();
        pwgl.requestId = window.requestAnimationFrame(render);

        var delta = Math.min(100, currentTime - pwgl.oldTime) * 0.001;
        pwgl.oldTime = currentTime;

        gl.viewport(0, 0, _canvas.width, _canvas.height);
        gl.clearColor(clear_color.x, clear_color.y, clear_color.z, clear_color.w);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        mat4.perspective(60, _canvas.width / _canvas.height, 1, 1000.0, pwgl.proj);
        mat4.identity(pwgl.view);
        mat4.lookAt([50, 28, -35], [50, 0, 140], [0, 1, 0], pwgl.view);
        mat4.identity(pwgl.world);

        if (!_isGameOver) {
            _incTime += delta;

            var isNextStep = false;
            if (_incTime > 1) {
                _incTime = 0;
                _ctrlOldPos.copy(_ctrlPos);
                _ctrlPos.y--;
                isNextStep = true;

                if (_ctrlPos.y < 0) {
                    _ctrlPos.y = 0;
                    nextBlock();
                }
            }

            if (isNextStep) {
                var rets = checkBlocks(_ctrlPos);

                if (rets.isLimit || rets.isBlock) {
                    _ctrlPos.copy(_ctrlOldPos);
                }
                else {
                    _ctrlOldPos.copy(_ctrlPos);
                }

                if (isNextStep && rets.isBlock) {
                    nextBlock();
                }
            }
        }

        renderGround();
        renderLine();
        renderBlocks();
        renderCtrlBlocks();
        renderNextBlocks();

        // Render ImGui
        ImGui_Impl.NewFrame(time);
        ImGui.NewFrame();

        ImGui.SetNextWindowPos(new ImGui.ImVec2(20, 20), ImGui.Cond.FirstUseEver);
        ImGui.SetNextWindowSize(new ImGui.ImVec2(294, 140), ImGui.Cond.FirstUseEver);
        ImGui.Begin("Debug");
        ImGui.ColorEdit4("clear color", clear_color);
        ImGui.End();
        ImGui.EndFrame();
        ImGui.Render();
        ImGui_Impl.RenderDrawData(ImGui.GetDrawData());
        //~
    }

    function _done() {
        ImGui_Impl.Shutdown();
        ImGui.DestroyContext();
    }
});
