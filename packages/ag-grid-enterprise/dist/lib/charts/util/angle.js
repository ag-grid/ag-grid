// ag-grid-enterprise v20.0.0
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Normalize the given angle to [0, 2π) interval.
 * @param angle Angle in radians.
 */
function normalizeAngle(angle) {
    angle %= Math.PI * 2;
    angle += Math.PI * 2;
    angle %= Math.PI * 2;
    return angle;
}
exports.normalizeAngle = normalizeAngle;
/**
 * Normalize the given angle to [-π, π) interval.
 * @param angle Angle in radians.
 */
function normalizeAngle180(angle) {
    angle %= Math.PI * 2;
    if (angle < -Math.PI) {
        angle += Math.PI * 2;
    }
    else if (angle >= Math.PI) {
        angle -= Math.PI * 2;
    }
    return angle;
}
exports.normalizeAngle180 = normalizeAngle180;
