import "taichi.js/dist/taichi.umd";
import { getBalls, getBallsKernels, clampPos } from "./balls";
import { initSettingsPanel } from "./settings";

const SIZE = 950;
const NB_BALLS = 100000;

const [updatePerFrame] = initSettingsPanel([["updatePerFrame", 1]]);

await ti.init();

const pixels = ti.Vector.field(3, ti.f32, [SIZE, SIZE]);
const balls = getBalls(NB_BALLS);

ti.addToKernelScope({
    balls,
    pixels,
    SIZE,
    NB_BALLS,
    clampPos,
});

const { computeBalls, initBalls } = getBallsKernels();

const drawBalls = ti.kernel(() => {
    for (let I of ndrange(SIZE, SIZE)) {
        const i = I[0];
        const j = I[1];
        pixels[(i, j)][0] = 0;
        pixels[(i, j)][1] = 0;
        pixels[(i, j)][2] = 0;
    }
    for (let I of ndrange(NB_BALLS)) {
        const i = I[0];

        const x1 = i32(balls[i][0]);
        const y1 = i32(balls[i][1]);
        if (!(x1 < 0 || x1 >= SIZE || y1 < 0 || y1 >= SIZE)) {
            pixels[(x1, y1)][0] = 0;
            pixels[(x1, y1)][1] = 1;
            pixels[(x1, y1)][2] = 0;
        }
    }
});

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
};

let frameCount = 0;
let framesSkip = 0;
async function frame() {
    if (updatePerFrame.value < 1 && framesSkip < 1) {
        framesSkip += updatePerFrame.value;
    } else {
        for (let i = 0; i < updatePerFrame.value; i++) {
            computeBalls();
            framesSkip = 0;
        }
    }
    drawBalls();
    canvas.setImage(pixels);
    frameCount++;
    requestAnimationFrame(frame);
}
initBalls();

console.time();
requestAnimationFrame(frame);
setInterval(() => updateFPS(), 500);
