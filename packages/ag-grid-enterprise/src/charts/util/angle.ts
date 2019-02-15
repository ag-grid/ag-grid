/**
 * Normalize the given angle to be in the [0, 2π) interval.
 * @param radians Angle in radians.
 */
export function normalizeAngle360(radians: number): number {
    radians %= Math.PI * 2;
    radians += Math.PI * 2;
    radians %= Math.PI * 2;
    return radians;
}

/**
 * Normalize the given angle to be in the [-π, π) interval.
 * @param radians Angle in radians.
 */
export function normalizeAngle180(radians: number): number {
    radians %= Math.PI * 2;
    if (radians < -Math.PI) {
        radians += Math.PI * 2;
    } else if (radians >= Math.PI) {
        radians -= Math.PI * 2;
    }
    return radians;
}

export function toRadians(degrees: number): number {
    return degrees / 180 * Math.PI;
}

export function toDegrees(radians: number): number {
    return radians / Math.PI * 180;
}
