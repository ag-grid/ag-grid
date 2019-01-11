/**
 * Normalize the given angle to [0, 2π) interval.
 * @param angle Angle in radians.
 */
export function normalizeAngle(angle: number): number {
    angle %= Math.PI * 2;
    angle += Math.PI * 2;
    angle %= Math.PI * 2;
    return angle;
}

/**
 * Normalize the given angle to [-π, π) interval.
 * @param angle Angle in radians.
 */
export function normalizeAngle180(angle: number): number {
    angle %= Math.PI * 2;
    if (angle < -Math.PI) {
        angle += Math.PI * 2;
    } else if (angle >= Math.PI) {
        angle -= Math.PI * 2;
    }
    return angle;
}
