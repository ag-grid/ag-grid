"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.boxCollidesSector = exports.isPointInSector = void 0;
var intersection_1 = require("../scene/intersection");
function isPointInSector(x, y, sector) {
    var radius = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    var innerRadius = sector.innerRadius, outerRadius = sector.outerRadius;
    if (radius < Math.min(innerRadius, outerRadius) || radius > Math.max(innerRadius, outerRadius)) {
        return false;
    }
    // Start and End angles are expected to be [-90, 270]
    // while Math.atan2 returns [-180, 180]
    var angle = Math.atan2(y, x);
    if (angle < -Math.PI / 2) {
        angle += 2 * Math.PI;
    }
    // Start is actually bigger than End clock-wise
    var startAngle = sector.startAngle, endAngle = sector.endAngle;
    if (endAngle === -Math.PI / 2) {
        return angle < startAngle;
    }
    if (startAngle === (3 * Math.PI) / 2) {
        return angle > endAngle;
    }
    return angle <= endAngle && angle >= startAngle;
}
exports.isPointInSector = isPointInSector;
function lineCollidesSector(line, sector) {
    var startAngle = sector.startAngle, endAngle = sector.endAngle, innerRadius = sector.innerRadius, outerRadius = sector.outerRadius;
    var outerStart = { x: outerRadius * Math.cos(startAngle), y: outerRadius * Math.sin(startAngle) };
    var outerEnd = { x: outerRadius * Math.cos(endAngle), y: outerRadius * Math.sin(endAngle) };
    var innerStart = innerRadius === 0
        ? { x: 0, y: 0 }
        : { x: innerRadius * Math.cos(startAngle), y: innerRadius * Math.sin(startAngle) };
    var innerEnd = innerRadius === 0
        ? { x: 0, y: 0 }
        : { x: innerRadius * Math.cos(endAngle), y: innerRadius * Math.sin(endAngle) };
    return (intersection_1.segmentIntersection(line.start.x, line.start.y, line.end.x, line.end.y, outerStart.x, outerStart.y, innerStart.x, innerStart.y) != null ||
        intersection_1.segmentIntersection(line.start.x, line.start.y, line.end.x, line.end.y, outerEnd.x, outerEnd.y, innerEnd.x, innerEnd.y) != null ||
        intersection_1.arcIntersections(0, 0, outerRadius, startAngle, endAngle, true, line.start.x, line.start.y, line.end.x, line.end.y).length > 0);
}
function boxCollidesSector(box, sector) {
    var topLeft = { x: box.x, y: box.y };
    var topRight = { x: box.x + box.width, y: box.y };
    var bottomLeft = { x: box.x, y: box.y + box.height };
    var bottomRight = { x: box.x + box.width, y: box.y + box.height };
    return (lineCollidesSector({ start: topLeft, end: topRight }, sector) ||
        lineCollidesSector({ start: bottomLeft, end: bottomRight }, sector));
}
exports.boxCollidesSector = boxCollidesSector;
//# sourceMappingURL=sector.js.map