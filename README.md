# GPU-Powered Slime Simulation with Taichi.js

The objective of this project is to replicate a "slime simulation" similar to the one demonstrated in the [coding adventure's video](https://www.youtube.com/watch?v=X-iSQQgOd1A) using [taichi.js](https://github.com/AmesingFlank/taichi.js) for parallelizing computations on the GPU.
This project was meticulously crafted on a GTX 1080ti, but fear not if your GPU boasts different specifications. Adjust the simulation size, the number of tracers, and the update frequency per frame to your hardware.

## Getting Started

Ensure your browser supports [WebGPU](https://developer.chrome.com/docs/web-platform/webgpu/) API. Powered by [taichi.js](https://github.com/AmesingFlank/taichi.js)

## Installation Guide

1. Clone the repository.
2. Run `pnpm run install` to set the stage for your adventure.

## Run

- `pnpm run dev`
- open http://localhost:5173/