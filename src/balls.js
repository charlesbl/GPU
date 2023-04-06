export const getBalls = (nbTracers) => ti.Vector.field(4, ti.f32, [nbTracers]);

export const clampPos = (value) => {
    let result = value;
    if (value < 0) {
        result = value + SIZE;
    } else if (value >= SIZE) {
        result = value - SIZE;
    }
    return result;
};
export const getBallsKernels = () => {
    const initBalls = ti.kernel(() => {
        for (let I of ndrange(NB_BALLS)) {
            const i = I[0];

            const orientation = Math.random() * Math.PI * 2;
            balls[i][0] =
                (Math.cos(orientation) * SIZE * (Math.random() / 2 + 0.5)) / 3 +
                SIZE / 2;
            balls[i][1] =
                (Math.sin(orientation) * SIZE * (Math.random() / 2 + 0.5)) / 3 +
                SIZE / 2;
            balls[i][2] =
                Math.cos(orientation + Math.PI / 2) * (2 + Math.random());
            balls[i][3] =
                Math.sin(orientation + Math.PI / 2) * (2 + Math.random());
        }
    });

    const computeBalls = ti.kernel(() => {
        for (let I of ndrange(NB_BALLS)) {
            const i = I[0];

            let x = balls[i][0];
            let y = balls[i][1];
            let speedX = balls[i][2];
            let speedY = balls[i][3];

            let accelX = 0.0;
            let accelY = 0.0;
            for (let J of ndrange(NB_BALLS)) {
                const j = J[0];
                let ballx = balls[j][0];
                let bally = balls[j][1];

                const smooth = 100000;
                const distanceX = ballx - x;
                const distanceY = bally - y;
                if (distanceX > 0) {
                    accelX += 1 / (Math.pow(distanceX, 2) + smooth);
                } else if (distanceX < 0) {
                    accelX -= 1 / (Math.pow(distanceX, 2) + smooth);
                }
                if (distanceY > 0) {
                    accelY += 1 / (Math.pow(distanceY, 2) + smooth);
                } else if (distanceY < 0) {
                    accelY -= 1 / (Math.pow(distanceY, 2) + smooth);
                }
            }

            speedX += accelX;
            speedY += accelY;
            x += speedX;
            y += speedY;

            balls[i][0] = x;
            balls[i][1] = y;
            balls[i][2] = speedX;
            balls[i][3] = speedY;
        }
    });

    return { initBalls, computeBalls };
};
