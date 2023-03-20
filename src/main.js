import "taichi.js/dist/taichi.umd";
import {
    getTracers,
    getTracerKernels,
    clampPos,
    getFerosAround,
    getFerosInDirection,
} from "./tracer";
import { getFeros, getFeroKernels } from "./fero";
import { initSettingsPanel } from "./settings";

const SIZE = 950;
const NB_TRACERS = 6_000_000;

const [
    updatePerFrame,
    feroDecay,
    speed,
    viewDistance,
    viewAngle,
    turnForce,
    showAgent,
] = initSettingsPanel([
    ["updatePerFrame", 20],
    ["feroDecay", 0.01],
    ["speed", 1],
    ["viewDistance", 5],
    ["viewAngle", Math.PI / 4],
    ["turnForce", Math.PI / 4],
    ["showAgent", 1],
]);

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

const drawFero = ti.kernel(() => {
    for (let I of ndrange(SIZE, SIZE)) {
        const i = I[0];
        const j = I[1];

        pixels[(i, j)][0] = feros[(i, j)][0];
        pixels[(i, j)][1] = 0;
        pixels[(i, j)][2] = 0;
    }
});

const drawAgent = ti.kernel(() => {
    for (let I of ndrange(NB_TRACERS)) {
        const i = I[0];

        const x1 = i32(tracers[i][0]);
        const y1 = i32(tracers[i][1]);
        pixels[(x1, y1)][0] = 0;
        pixels[(x1, y1)][1] = 1;
        pixels[(x1, y1)][2] = 0;
    }
});
const drawPixels = () => {
    drawFero();
    if (showAgent.value === 1) drawAgent();
};

const htmlCanvas = document.getElementById("result_canvas");
htmlCanvas.width = SIZE;
htmlCanvas.height = SIZE;
const canvas = new ti.Canvas(htmlCanvas);
const fpsDiv = document.getElementById("fps");
const upsDiv = document.getElementById("ups");

let frameTime = 0;
let fps = 1;
let lastFrameCount = 0;
const updateFPS = () => {
    const frames = frameCount - lastFrameCount;
    fps = (1000 / (Date.now() - frameTime)) * frames;
    lastFrameCount = frameCount;
    fpsDiv.innerText = fps.toFixed(1);
    upsDiv.innerText = (fps * updatePerFrame.value).toFixed(1);
    frameTime = Date.now();
    console.log("updateFPS");
};

let frameCount = 0;
async function frame() {
    for (let i = 0; i < updatePerFrame.value; i++) {
        diffuseFero(feroDecay.value);
        computeTracers(
            speed.value,
            viewDistance.value,
            viewAngle.value,
            turnForce.value
        );
    }
    drawPixels();
    canvas.setImage(pixels);
    frameCount++;
    requestAnimationFrame(frame);
}
initFero();
initTracers();

console.time();
requestAnimationFrame(frame);
setInterval(() => updateFPS(), 500);
