// ag-grid-enterprise v20.1.0
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Normalize the given angle to be in the [0, 2π) interval.
 * @param radians Angle in radians.
 */
function normalizeAngle360(radians) {
    radians %= Math.PI * 2;
    radians += Math.PI * 2;
    radians %= Math.PI * 2;
    return radians;
}
exports.normalizeAngle360 = normalizeAngle360;
/**
 * Normalize the given angle to be in the [-π, π) interval.
 * @param radians Angle in radians.
 */
function normalizeAngle180(radians) {
    radians %= Math.PI * 2;
    if (radians < -Math.PI) {
        radians += Math.PI * 2;
    }
    else if (radians >= Math.PI) {
        radians -= Math.PI * 2;
    }
    return radians;
}
exports.normalizeAngle180 = normalizeAngle180;
function toRadians(degrees) {
    return degrees / 180 * Math.PI;
}
exports.toRadians = toRadians;
function toDegrees(radians) {
    return radians / Math.PI * 180;
}
exports.toDegrees = toDegrees;
