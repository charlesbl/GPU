export const getTracers = (nbTracers) =>
    ti.Vector.field(3, ti.f32, [nbTracers]);

export const clampPos = (value) => {
    let result = value;
    if (value < 0) {
        result = value + SIZE;
    } else if (value >= SIZE) {
        result = value - SIZE;
    }
    return result;
};

export const getFerosAround = (feros, i, j) => {
    return (
        feros[(clampPos(i - 1), clampPos(j - 1))][0] +
        feros[(clampPos(i - 1), clampPos(j))][0] +
        feros[(clampPos(i - 1), clampPos(j + 1))][0] +
        feros[(clampPos(i), clampPos(j - 1))][0] +
        feros[(clampPos(i), clampPos(j))][0] +
        feros[(clampPos(i), clampPos(j + 1))][0] +
        feros[(clampPos(i + 1), clampPos(j - 1))][0] +
        feros[(clampPos(i + 1), clampPos(j))][0] +
        feros[(clampPos(i + 1), clampPos(j + 1))][0]
    );
};

export const getFerosInDirection = (feros, x, y, orientation, distance) => {
    return getFerosAround(
        feros,
        i32(x + Math.cos(orientation) * distance),
        i32(y + Math.sin(orientation) * distance)
    );
};

export const getTracerKernels = () => {
    const initTracers = ti.kernel(() => {
        for (let I of ndrange(NB_TRACERS)) {
            const i = I[0];

            tracers[i][0] = Math.random() * SIZE;
            tracers[i][1] = Math.random() * SIZE;
            tracers[i][2] = Math.random() * Math.PI * 2;
        }
    });

    const computeTracers = ti.kernel(
        (speed, viewDistance, viewAngle, turnForce) => {
            for (let I of ndrange(NB_TRACERS)) {
                const i = I[0];

                const x = tracers[i][0];
                const y = tracers[i][1];
                let orientation = tracers[i][2];

                const leftFeros = getFerosInDirection(
                    feros,
                    x,
                    y,
                    orientation - viewAngle,
                    viewDistance
                );
                const frontFeros = getFerosInDirection(
                    feros,
                    x,
                    y,
                    orientation,
                    viewDistance
                );
                const rightFeros = getFerosInDirection(
                    feros,
                    x,
                    y,
                    orientation + viewAngle,
                    viewDistance
                );

                if (leftFeros > frontFeros && leftFeros > rightFeros) {
                    orientation -= turnForce;
                } else if (rightFeros > frontFeros && rightFeros > leftFeros) {
                    orientation += turnForce;
                }
                // TODO add randomness
                // orientation += ((Math.random() - 0.5) * Math.PI) / 10;

                const newX = clampPos(x + Math.cos(orientation) * speed);
                const newY = clampPos(y + Math.sin(orientation) * speed);
                tracers[i][0] = newX;
                tracers[i][1] = newY;

                feros[(i32(newX), i32(newY))][0] = 1;
            }
        }
    );

    return { initTracers, computeTracers, clampPos };
};
