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
const NB_TRACERS = 5_000_000;

const [feroDecay, speed, viewDistance, viewAngle, turnForce] =
    initSettingsPanel([
        ["feroDecay", 0.01],
        ["speed", 1],
        ["viewDistance", 5],
        ["viewAngle", Math.PI / 4],
        ["turnForce", Math.PI / 4],
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
    console.timeEnd("frame");
    console.time("frame");
    for (let i = 0; i < 5; i++) {
        diffuseFero(feroDecay.value);
        computeTracers(
            speed.value,
            viewDistance.value,
            viewAngle.value,
            turnForce.value
        );
    }
    draw();
    canvas.setImage(pixels);
    frameCount++;
    requestAnimationFrame(frame);
}
initFero();
initTracers();

console.time();
requestAnimationFrame(frame);
// setInterval(() => requestAnimationFrame(frame), 10);
