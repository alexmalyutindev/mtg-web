(()=>{class e{static Quad(){const t=new e;return t.vertices=new Float32Array([-.5,.5,0,-.5,-.5,0,.5,-.5,0,.5,.5,0]),t.indices=new Uint16Array([3,2,1,3,1,0]),t.uv=new Float32Array([0,1,0,0,1,0,1,1]),t}Init(e){this.vertex_buffer=e.createBuffer(),e.bindBuffer(e.ARRAY_BUFFER,this.vertex_buffer),e.bufferData(e.ARRAY_BUFFER,new Float32Array(this.vertices),e.STATIC_DRAW),this.uv.length>0&&(this.uv_buffer=e.createBuffer(),e.bindBuffer(e.ARRAY_BUFFER,this.uv_buffer),e.bufferData(e.ARRAY_BUFFER,new Float32Array(this.uv),e.STATIC_DRAW)),this.index_buffer=e.createBuffer(),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,this.index_buffer),e.bufferData(e.ELEMENT_ARRAY_BUFFER,new Uint16Array(this.indices),e.STATIC_DRAW)}}class t{constructor(e,t){this.x=e,this.y=t}}class i{constructor(e,t,i){this.x=e,this.y=t,this.z=i}}class n{static Init(e){n.keyboard=new Map,n.axis=new t(0,0),e.addEventListener("keydown",n.keyDown.bind(this)),e.addEventListener("keyup",n.keyUp.bind(this))}static keyDown(e){switch(n.keyboard.set(e.key,!0),e.key.toLowerCase()){case"d":n.axis.x=1;break;case"a":n.axis.x=-1;break;case"w":n.axis.y=1;break;case"s":n.axis.y=-1}}static keyUp(e){switch(n.keyboard.set(e.key,!1),e.key.toLowerCase()){case"d":n.axis.x=n.axis.x>0?0:n.axis.x;break;case"a":n.axis.x=n.axis.x<0?0:n.axis.x;break;case"w":n.axis.y=n.axis.y>0?0:n.axis.y;break;case"s":n.axis.y=n.axis.y<0?0:n.axis.y}}}class a{deserialize(e){this.root=e.root;for(let t=0;t<this.root.length;t++)this.root[t]=(new r).deserialize(e.root[t]);return this}}class r{scale=new i(1,1,1);UpdateMatrix(){this.transform.SetTRS(this.position,this.rotation,this.scale)}deserialize(e){return this.name=e.name,this.type=e.type,this.position=e.position,this.rotation=e.rotation,this.scale=e.scale,this.transform=new o(o.identity),this.UpdateMatrix(),this}}class o extends Float32Array{static identity=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);constructor(e){super(e),this.set(o.identity)}SetTRS(e,t,i){this.set(o.identity),this[3]=e.x,this[7]=e.y,this[11]=e.z,this[0]*=i.x,this[5]*=i.y,this[10]*=i.z}}const s=document.getElementById("canvas"),c=s.getContext("webgl2");console.log(c);const d=Math.tan(.5*Math.PI-.5235),u=s.width/s.height,f=new Float32Array([d/u,0,0,0,0,d,0,0,0,0,-1.0008003201280513,-1,0,0,-.020008003201280513,0]);var l=0;const h=new Float32Array([1,0,0,0,0,1,0,l,0,0,1,0,0,0,0,1]);var x=0,m=1;l=-.5;new Float32Array([5,0,0,0,0,5*x,-5*m,l,0,5*m,5*x,0,0,0,0,1]);x=-1,m=0;let v=new Float32Array([x,0,m,0,0,1,0,0,-m,0,x,-5,0,0,0,1]);document.getElementById("fov").addEventListener("input",(function(e){var t=Math.tan(.5*Math.PI-.5*+e.target.value*Math.PI);f[0]=t/u,f[5]=t}));document.getElementById("x").addEventListener("input",(function(e){h[12]=+e.target.value})),document.getElementById("y").addEventListener("input",(function(e){h[13]=+e.target.value})),document.getElementById("z").addEventListener("input",(function(e){h[14]=+e.target.value})),n.Init(window);class y{static time=0;static deltaTime=.01;static lastUpdateTime=0}!async function(){let t=await fetch("../resources/scene.json"),i=await t.json();const r=(new a).deserialize(i);console.log(r),v=r.root.find((e=>"camera"==e.type)).transform;const o=e.Quad();o.Init(c);var d=function(e){var t,i=e.createShader(e.VERTEX_SHADER);e.shaderSource(i,"\n    uniform float u_Time;\n    uniform mat4 u_ObjectToWorld;\n    uniform mat4 u_WorldToView;\n    uniform mat4 u_Projection;\n\n    attribute vec3 a_PositionOS;\n    attribute vec2 a_Texcoord;\n\n    varying vec2 v_Texcoord;\n\n    void main(void) {\n        v_Texcoord = a_Texcoord;\n        vec3 positionWS = (u_ObjectToWorld * vec4(a_PositionOS, 1.0)).xyz;\n        vec3 positionVS = (u_WorldToView * vec4(positionWS, 1.0)).xyz;\n\n        vec4 posiotionCS = u_Projection * vec4(positionVS, 1.0);\n        gl_Position = posiotionCS;\n    }"),e.compileShader(i),(t=e.getShaderInfoLog(i))&&console.log(t);var n=e.createShader(e.FRAGMENT_SHADER);e.shaderSource(n,"\n    precision mediump float;\n    varying mediump vec2 v_Texcoord;\n\n    uniform sampler2D u_MainTex;\n\n    float checkers(in vec2 p)\n    {\n        vec2 s = sign(fract(p*.5)-.5);\n        return .5 - .5*s.x*s.y;\n    }\n\n    void main(void) {\n        float checker = checkers(v_Texcoord.xy * 5.0);\n        gl_FragColor = mix(vec4(.2, .2, .2, 1.0), vec4(.9, .9, .9, 1.0), checker); \n        // Texture2D(u_MainTex, v_Texcoord);\n    }"),e.compileShader(n),(t=e.getShaderInfoLog(n))&&console.log(t);var a=e.createProgram();return e.attachShader(a,i),e.attachShader(a,n),e.linkProgram(a),(t=e.getProgramInfoLog(a))&&console.log(t),a}(c);const u=c.getUniformLocation(d,"u_ObjectToWorld"),l=c.getUniformLocation(d,"u_WorldToView"),h=c.getUniformLocation(d,"u_Projection"),x=c.getUniformLocation(d,"u_Time"),m=(c.getUniformLocation(d,"u_MainTex"),c.getAttribLocation(d,"a_Texcoord")),_=c.getAttribLocation(d,"a_PositionOS");function A(e){!function(e){y.time=e,y.deltaTime=.001*(e-y.lastUpdateTime),y.lastUpdateTime=e}(e),v[12]-=n.axis.x*y.deltaTime,v[14]+=n.axis.y*y.deltaTime,function(){c.disable(c.CULL_FACE),c.enable(c.DEPTH_TEST),c.clearColor(1,1,1,1),c.clear(c.COLOR_BUFFER_BIT),c.useProgram(d),c.uniformMatrix4fv(l,!1,v),c.uniformMatrix4fv(h,!1,f),c.uniform1f(x,y.time/1e3),c.enableVertexAttribArray(_),c.bindBuffer(c.ARRAY_BUFFER,o.vertex_buffer),c.vertexAttribPointer(_,3,c.FLOAT,!1,0,0),c.enableVertexAttribArray(m),c.bindBuffer(c.ARRAY_BUFFER,o.uv_buffer),c.vertexAttribPointer(m,2,c.FLOAT,!1,0,0),c.bindBuffer(c.ELEMENT_ARRAY_BUFFER,o.index_buffer),c.viewport(0,0,s.width,s.height);for(let e=0;e<r.root.length;e++){let t=r.root[e];"test_quad"==t.type&&(t.UpdateMatrix(),c.uniformMatrix4fv(u,!0,t.transform),c.drawElements(c.TRIANGLES,o.indices.length,c.UNSIGNED_SHORT,0))}}()}function T(e){A(e),requestAnimationFrame(b)}function b(e){A(e),requestAnimationFrame(T)}requestAnimationFrame(T)}()})();
//# sourceMappingURL=app.js.map
