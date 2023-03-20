export const getAnts = (nbAnts) => ti.Vector.field(4, ti.f32, [nbAnts]);

export const clampPos = (value) => {
    let result = value;
    if (value < 0) {
        result = value + SIZE;
    } else if (value >= SIZE) {
        result = value - SIZE;
    }
    return result;
};

export const getFerosAround = (i, j, ferosType) => {
    const selectIn = (-1 + ferosType) / -2;
    const selectOut = (1 + ferosType) / 2;
    return (
        selectIn *
            (feros[(clampPos(i - 1), clampPos(j - 1))][0] +
                feros[(clampPos(i - 1), clampPos(j))][0] +
                feros[(clampPos(i - 1), clampPos(j + 1))][0] +
                feros[(clampPos(i), clampPos(j - 1))][0] +
                feros[(clampPos(i), clampPos(j))][0] +
                feros[(clampPos(i), clampPos(j + 1))][0] +
                feros[(clampPos(i + 1), clampPos(j - 1))][0] +
                feros[(clampPos(i + 1), clampPos(j))][0] +
                feros[(clampPos(i + 1), clampPos(j + 1))][0]) +
        selectOut *
            (feros[(clampPos(i - 1), clampPos(j - 1))][1] +
                feros[(clampPos(i - 1), clampPos(j))][1] +
                feros[(clampPos(i - 1), clampPos(j + 1))][1] +
                feros[(clampPos(i), clampPos(j - 1))][1] +
                feros[(clampPos(i), clampPos(j))][1] +
                feros[(clampPos(i), clampPos(j + 1))][1] +
                feros[(clampPos(i + 1), clampPos(j - 1))][1] +
                feros[(clampPos(i + 1), clampPos(j))][1] +
                feros[(clampPos(i + 1), clampPos(j + 1))][1])
    );
};

export const getFerosInDirection = (x, y, orientation, distance, ferosType) => {
    return getFerosAround(
        i32(x + Math.cos(orientation) * distance),
        i32(y + Math.sin(orientation) * distance),
        ferosType
    );
};

export const getAntKernels = () => {
    const initAnts = ti.kernel(() => {
        for (let I of ndrange(NB_ANTS)) {
            const i = I[0];

            ants[i][0] = SIZE / 2;
            ants[i][1] = SIZE / 2;
            ants[i][2] = Math.random() * Math.PI * 2;
            ants[i][3] = -1;
        }
    });

    const computeAnts = ti.kernel(
        (speed, viewDistance, viewAngle, turnForce) => {
            for (let I of ndrange(NB_ANTS)) {
                const i = I[0];

                const x = ants[i][0];
                const y = ants[i][1];
                let orientation = ants[i][2];
                const state = ants[i][3];

                const leftFeros = getFerosInDirection(
                    x,
                    y,
                    orientation - viewAngle,
                    viewDistance,
                    state
                );
                const frontFeros = getFerosInDirection(
                    x,
                    y,
                    orientation,
                    viewDistance,
                    state
                );
                const rightFeros = getFerosInDirection(
                    x,
                    y,
                    orientation + viewAngle,
                    viewDistance,
                    state
                );

                if (leftFeros > frontFeros && leftFeros > rightFeros) {
                    orientation -= turnForce;
                } else if (rightFeros > frontFeros && rightFeros > leftFeros) {
                    orientation += turnForce;
                }

                orientation += ((Math.random() - 0.5) * Math.PI * 2) / 4;

                const newX = clampPos(x + Math.cos(orientation) * speed);
                const newY = clampPos(y + Math.sin(orientation) * speed);
                ants[i][0] = newX;
                ants[i][1] = newY;

                const addFero = 1;
                if (state === -1) {
                    feros[(i32(newX), i32(newY))][1] = Math.min(
                        feros[(i32(newX), i32(newY))][1] + addFero,
                        1
                    );
                } else {
                    feros[(i32(newX), i32(newY))][0] = Math.min(
                        feros[(i32(newX), i32(newY))][1] + addFero,
                        1
                    );
                }

                if (feros[(i32(newX), i32(newY))][2] > 0) ants[i][3] = 1;
                else if (feros[(i32(newX), i32(newY))][2] < 0) ants[i][3] = -1;
            }
        }
    );

    return { initAnts, computeAnts: computeAnts, clampPos };
};
