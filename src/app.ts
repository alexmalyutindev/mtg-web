import { Mesh } from "./Mesh";
import { Input } from "./InputSystem";
import { Scene } from "./Scene";

function CreateShader(gl: WebGL2RenderingContext): WebGLProgram {
    const vertCode = `
    uniform float u_Time;
    uniform mat4 u_ObjectToWorld;
    uniform mat4 u_WorldToView;
    uniform mat4 u_Projection;

    attribute vec3 a_PositionOS;
    attribute vec2 a_Texcoord;

    varying vec2 v_Texcoord;

    void main(void) {
        v_Texcoord = a_Texcoord;
        vec3 positionWS = (u_ObjectToWorld * vec4(a_PositionOS, 1.0)).xyz;
        vec3 positionVS = (u_WorldToView * vec4(positionWS, 1.0)).xyz;

        vec4 posiotionCS = u_Projection * vec4(positionVS, 1.0);
        gl_Position = posiotionCS;
    }`;

    const fragCode = `
    precision mediump float;
    varying mediump vec2 v_Texcoord;

    uniform sampler2D u_MainTex;

    float checkers(in vec2 p)
    {
        vec2 s = sign(fract(p*.5)-.5);
        return .5 - .5*s.x*s.y;
    }

    void main(void) {
        float checker = checkers(v_Texcoord.xy * 5.0);
        gl_FragColor = mix(vec4(.2, .2, .2, 1.0), vec4(.9, .9, .9, 1.0), checker); 
        // Texture2D(u_MainTex, v_Texcoord);
    }`;

    var error;
    var vertShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertShader, vertCode);
    gl.compileShader(vertShader);

    error = gl.getShaderInfoLog(vertShader);
    if (error) console.log(error);

    var fragShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragShader, fragCode);
    gl.compileShader(fragShader);

    error = gl.getShaderInfoLog(fragShader)
    if (error) console.log(error);

    var shaderProgram = gl.createProgram()!;
    gl.attachShader(shaderProgram, vertShader);
    gl.attachShader(shaderProgram, fragShader);
    gl.linkProgram(shaderProgram);

    error = gl.getProgramInfoLog(shaderProgram);
    if (error) console.log(error);

    return shaderProgram;
}

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const gl = canvas.getContext("webgl2")!;
console.log(gl);

const far = 25;
const near = 0.01;
const f = Math.tan(Math.PI * 0.5 - 0.5 * 1.047); // 1.047 <- 60grad
const aspect = canvas.width / canvas.height;
const rangeInv = 1.0 / (near - far);

// function ProjectionMat(fov, aspect) {
//     const f = 1.0 / Math.tan(fov / 2);
//     const rangeInv = 1 / (near - far);

//     return [
//         f / aspect, 0, 0, 0,
//         0, f, 0, 0,
//         0, 0, (near + far) * rangeInv, -1,
//         0, 0, near * far * rangeInv * 2, 0
//     ];
// }

const projection = new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (near + far) * rangeInv, -1,
    0, 0, 2 * near * far * rangeInv, 0
]);

var x = 0, y = 0, z = 0;
var h = 1, w = 1, d = 1;
const objectToWorld = new Float32Array([
    h, 0, 0, x,
    0, w, 0, y,
    0, 0, d, z,
    0, 0, 0, 1,
]);

var cos = 0; // cos(PI)
var sin = 1; // cos(PI)
y = -0.5;
const objectToWorld_2 = new Float32Array([
    5, 0, 0, x,
    0, 5 * cos, -5 * sin, y,
    0, 5 * sin, 5 * cos, z,
    0, 0, 0, 1,
]);

cos = -1; // cos(PI)
sin = 0; // cos(PI)
let worldToView = new Float32Array([
    cos, 0, sin, 0,
    0, 1, 0, 0,
    -sin, 0, cos, -5,
    0, 0, 0, 1,
]);

document.getElementById("fov").addEventListener("input", function (e) {
    var f = Math.tan(Math.PI * 0.5 - 0.5 * +(e.target as HTMLInputElement).value * Math.PI);
    projection[0] = f / aspect;
    projection[5] = f;
});

