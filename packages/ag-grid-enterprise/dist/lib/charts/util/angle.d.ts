// ag-grid-enterprise v21.2.2
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
