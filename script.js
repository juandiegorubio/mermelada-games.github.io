var canvas = document.createElement("canvas");
var width = canvas.width = window.innerWidth * 0.75;
var height = canvas.height = window.innerHeight * 0.75;
document.body.appendChild(canvas);
var gl = canvas.getContext('webgl');

var mouse = { x: 0, y: 0 };

var numMetaballs = 10;
var metaballs = [];

for (var i = 0; i < numMetaballs; i++) {
    var radius = Math.random() * 120 + 10;
    metaballs.push({
        x: Math.random() * (width - 2 * radius) + radius,
        y: Math.random() * (height - 2 * radius) + radius,
        vx: (Math.random() - 0.5) * 1,
        vy: (Math.random() - 0.5) * 1,
        r: radius * 0.75
    });
}

var vertexShaderSrc = `
attribute vec2 position;

void main() {
// position specifies only x and y.
// We set z to be 0.0, and w to be 1.0
gl_Position = vec4(position, 0.0, 1.0);
}
`;

var fragmentShaderSrc = `
precision highp float;

const float WIDTH = ` + (width >> 0) + `.0;
const float HEIGHT = ` + (height >> 0) + `.0;

uniform vec3 metaballs[` + numMetaballs + `];

void main(){
float x = gl_FragCoord.x;
float y = gl_FragCoord.y;

float sum = 0.0;
for (int i = 0; i < ` + numMetaballs + `; i++) {
vec3 metaball = metaballs[i];
float dx = metaball.x - x;
float dy = metaball.y - y;
float radius = metaball.z;

sum += (radius * radius) / (dx * dx + dy * dy);
}

if (sum >= 0.99) {
    // Color base rosado
    vec3 baseColor = vec3(0.7137254901960784, 0, 0); // rosado claro

    // Color del borde rojo
    vec3 borderColor = vec3(0.6588235294117647, 0.0, 0.0); // rojo

    // Calculamos el factor de mezcla basado en la distancia desde el borde
    float borderFactor = max(0.0, 1.0 - (sum - 0.99) * 100.0);

    // Mezclamos los colores base y del borde
    vec3 finalColor = mix(baseColor, borderColor, borderFactor);

    // Establecemos el color final
    gl_FragColor = vec4(finalColor, 1.0);
    return;
}

gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
}

`;

var vertexShader = compileShader(vertexShaderSrc, gl.VERTEX_SHADER);
var fragmentShader = compileShader(fragmentShaderSrc, gl.FRAGMENT_SHADER);

var program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

var vertexData = new Float32Array([
    -1.0, 1.0, // top left
    -1.0, -1.0, // bottom left
    1.0, 1.0, // top right
    1.0, -1.0, // bottom right
]);
var vertexDataBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexDataBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);

var positionHandle = getAttribLocation(program, 'position');
gl.enableVertexAttribArray(positionHandle);
gl.vertexAttribPointer(positionHandle,
    2, // position is a vec2
    gl.FLOAT, // each component is a float
    gl.FALSE, // don't normalize values
    2 * 4, // two 4 byte float components per vertex
    0 // offset into each span of vertex data
);

var metaballsHandle = getUniformLocation(program, 'metaballs');

loop();
function loop() {
    for (var i = 0; i < numMetaballs; i++) {
        var metaball = metaballs[i];
        metaball.x += metaball.vx;
        metaball.y += metaball.vy;

        if (metaball.x < metaball.r || metaball.x > width - metaball.r) metaball.vx *= -1;
        if (metaball.y < metaball.r || metaball.y > height - metaball.r) metaball.vy *= -1;
    }

    var dataToSendToGPU = new Float32Array(3 * numMetaballs);
    for (var i = 0; i < numMetaballs; i++) {
        var baseIndex = 3 * i;
        var mb = metaballs[i];
        dataToSendToGPU[baseIndex + 0] = mb.x;
        dataToSendToGPU[baseIndex + 1] = mb.y;
        dataToSendToGPU[baseIndex + 2] = mb.r;
    }
    gl.uniform3fv(metaballsHandle, dataToSendToGPU);

    //Draw
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    requestAnimationFrame(loop);
}

function compileShader(shaderSource, shaderType) {
    var shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw "Shader compile failed with: " + gl.getShaderInfoLog(shader);
    }

    return shader;
}

function getUniformLocation(program, name) {
    var uniformLocation = gl.getUniformLocation(program, name);
    if (uniformLocation === -1) {
        throw 'Can not find uniform ' + name + '.';
    }
    return uniformLocation;
}

function getAttribLocation(program, name) {
    var attributeLocation = gl.getAttribLocation(program, name);
    if (attributeLocation === -1) {
        throw 'Can not find attribute ' + name + '.';
    }
    return attributeLocation;
}

