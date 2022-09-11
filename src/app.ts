import { parseCard } from "magic-card-parser";

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


const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const gl = canvas.getContext("webgl2");
console.log(gl);

// Init Geomerty
const vertices = [
    -0.5, 0.5, 0.0,
    -0.5, -0.5, 0.0,
    0.5, -0.5, 0.0,
    0.5, 0.5, 0.0
];

const indices = [3, 2, 1, 3, 1, 0];

var vertex_buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
gl.bindBuffer(gl.ARRAY_BUFFER, null);

var index_Buffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_Buffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);


var vertCode = `
    attribute vec3 coordinates;
    uniform float u_time;
    void main(void) {
      gl_Position = vec4(coordinates, 1.0);
      gl_Position.y += sin(u_time) * 0.1;
    }`;
    
var fragCode = `
    void main(void) {
      gl_FragColor = vec4(0.75, 0.3, 0.28, 1.0);
    }`;

var vertShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertShader, vertCode);
gl.compileShader(vertShader);
console.log(gl.getShaderInfoLog(vertShader));

var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragShader, fragCode);
gl.compileShader(fragShader);
console.log(gl.getShaderInfoLog(fragShader));


var shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertShader);
gl.attachShader(shaderProgram, fragShader);
gl.linkProgram(shaderProgram);
gl.useProgram(shaderProgram);


// const points = new Float32Array(10);
// const buffer = gl.createBuffer();
// gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
// gl.bufferData(gl.ARRAY_BUFFER, points, gl.DYNAMIC_DRAW);

const timeLocation = gl.getUniformLocation(shaderProgram, "u_time");
const coord = gl.getAttribLocation(shaderProgram, "coordinates");

function Render(time: number) {
    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_Buffer);

    
    gl.uniform1f(timeLocation, time / 1000.0);

    gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coord);

    gl.viewport(0, 0, canvas.width, canvas.height);

    // gl.drawArraysInstanced(gl.TRIANGLES, 0, indices.length, 10);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}

function Update(time) {
    Render(time);
    requestAnimationFrame(Update);
}

requestAnimationFrame(Update);
