const twoPi = Math.PI * 2;

/**
 * Normalize the given angle to be in the [0, 2π) interval.
 * @param radians Angle in radians.
 */
export function normalizeAngle360(radians: number): number {
    radians %= twoPi;
    radians += twoPi;
    radians %= twoPi;
    return radians;
}

export function normalizeAngle360Inclusive(radians: number): number {
    radians %= twoPi;
    radians += twoPi;
    if (radians !== twoPi) {
        radians %= twoPi;
    }
    return radians;
}

/**
 * Normalize the given angle to be in the [-π, π) interval.
 * @param radians Angle in radians.
 */
export function normalizeAngle180(radians: number): number {
    radians %= twoPi;
    if (radians < -Math.PI) {
        radians += twoPi;
    } else if (radians >= Math.PI) {
        radians -= twoPi;
    }
    return radians;
}

export function toRadians(degrees: number): number {
    return degrees / 180 * Math.PI;
}

export function toDegrees(radians: number): number {
    return radians / Math.PI * 180;
}
