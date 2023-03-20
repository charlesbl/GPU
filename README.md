# Slime simulation on GPU

The goal of this project is to recreate a "slime simulation" like in the [coding adventure's video](https://www.youtube.com/watch?v=X-iSQQgOd1A) using [taichi.js](https://github.com/AmesingFlank/taichi.js) to parallelize calculations on GPU.

Taichi.js uses the WIP [WebGPU](https://developer.chrome.com/docs/web-platform/webgpu/) API, check the documentation to enable it on your browser.

This project was developed on a GTX 1080ti, if your GPU has more or less VRAM you can play with the size of the simulation and the amount of tracers, and if it is less or more powerful you can play with the amount update per frame.

## Installation

- `pnpm run install`

## Run

- `pnpm run dev`
- open http://localhost:5173/