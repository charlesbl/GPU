export const getFeros = (size) => ti.Vector.field(3, ti.f32, [size, size]);

export const getFeroKernels = () => {
    const initFero = ti.kernel(() => {
        for (let I of ndrange(SIZE, SIZE)) {
            const i = I[0];
            const j = I[1];

            feros[(i, j)][0] = 0;
            feros[(i, j)][1] = 0;
            feros[(i, j)][2] = 0;

            if (
                i > (SIZE / 4) * 3 &&
                j > (SIZE / 4) * 3 &&
                i < (SIZE / 4) * 3 + 50 &&
                j < (SIZE / 4) * 3 + 50
            )
                feros[(i, j)][2] = 1;
            if (
                i > SIZE / 4 &&
                j > SIZE / 4 &&
                i < SIZE / 4 + 50 &&
                j < SIZE / 4 + 50
            )
                feros[(i, j)][2] = -1;
        }
    });

    const diffuseFero = ti.kernel((feroDecay) => {
        for (let I of ndrange(SIZE, SIZE)) {
            const i = I[0];
            const j = I[1];

            const totalIn =
                feros[(clampPos(i - 1), clampPos(j - 1))][0] +
                feros[(clampPos(i - 1), clampPos(j))][0] +
                feros[(clampPos(i - 1), clampPos(j + 1))][0] +
                feros[(clampPos(i), clampPos(j - 1))][0] +
                feros[(clampPos(i), clampPos(j))][0] +
                feros[(clampPos(i), clampPos(j + 1))][0] +
                feros[(clampPos(i + 1), clampPos(j - 1))][0] +
                feros[(clampPos(i + 1), clampPos(j))][0] +
                feros[(clampPos(i + 1), clampPos(j + 1))][0];
            const newValueIn = totalIn / 9 - feroDecay;

            const totalOut =
                feros[(clampPos(i - 1), clampPos(j - 1))][1] +
                feros[(clampPos(i - 1), clampPos(j))][1] +
                feros[(clampPos(i - 1), clampPos(j + 1))][1] +
                feros[(clampPos(i), clampPos(j - 1))][1] +
                feros[(clampPos(i), clampPos(j))][1] +
                feros[(clampPos(i), clampPos(j + 1))][1] +
                feros[(clampPos(i + 1), clampPos(j - 1))][1] +
                feros[(clampPos(i + 1), clampPos(j))][1] +
                feros[(clampPos(i + 1), clampPos(j + 1))][1];
            const newValueOut = totalOut / 9 - feroDecay;

            if (newValueIn <= 0) {
                feros[(i, j)][0] = 0;
            } else {
                feros[(i, j)][0] = newValueIn;
            }

            if (newValueOut <= 0) {
                feros[(i, j)][1] = 0;
            } else {
                feros[(i, j)][1] = newValueOut;
            }
        }
    });
    return { initFero, diffuseFero };
};
