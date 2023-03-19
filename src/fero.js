export const getFeros = (size) => ti.Vector.field(1, ti.f32, [size, size]);

export const getFeroKernels = () => {
    const initFero = ti.kernel(() => {
        for (let I of ndrange(SIZE, SIZE)) {
            const i = I[0];
            const j = I[1];

            feros[(i, j)][0] = 0;
        }
    });

    const diffuseFero = ti.kernel((feroDecay) => {
        for (let I of ndrange(SIZE, SIZE)) {
            const i = I[0];
            const j = I[1];

            const total =
                feros[(clampPos(i - 1), clampPos(j - 1))][0] +
                feros[(clampPos(i - 1), clampPos(j))][0] +
                feros[(clampPos(i - 1), clampPos(j + 1))][0] +
                feros[(clampPos(i), clampPos(j - 1))][0] +
                feros[(clampPos(i), clampPos(j))][0] +
                feros[(clampPos(i), clampPos(j + 1))][0] +
                feros[(clampPos(i + 1), clampPos(j - 1))][0] +
                feros[(clampPos(i + 1), clampPos(j))][0] +
                feros[(clampPos(i + 1), clampPos(j + 1))][0];
            const newValue = total / 9 - feroDecay;
            if (newValue <= 0) {
                feros[(i, j)][0] = 0;
            } else {
                feros[(i, j)][0] = newValue;
            }
        }
    });
    return { initFero, diffuseFero };
};
