
import * as THREE from './libs/three/build/three.module.js';
import { RenderPass } from './libs/three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from './libs/three/examples/jsm/postprocessing/ShaderPass.js';
import { TexturePass } from './libs/three/examples/jsm/postprocessing/TexturePass.js';
import { MaskPass, ClearMaskPass } from './libs/three/examples/jsm/postprocessing/MaskPass.js';
import { EffectComposer } from './libs/three/examples/jsm/postprocessing/EffectComposer.js';
import { CopyShader } from './libs/three/examples/jsm/shaders/CopyShader.js';
import { LuminosityShader } from './libs/three/examples/jsm/shaders/LuminosityShader.js';
import { SobelOperatorShader } from './libs/three/examples/jsm/shaders/SobelOperatorShader.js';
import { AdditiveShader } from './libs/three/examples/jsm/shaders/AdditiveShader.js';
import { OrbitControls } from './libs/three/examples/jsm/controls/OrbitControls.js';
import Stats from './libs/three/examples/jsm/libs/stats.module.js';
import { GUI } from './libs/three/examples/jsm/libs/dat.gui.module.js';

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
   

    const canvas = document.getElementById("output");
    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = canvas.scrollWidth * devicePixelRatio;
    canvas.height = canvas.scrollHeight * devicePixelRatio;
    window.addEventListener("resize", () => {
        const devicePixelRatio = window.devicePixelRatio || 1;
        canvas.width = canvas.scrollWidth * devicePixelRatio;
        canvas.height = canvas.scrollHeight * devicePixelRatio;
    });
    //window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('keydown', onKeyDown, false);

    // tetris block array
    // blocks[x:10][y:20]
    var blocks = new Array();
    for (var i = 0; i < 10; ++i) {
        blocks[i] = new Array();
        for (var k = 0; k < 20; ++k) {
            blocks[i][k] = 0;
        }
    }

    // tetris variable
    var isGameOver = false;
    var incTime = 0;
    var ctrlType = getRandomInt(0, 4); // control block type
    var nextCtrlType = getRandomInt(0, 4);
    var ctrlDir = 0; // control block direction
    var ctrlPos = new THREE.Vector2(); // control block pos(x,y) {0~9, 0~19}
    ctrlPos.set(3, 19);
    var ctrlOldPos = new THREE.Vector2();
    ctrlOldPos.copy(ctrlPos);

    // control block 4 X 4 X 4 X 4
    // ctrlBlock[type][direction][y][x]
    var ctrlBlocks = [
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

    var keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };


    // Initialize ImGui
    ImGui.CreateContext();
    ImGui_Impl.Init(canvas);
    const gl = canvas.getContext("webgl", { stencil: true });
    ImGui.StyleColorsDark();
    const clear_color = new ImGui.ImVec4(0.45, 0.55, 0.60, 1.00);

    // Initialize Three.js
    const renderer = new THREE.WebGLRenderer({ canvas: canvas });
    renderer.setClearColor(new THREE.Color(0.45, 0.55, 0.60, 1.0));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.Enabled = true;

    var stats = initStats();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, canvas.width / canvas.height, 0.1, 1000);

    var planeGeometry = new THREE.PlaneGeometry(50, 50, 1, 1);
    var planeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.receiveShadow = true;

    plane.rotation.x = -0.5 * Math.PI;
    //plane.position.x = 15;
    plane.position.x = 0;
    plane.position.y = -0.01;
    plane.position.z = 0;
    scene.add(plane);

    var lookAt = new THREE.Vector3(0, 0, -30)
    camera.position.set(0, 20, 25);
    camera.lookAt(lookAt);
    camera.updateProjectionMatrix();

    var clock = new THREE.Clock();

    var orbit = new OrbitControls(camera, canvas);
    orbit.target = lookAt;
    orbit.enableKeys = false;

    var ambientLight = new THREE.AmbientLight(0x0c0c0c);
    scene.add(ambientLight);

    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(60, 60, 60);
    spotLight.castShadow = true;
    scene.add(spotLight);

    var points = [];
    var z = 0.01;
    for (var i = 0; i < 50; ++i) {
        points.push({ x: i, y: 0, z: z });
        points.push({ x: i, y: 50, z: z });
    }
    for (var i = 0; i < 50; ++i) {
        points.push({ x: 0, y: i, z: z });
        points.push({ x: 50, y: i, z: z });
    }

    var lines = new THREE.Geometry();
    var i = 0;
    points.forEach(function (e) {
        lines.vertices.push(new THREE.Vector3(e.x, e.z, e.y));
        i++;
    });

    var material = new THREE.LineBasicMaterial({
        opacity: 1.0,
        linewidth: 1,
        vertexColors: THREE.VertexColors
    });

    var line = new THREE.LineSegments(lines, material);
    line.position.set(-25, 0, -25);
    scene.add(line);

    // create block cube
    var cubes = new Array();
    for (var x = 0; x < 10; ++x) {
        cubes[x] = new Array();
        for (var y = 0; y < 20; ++y) {
            var size = 1;
            var cubeGeometry = new THREE.BoxGeometry(size, size, size);
            var cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
            var wireFrameMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
            wireFrameMat.wireframe = true;

            var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
            cube.castShadow = true;

            var offset = new THREE.Vector3(0.5, 0.5, -0.5);

            // position the cube
            cube.position.x = x - 5;
            cube.position.y = y;
            cube.position.z = 0;
            cube.position.add(offset);

            // add the cube to the scene
            scene.add(cube);
            cubes[x][y] = cube;
        }
    }

    // create next block cube
    var nextCubes = new Array();
    for (var x = 0; x < 4; ++x) {
        nextCubes[x] = new Array();
        for (var y = 0; y < 4; ++y) {
            var size = 1;
            var cubeGeometry = new THREE.BoxGeometry(size, size, size);
            var cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
            var wireFrameMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
            wireFrameMat.wireframe = true;

            var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
            cube.castShadow = true;

            var offset = new THREE.Vector3(0.5, 0.5, -0.5);

            // position the cube
            cube.position.x = x + 6;
            cube.position.y = y + 14;
            cube.position.z = 0;
            cube.position.add(offset);

            // add the cube to the scene
            scene.add(cube);
            nextCubes[x][y] = cube;
        }
    }

    // var axesHelper = new THREE.AxisHelper( 5 );
    // axesHelper.material.depthTest = false;
    // scene.add( axesHelper );

    // outline
    {
        var size = 0.05;

        var cubeGeometry = new THREE.BoxGeometry(10, size, size);
        var cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        var bottom = new THREE.Mesh(cubeGeometry, cubeMaterial);
        bottom.position.x = 0;
        bottom.position.y = 0.1;
        bottom.position.z = 0;
        scene.add(bottom);

        var left = new THREE.Mesh(cubeGeometry, cubeMaterial);
        left.position.x = -5;
        left.position.y = 10;
        left.position.z = 0;
        left.scale.x = 2;
        left.rotation.z = Math.PI / 2;
        scene.add(left);

        var right = new THREE.Mesh(cubeGeometry, cubeMaterial);
        right.position.x = 5;
        right.position.y = 10;
        right.position.z = 0;
        right.scale.x = 2;
        right.rotation.z = Math.PI / 2;
        scene.add(right);
    }

    var renderPass = new RenderPass(scene, camera);

    var effectCopy = new ShaderPass(CopyShader);
    effectCopy.renderToScreen = true;

    var lum = new ShaderPass(LuminosityShader);

    var effectSobel = new ShaderPass(SobelOperatorShader);
    effectSobel.uniforms['resolution'].value.x = window.innerWidth * window.devicePixelRatio;
    effectSobel.uniforms['resolution'].value.y = window.innerHeight * window.devicePixelRatio;

    var clearMask = new ClearMaskPass();

    var composer0 = new EffectComposer(renderer);
    composer0.addPass(renderPass);
    composer0.addPass(clearMask);

    var originalScene = new TexturePass(composer0.renderTarget2.texture);

    var composer1 = new EffectComposer(renderer);
    composer1.addPass(originalScene);
    composer1.addPass(lum);
    composer1.addPass(effectSobel);
    composer1.addPass(clearMask);
    var edgeScene = new TexturePass(composer1.renderTarget2.texture);

    // blend pass
    var additivePass = new ShaderPass(AdditiveShader, 'tDiffuse1');
    additivePass.uniforms['tDiffuse2'].value = composer0.renderTarget2.texture;
    additivePass.uniforms['srcAlpha1'].value = 1.0;
    additivePass.uniforms['srcAlpha2'].value = 1.0;

    var composer2 = new EffectComposer(renderer);
    composer2.addPass(edgeScene);
    composer2.addPass(additivePass);
    // composer2.addPass(bloomPass);
    composer2.addPass(effectCopy);

    // call the render function
    var step = 0;

    var controls = new function () {
        this.rotationSpeed = 0.02;
        this.bouncingSpeed = 0.03;
        this.effect = true;
    };

    var gui = new GUI();
    gui.add(controls, 'effect');

    updateNextControlBlocks();
    render();


    // render tetris block object
    function render() {
        stats.update();
        orbit.update();

        if (!isGameOver) {
            var delta = clock.getDelta();
            incTime += delta;

            var isNextStep = false;
            if (incTime > 1) {
                incTime = 0;
                ctrlOldPos.copy(ctrlPos);
                ctrlPos.y--;
                isNextStep = true;

                if (ctrlPos.y < 0) {
                    ctrlPos.y = 0;
                    nextBlock();
                }
            }

            if (isNextStep) {
                var rets = checkBlocks(ctrlPos);

                if (rets.isLimit || rets.isBlock) {
                    ctrlPos.copy(ctrlOldPos);
                }
                else {
                    ctrlOldPos.copy(ctrlPos);
                }

                updateBlocks();
                updateControlBlocks(false);

                if (isNextStep && rets.isBlock) {
                    nextBlock();
                }
            }
            else {
                updateBlocks();
                updateControlBlocks(false);
            }
        }

        if (controls.effect == true) {
            renderer.autoClear = false;
            renderer.clear();

            composer0.render();
            composer1.render();
            composer2.render();
        }
        else {
            renderer.clear();
            renderer.render(scene, camera);
        }
    }


    // update control block to blocks
    // spawn next block
    function nextBlock() {
        updateControlBlocks(true);
        updateBlocks();
        shiftBlocks();

        ctrlType = nextCtrlType;
        nextCtrlType = getRandomInt(0, 4);
        ctrlDir = 0;
        ctrlPos.set(3, 19);

        updateNextControlBlocks();

        var rets = checkBlocks(ctrlPos);
        if (rets.isLimit || rets.isBlock) {
            isGameOver = true;
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
                if (ctrlBlocks[ctrlType][ctrlDir][y][x] != 0) {
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
                    if (blocks[x + posX][posY - y] != 0) {
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
        var posX = ctrlPos.x; // control block pos
        var posY = ctrlPos.y;

        for (var x = 0; x < 4; ++x) {
            for (var y = 0; y < 4; ++y) {
                if (ctrlBlocks[ctrlType][ctrlDir][y][x] != 0) {
                    if ((x + posX < 0)
                        || (x + posX > 9)
                        || (posY - y < 0)
                        || (posY - y > 19)) {
                        continue;
                    }

                    cubes[x + posX][posY - y].visible = true;

                    if (mappingToBlocks) {
                        blocks[x + posX][posY - y] = 1;
                    }
                }
            }
        }
    }


    // update blocks to cubes visible
    // show/hide blocks
    function updateBlocks() {
        for (var x = 0; x < 10; ++x) {
            for (var y = 0; y < 20; ++y) {
                if (blocks[x][y] == 0) {
                    cubes[x][y].visible = false;
                }
                else {
                    cubes[x][y].visible = true;
                }
            }
        }
    }

    function updateNextControlBlocks() {
        for (var x = 0; x < 4; ++x) {
            for (var y = 0; y < 4; ++y) {
                if (ctrlBlocks[nextCtrlType][0][y][x] != 0) {
                    nextCubes[x][3 - y].visible = true;
                }
                else {
                    nextCubes[x][3 - y].visible = false;
                }
            }
        }
    }

    // remove block line
    function shiftBlocks() {
        for (var y = 0; y < 20; ++y) {
            var cnt = 0;
            for (var x = 0; x < 10; ++x) {
                if (blocks[x][y])
                    ++cnt;
            }

            // full one line?
            if (cnt == 10) {
                // remove : copy to y -> y-1
                for (var cy = y + 1; cy < 20; ++cy)
                    for (var cx = 0; cx < 10; ++cx)
                        blocks[cx][cy - 1] = blocks[cx][cy];

                // to line empty
                for (var cx = 0; cx < 10; ++cx)
                    blocks[cx][19] = 0;

                --y;
            }
        }
    }

    function initStats() {

        var stats = new Stats();

        stats.setMode(0); // 0: fps, 1: ms

        // Align top-left
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';

        document.getElementById("Stats-output").appendChild(stats.domElement);

        return stats;
    }

    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function onKeyDown(event) {
        if (isGameOver) return;

        switch (event.keyCode) {
            case keys.UP:
                {
                    ctrlDir += 1;
                    ctrlDir %= 4;

                    var rets = checkBlocks(ctrlPos)
                    if (rets.isLimit || rets.isBlock) {
                        ctrlDir += 4;
                        ctrlDir -= 1;
                        ctrlDir %= 4;
                    }
                }
                break;

            case keys.BOTTOM:
                if (ctrlPos.y > 0) {
                    var rets = checkBlocks(new THREE.Vector2(ctrlPos.x, ctrlPos.y - 1));
                    if (!rets.isLimit && !rets.isBlock) {
                        ctrlOldPos.copy(ctrlPos);
                        ctrlPos.y -= 1;
                    }
                }
                break;

            case keys.LEFT:
                var rets = checkBlocks(new THREE.Vector2(ctrlPos.x - 1, ctrlPos.y));
                if (!rets.isLimit && !rets.isBlock) {
                    ctrlOldPos.copy(ctrlPos);
                    ctrlPos.x -= 1;
                }
                break;

            case keys.RIGHT:
                var rets = checkBlocks(new THREE.Vector2(ctrlPos.x + 1, ctrlPos.y));
                if (!rets.isLimit && !rets.isBlock) {
                    ctrlOldPos.copy(ctrlPos);
                    ctrlPos.x += 1;
                }
                break;
        }
    }




    window.requestAnimationFrame(_loop);
    function _loop(time) {

        // ImGui Render
        ImGui_Impl.NewFrame(time);
        ImGui.NewFrame();

        ImGui.SetNextWindowPos(new ImGui.ImVec2(20, 20), ImGui.Cond.FirstUseEver);
        ImGui.SetNextWindowSize(new ImGui.ImVec2(294, 140), ImGui.Cond.FirstUseEver);
        ImGui.Begin("Debug");
        ImGui.ColorEdit4("clear color", clear_color);
        ImGui.Separator();
        ImGui.Text(`Scene: ${scene.uuid.toString()}`);
        ImGui.Separator();
        ImGui.End();
        ImGui.EndFrame();
        ImGui.Render();
        //~ImGui Render

        // Render Three.Js
        render();
        ImGui_Impl.RenderDrawData(ImGui.GetDrawData());
        renderer.state.reset(); // TODO: restore WebGL state in ImGui Impl

        window.requestAnimationFrame(_loop);
    }


    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }        


    function _done() {
        ImGui_Impl.Shutdown();
        ImGui.DestroyContext();
    }
});
