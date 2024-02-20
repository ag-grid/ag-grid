/**
 * Normalize the given angle to be in the [0, 2π) interval.
 * @param radians Angle in radians.
 */
export declare function normalizeAngle360(radians: number): number;
export declare function normalizeAngle360Inclusive(radians: number): number;
/**
 * Normalize the given angle to be in the [-π, π) interval.
 * @param radians Angle in radians.
 */
export declare function normalizeAngle180(radians: number): number;
export declare function toRadians(degrees: number): number;
export declare function toDegrees(radians: number): number;
/**
 * Returns a rotation angle between two other angles.
 * @param angle0 Angle in radians.
 * @param angle1 Angle in radians.
 * @returns Angle in radians.
 */
export declare function angleBetween(angle0: number, angle1: number): number;
