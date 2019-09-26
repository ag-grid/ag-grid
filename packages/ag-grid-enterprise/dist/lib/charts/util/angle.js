// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var twoPi = Math.PI * 2;
/**
 * Normalize the given angle to be in the [0, 2π) interval.
 * @param radians Angle in radians.
 */
function normalizeAngle360(radians) {
    radians %= twoPi;
    radians += twoPi;
    radians %= twoPi;
    return radians;
}
exports.normalizeAngle360 = normalizeAngle360;
function normalizeAngle360Inclusive(radians) {
    radians %= twoPi;
    radians += twoPi;
    if (radians !== twoPi) {
        radians %= twoPi;
    }
    return radians;
}
exports.normalizeAngle360Inclusive = normalizeAngle360Inclusive;
/**
 * Normalize the given angle to be in the [-π, π) interval.
 * @param radians Angle in radians.
 */
function normalizeAngle180(radians) {
    radians %= twoPi;
    if (radians < -Math.PI) {
        radians += twoPi;
    }
    else if (radians >= Math.PI) {
        radians -= twoPi;
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