canvas.onmousemove = function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
}








var canvas, ctx;
var vertexes = [];
var diffPt = []; var autoDiff = 1000;
var verNum = 250;
var canvasW = window.innerWidth + 40;
var addListener = function (e, str, func) {
    if (e.addEventListener) {
        e.addEventListener(str, func, false);
    } else if (e.attachEvent) {
        e.attachEvent("on" + str, func);
    } else {

    }
};

addListener(window, "load", init);

function resize() {
    canvasW = document.getElementById('container').offsetWidth + 40; initCanvas(canvasW, window.innerHeight - 900);
    var cW = canvas.width;
    var cH = canvas.height;
    for (var i = 0; i < verNum; i++)
        vertexes[i] = new Vertex(cW / (verNum - 1) * i, cH / 2, cH / 2);
    initDiffPt();
    var win_3 = window.innerWidth / 3;

}
function init() {
    resize();
    var FPS = 30;
    var interval = 1000 / FPS >> 0;
    var timer = setInterval(update, interval);
    if (window.addEventListener) addListener(window, "DOMMouseScroll", wheelHandler);
    addListener(window, "mousewheel", wheelHandler);
    addListener(window, "resize", resize);

    canvas.onmousedown = function (e) {
        //div.innerHTML=e.clientX+":"+e.clientY;
        //var mx = document.getElementById("mx");

        //alert(1);
        var mouseX, mouseY;
        if (e) {
            mouseX = e.pageX;
            mouseY = e.pageY;
        } else {
            mouseX = event.x + document.body.scrollLeft;
            mouseY = event.y + document.body.scrollTop;
        }


        if (window.innerHeight / 2 - mouseY < 50 && window.innerHeight / 2 - mouseY > -50)
        //diffPt[150] = autoDiff;
        {
            autoDiff = 1000;
            if (mouseX < canvas.width - 2) {
                xx = 1 + Math.floor((verNum - 2) * mouseX / canvas.width);

                diffPt[xx] = autoDiff;
            }

        }
    }
    
}

var wheelHandler = function (e) {
    var s = (e.detail) ? -e.detail : e.wheelDelta;
    s > 0 ? (dd > 15 ? dd-- : dd = dd) : (dd < 50 ? dd++ : dd = dd);
};

function initDiffPt() {
    for (var i = 0; i < verNum; i++)
        diffPt[i] = 0;
}
var xx = 150;
var dd = 15;

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    autoDiff -= autoDiff * 0.9;
    diffPt[xx] = autoDiff;

    for (var i = xx - 1; i > 0; i--) {
        var d = xx - i;
        if (d > dd) d = dd;
        diffPt[i] -= (diffPt[i] - diffPt[i + 1]) * (1 - 0.01 * d);
    }
    
    for (var i = xx + 1; i < verNum; i++) {
        var d = i - xx;
        if (d > dd) d = dd;
        diffPt[i] -= (diffPt[i] - diffPt[i - 1]) * (1 - 0.01 * d);
    }

    for (var i = 0; i < vertexes.length; i++) {
        vertexes[i].updateY(diffPt[i]);
    }

    draw();

}

var color1 = "#B6020E";
var color2 = "#A8000D";
function draw() {
    ctx.beginPath();
    ctx.moveTo(0, window.innerHeight);
    ctx.fillStyle = color1;
    ctx.lineTo(vertexes[0].x, vertexes[0].y);
    for (var i = 1; i < vertexes.length; i++) {
        ctx.lineTo(vertexes[i].x, vertexes[i].y);
    }
    ctx.lineTo(canvas.width, window.innerHeight);
    ctx.lineTo(0, window.innerHeight);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, window.innerHeight);
    ctx.fillStyle = color2;
    ctx.lineTo(vertexes[0].x + 15, vertexes[0].y + 5);
    for (var i = 1; i < vertexes.length; i++) {
        ctx.lineTo(vertexes[i].x + 15, vertexes[i].y + 5);
    }
    ctx.lineTo(canvas.width, window.innerHeight);
    ctx.lineTo(0, window.innerHeight);
    ctx.fill();
}
function initCanvas(width, height) {
    canvas = document.getElementById("canvas");
    canvas.width = width;
    canvas.height = height;
    ctx = canvas.getContext("2d");
}

function Vertex(x, y, baseY) {
    this.baseY = baseY;
    this.x = x;
    this.y = y;
    this.vy = 0;
    this.targetY = 0;
    this.friction = 0.15;
    this.deceleration = 0.95;
}

Vertex.prototype.updateY = function (diffVal) {
    this.targetY = diffVal + this.baseY;
    this.vy += this.targetY - this.y
    this.y += this.vy * this.friction;
    this.vy *= this.deceleration;
}
