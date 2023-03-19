import "taichi.js/dist/taichi.umd";
import {
    getTracers,
    getTracerKernels,
    clampPos,
    getFerosAround,
    getFerosInDirection,
} from "./tracer";
import { getFeros, getFeroKernels } from "./fero";

const SIZE = 950;
const NB_TRACERS = 1_000_000;

let feroDecay = 0.01;
let speed = 1;
let viewDistance = 20;
let viewAngle = Math.PI / 4;
let turnForce = Math.PI / 5;

window.setFeroDecay = (value) => (feroDecay = value);
window.setSpeed = (value) => (speed = value);
window.setViewDistance = (value) => (viewDistance = value);
window.setViewAngle = (value) => (viewAngle = value);
window.setTurnForce = (value) => (turnForce = value);

await ti.init();

const pixels = ti.Vector.field(3, ti.f32, [SIZE, SIZE]);
const feros = getFeros(SIZE);
const feros2 = getFeros(SIZE);
const tracers = getTracers(NB_TRACERS);

window.feros = feros;

ti.addToKernelScope({
    tracers,
    feros,
    feros2,
    pixels,
    SIZE,
    NB_TRACERS,
    clampPos,
    getFerosAround,
    getFerosInDirection,
});

const { initFero, diffuseFero } = getFeroKernels(feros);
const { computeTracers, initTracers } = getTracerKernels(tracers, feros);

const draw = ti.kernel(() => {
    for (let I of ndrange(SIZE, SIZE)) {
        const i = I[0];
        const j = I[1];

        pixels[(i, j)][0] = feros[(i, j)][0];
        pixels[(i, j)][1] = 0;
        pixels[(i, j)][2] = 0;
    }
    for (let I of ndrange(NB_TRACERS)) {
        const i = I[0];

        const x1 = i32(tracers[i][0]);
        const y1 = i32(tracers[i][1]);
        pixels[(x1, y1)][0] = 0;
        pixels[(x1, y1)][1] = 1;
        pixels[(x1, y1)][2] = 0;
    }
});

const htmlCanvas = document.getElementById("result_canvas");
htmlCanvas.width = SIZE;
htmlCanvas.height = SIZE;
const canvas = new ti.Canvas(htmlCanvas);

let frameCount = 0;
async function frame() {
    diffuseFero(feroDecay);
    computeTracers(speed, viewDistance, viewAngle, turnForce);
    draw();
    canvas.setImage(pixels);
    requestAnimationFrame(frame);
    frameCount++;
    if (frameCount % 100 === 0) {
        console.timeEnd();
        console.time();
    }
}
initFero();
initTracers();

console.time();
requestAnimationFrame(frame);
// setInterval(() => requestAnimationFrame(frame), 10);
