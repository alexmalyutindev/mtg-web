export class Mesh {
    vertices: Float32Array;
    uv: Float32Array;
    indices: Uint16Array

    vertex_buffer: WebGLBuffer;
    uv_buffer: WebGLBuffer;
    index_buffer: WebGLBuffer;

    static Quad(): Mesh {
        const quad = new Mesh();
        quad.vertices = new Float32Array([
            -0.5, 0.5, 0.0,
            -0.5, -0.5, 0.0,
            0.5, -0.5, 0.0,
            0.5, 0.5, 0.0
        ]);
        quad.indices = new Uint16Array([
            3, 2, 1,
            3, 1, 0
        ]);
        quad.uv = new Float32Array([
            0.0, 1.0,
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0
        ]);
        return quad;
    }

    Init(gl: WebGL2RenderingContext): void {
        this.vertex_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

        if (this.uv.length > 0) {
            this.uv_buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.uv_buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.uv), gl.STATIC_DRAW);
        }

        this.index_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
    }
}