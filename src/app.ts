import { parseCard } from "magic-card-parser";
import { Mesh } from "./Mesh";
import { Input } from "./InputSystem";

var result = parseCard({
    name: "Thraben Doomsayer",
    oracle_text: "{T}: create a 1/1 white Human creature token.\nFateful hour — as long as you have 5 or less life, other creatures you control get +2/+2."
});

console.log(result);

interface Cost {
    costs: any;
    activatedAbility: any;
    activate: () => void;
}

class ActivatedAbility {
    costs: any;
    activatedAbility: any;
    activate = () => {
        console.log("activate");
    };
}

var testText = JSON.stringify(result.result[2][0]);
console.log(testText);
var parsed: ActivatedAbility = JSON.parse(testText);

console.log(parsed);


function loadTexture(gl: WebGL2RenderingContext, url: string): WebGLTexture {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Because images have to be downloaded over the internet
    // they might take a moment until they are ready.
    // Until then put a single pixel in the texture so we can
    // use it immediately. When the image has finished downloading
    // we'll update the texture with the contents of the image.
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
        width, height, border, srcFormat, srcType,
        pixel);

    const image = new Image();
    image.crossOrigin = "";
    image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);

        // WebGL1 has different requirements for power of 2 images
        // vs non power of 2 images so check if the image is a
        // power of 2 in both dimensions.
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            // Yes, it's a power of 2. Generate mips.
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            // No, it's not a power of 2. Turn off mips and set
            // wrapping to clamp to edge
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
    };
    image.src = url;

    return texture!;
}

function isPowerOf2(value: number) {
    return (value & (value - 1)) === 0;
}

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
const worldToView = new Float32Array([
    cos, 0, sin, 0,
    0, 1, 0, 0,
    -sin, 0, cos, -5,
    0, 0, 0, 1,
]);

document.getElementById("fov").addEventListener("input", function (e) {
    var f = Math.tan(Math.PI * 0.5 - 0.5 * this.value * Math.PI);
    projection[0] = f / aspect;
    projection[5] = f;
});

const TRANSLATION_X = 3, TRANSLATION_Y = 7, TRANSLATION_Z = 11;
document.getElementById("x").addEventListener("input", function (e) {
    objectToWorld[TRANSLATION_X] = +(e.target as HTMLInputElement).value;
});
document.getElementById("y").addEventListener("input", function (e) {
    objectToWorld[TRANSLATION_Y] = +(event.target as HTMLInputElement).value;
});
document.getElementById("z").addEventListener("input", function (e) {
    objectToWorld[TRANSLATION_Z] = +(event.target as HTMLInputElement).value;
});

Input.Init(window);

async function Main() {
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

    // const response = await fetch("https://api.scryfall.com/cards/random");
    // var cardInfo = await response.json();
    // var texture = loadTexture(gl, cardInfo['image_uris']['small']);

    console.log(projection);

    function Render(time: number) {
        gl.disable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);

        gl.clearColor(1, 1, 1, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(shaderProgram);

        // Global
        gl.uniformMatrix4fv(u_ObjectToWorld, true, objectToWorld);
        gl.uniformMatrix4fv(u_WorldToView, true, worldToView);
        gl.uniformMatrix4fv(u_Projection, false, projection);
        gl.uniform1f(u_Time, time / 1000.0);

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

        gl.drawElements(gl.TRIANGLES, quad.indices.length, gl.UNSIGNED_SHORT, 0);

        gl.uniformMatrix4fv(u_ObjectToWorld, true, objectToWorld_2);

        gl.drawElements(gl.TRIANGLES, quad.indices.length, gl.UNSIGNED_SHORT, 0);
    }

    function Update(time: number) {
        Time.time = time;
        Time.deltaTime = (time - Time.lastUpdateTime) * 0.001;
        Time.lastUpdateTime = time;

        worldToView[TRANSLATION_X] -= Input.axis.x * Time.deltaTime;
        worldToView[TRANSLATION_Z] += Input.axis.y * Time.deltaTime;

        Render(time);
        requestAnimationFrame(Update);
    }

    requestAnimationFrame(Update);
}

export class Time {
    static time: number = 0;
    static deltaTime: number = 0.01;
    static lastUpdateTime: number = 0;
}

Main();