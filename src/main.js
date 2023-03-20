import "taichi.js/dist/taichi.umd";
import {
    getAnts,
    getAntKernels,
    clampPos,
    getFerosAround,
    getFerosInDirection,
} from "./ants";
import { getFeros, getFeroKernels } from "./fero";
import { initSettingsPanel } from "./settings";

const SIZE = 950;
const NB_ANTS = 1_000;

const [
    updatePerFrame,
    feroDecay,
    speed,
    viewDistance,
    viewAngle,
    turnForce,
    showAgent,
] = initSettingsPanel([
    ["updatePerFrame", 1],
    ["feroDecay", 0.0001],
    ["speed", 1],
    ["viewDistance", 5],
    ["viewAngle", Math.PI / 4],
    ["turnForce", Math.PI / 4],
    ["showAgent", 1],
]);

await ti.init();

const pixels = ti.Vector.field(3, ti.f32, [SIZE, SIZE]);
const feros = getFeros(SIZE);
const ants = getAnts(NB_ANTS);

window.feros = feros;

ti.addToKernelScope({
    ants,
    feros,
    pixels,
    SIZE,
    NB_ANTS,
    clampPos,
    getFerosAround,
    getFerosInDirection,
});

const { initFero, diffuseFero } = getFeroKernels();
const { computeAnts, initAnts } = getAntKernels();

const drawFero = ti.kernel(() => {
    for (let I of ndrange(SIZE, SIZE)) {
        const i = I[0];
        const j = I[1];

        if (feros[(i, j)][2] > 0) {
            pixels[(i, j)][0] = 1;
            pixels[(i, j)][1] = 1;
            pixels[(i, j)][2] = 0;
        } else if (feros[(i, j)][2] < 0) {
            pixels[(i, j)][0] = 1;
            pixels[(i, j)][1] = 0;
            pixels[(i, j)][2] = 1;
        } else {
            pixels[(i, j)][0] = feros[(i, j)][0];
            pixels[(i, j)][1] = feros[(i, j)][1];
            pixels[(i, j)][2] = 0;
        }
    }
});

const drawAnts = ti.kernel(() => {
    for (let I of ndrange(NB_ANTS)) {
        const i = I[0];

        const x1 = i32(ants[i][0]);
        const y1 = i32(ants[i][1]);
        pixels[(x1, y1)][0] = 1;
        pixels[(x1, y1)][1] = 1;
        pixels[(x1, y1)][2] = 1;
    }
});

const drawPixels = () => {
    drawFero();
    if (showAgent.value === 1) drawAnts();
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
        computeAnts(
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
initAnts();

console.time();
requestAnimationFrame(frame);
setInterval(() => updateFPS(), 500);
