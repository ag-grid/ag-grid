// @ts-ignore Suppress tsc error: Property 'sign' does not exist on type 'Math'
const sign: (x: number) => number = Math.sign ? Math.sign : x => {
    x = +x;

    if (x === 0 || isNaN(x)) {
        return x;
    }

    return x > 0 ? 1 : -1;
};

/**
 * Finds the roots of a parametric linear equation in `t`,
 * where `t` lies in the interval of `[0,1]`.
 */
export function linearRoot(a: number, b: number): number[] {
    const t = -b / a;
    return (a !== 0 && t >= 0 && t <= 1) ? [t] : [];
}

/**
 * Finds the roots of a parametric quadratic equation in `t`,
 * where `t` lies in the interval of `[0,1]`.
 */
export function quadraticRoots(a: number, b: number, c: number): number[] {
    if (a === 0) {
        return linearRoot(b, c);
    }

    const D = b * b - 4 * a * c; // The polynomial's discriminant.

    const roots: number[] = [];

    if (D === 0) { // A single real root.
        const t = -b / (2 * a);
        if (t >= 0 && t <= 1) {
            roots.push(t);
        }
    } else if (D > 0) { // A pair of distinct real roots.
        const rD = Math.sqrt(D);
        const t1 = (-b - rD) / (2 * a);
        const t2 = (-b + rD) / (2 * a);

        if (t1 >= 0 && t1 <= 1) {
            roots.push(t1);
        }
        if (t2 >= 0 && t2 <= 1) {
            roots.push(t2);
        }
    }
    // else -> Complex roots.

    return roots;
}

/**
 * Finds the roots of a parametric cubic equation in `t`,
 * where `t` lies in the interval of `[0,1]`.
 * Returns an array of parametric intersection locations along the cubic,
 * excluding out-of-bounds intersections (before or after the end point
 * or in the imaginary plane).
 * An adaptation of http://www.particleincell.com/blog/2013/cubic-line-intersection/
 */
export function cubicRoots(a: number, b: number, c: number, d: number): number[] {
    if (a === 0) {
        return quadraticRoots(b, c, d);
    }

    const A = b / a;
    const B = c / a;
    const C = d / a;

    const Q = (3 * B - A * A) / 9;
    const R = (9 * A * B - 27 * C - 2 * A * A * A) / 54;
    const D = Q * Q * Q + R * R; // The polynomial's discriminant.
    const third = 1 / 3;
    const roots: number[] = [];

    if (D >= 0) { // Complex or duplicate roots.
        const rD = Math.sqrt(D);
        const S = sign(R + rD) * Math.pow(Math.abs(R + rD), third);
        const T = sign(R - rD) * Math.pow(Math.abs(R - rD), third);
        const Im = Math.abs(Math.sqrt(3) * (S - T) / 2); // Complex part of the root pair.

        const t = -third * A + (S + T); // A real root.
        if (t >= 0 && t <= 1) {
            roots.push(t);
        }

        if (Im === 0) {
            const t = -third * A - (S + T) / 2; // The real part of a complex root.
            if (t >= 0 && t <= 1) {
                roots.push(t);
            }
        }
    } else { // Distinct real roots.
        const theta = Math.acos(R / Math.sqrt(-Q * Q * Q));

        const thirdA = third * A;
        const twoSqrtQ = 2 * Math.sqrt(-Q);
        const t1 = twoSqrtQ * Math.cos(third * theta) - thirdA;
        const t2 = twoSqrtQ * Math.cos(third * (theta + 2 * Math.PI)) - thirdA;
        const t3 = twoSqrtQ * Math.cos(third * (theta + 4 * Math.PI)) - thirdA;

        if (t1 >= 0 && t1 <= 1) {
            roots.push(t1);
        }
        if (t2 >= 0 && t2 <= 1) {
            roots.push(t2);
        }
        if (t3 >= 0 && t3 <= 1) {
            roots.push(t3);
        }
    }

    return roots;
}