const TRANSLATION_X = 12, TRANSLATION_Y = 13, TRANSLATION_Z = 14;
document.getElementById("x").addEventListener("input", function (e) {
    objectToWorld[TRANSLATION_X] = +(e.target as HTMLInputElement).value;
});
document.getElementById("y").addEventListener("input", function (e) {
    objectToWorld[TRANSLATION_Y] = +(e.target as HTMLInputElement).value;
});
document.getElementById("z").addEventListener("input", function (e) {
    objectToWorld[TRANSLATION_Z] = +(e.target as HTMLInputElement).value;
});

Input.Init(window);


async function Main() {
    let request = await fetch("../resources/scene.json");
    let json = await request.json();
    const scene: Scene = new Scene().deserialize(json); 
    
    // await (await fetch("../resources/scene.json")).json();
    console.log(scene);

    worldToView = scene.root.find(a => a.type == "camera").transform;

    // return;

    const quad = Mesh.Quad();
    quad.Init(gl);

    var shaderProgram = CreateShader(gl);

    const u_ObjectToWorld = gl.getUniformLocation(shaderProgram, "u_ObjectToWorld");
    const u_WorldToView = gl.getUniformLocation(shaderProgram, "u_WorldToView");
    const u_Projection = gl.getUniformLocation(shaderProgram, "u_Projection");

    const u_Time = gl.getUniformLocation(shaderProgram, "u_Time");
    const u_Texture = gl.getUniformLocation(shaderProgram, "u_MainTex");

    const a_Texcoord = gl.getAttribLocation(shaderProgram, "a_Texcoord");
    const a_PositionOS = gl.getAttribLocation(shaderProgram, "a_PositionOS");

    function Render() {
        gl.disable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);

        gl.clearColor(1, 1, 1, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(shaderProgram);

        // Global
        // gl.uniformMatrix4fv(u_ObjectToWorld, true, objectToWorld);
        gl.uniformMatrix4fv(u_WorldToView, false, worldToView);
        gl.uniformMatrix4fv(u_Projection, false, projection);
        gl.uniform1f(u_Time, Time.time / 1000.0);

        // Bind mesh
        gl.enableVertexAttribArray(a_PositionOS);
        gl.bindBuffer(gl.ARRAY_BUFFER, quad.vertex_buffer);
        gl.vertexAttribPointer(a_PositionOS, 3, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(a_Texcoord);
        gl.bindBuffer(gl.ARRAY_BUFFER, quad.uv_buffer);
        gl.vertexAttribPointer(a_Texcoord, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quad.index_buffer);

        // Bind unitforms
        // gl.uniform1i(u_Texture, 0);

        gl.viewport(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < scene.root.length; i++) {
            let entity = scene.root[i];

            if (entity.type == 'test_quad') {
                entity.UpdateMatrix();

                gl.uniformMatrix4fv(u_ObjectToWorld, true, entity.transform);
                gl.drawElements(gl.TRIANGLES, quad.indices.length, gl.UNSIGNED_SHORT, 0);
            }
        }
    }

    function UpdateTime(time: number) {
        Time.time = time;
        Time.deltaTime = (time - Time.lastUpdateTime) * 0.001;
        Time.lastUpdateTime = time;
    }

    function UpdateInput() {
        worldToView[TRANSLATION_X] -= Input.axis.x * Time.deltaTime;
        worldToView[TRANSLATION_Z] += Input.axis.y * Time.deltaTime;
    }

    function MainLoop(time: number) {
        UpdateTime(time);
        UpdateInput();
        Render();
    }

    function A(time: number) {
        MainLoop(time);
        requestAnimationFrame(B);
    }
    function B(time: number) {
        MainLoop(time);
        requestAnimationFrame(A);
    }

    requestAnimationFrame(A);
}

export class Time {
    static time: number = 0;
    static deltaTime: number = 0.01;
    static lastUpdateTime: number = 0;
}

Main();