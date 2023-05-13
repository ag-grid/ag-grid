"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.labeldDirectionHandling = exports.POSITION_TOP_COORDINATES = exports.calculateLabelTranslation = void 0;
var horizontalCrosslineTranslationDirections = {
    top: { xTranslationDirection: 0, yTranslationDirection: -1 },
    bottom: { xTranslationDirection: 0, yTranslationDirection: 1 },
    left: { xTranslationDirection: -1, yTranslationDirection: 0 },
    right: { xTranslationDirection: 1, yTranslationDirection: 0 },
    topLeft: { xTranslationDirection: 1, yTranslationDirection: -1 },
    topRight: { xTranslationDirection: -1, yTranslationDirection: -1 },
    bottomLeft: { xTranslationDirection: 1, yTranslationDirection: 1 },
    bottomRight: { xTranslationDirection: -1, yTranslationDirection: 1 },
    inside: { xTranslationDirection: 0, yTranslationDirection: 0 },
    insideLeft: { xTranslationDirection: 1, yTranslationDirection: 0 },
    insideRight: { xTranslationDirection: -1, yTranslationDirection: 0 },
    insideTop: { xTranslationDirection: 0, yTranslationDirection: 1 },
    insideBottom: { xTranslationDirection: 0, yTranslationDirection: -1 },
    insideTopLeft: { xTranslationDirection: 1, yTranslationDirection: 1 },
    insideBottomLeft: { xTranslationDirection: 1, yTranslationDirection: -1 },
    insideTopRight: { xTranslationDirection: -1, yTranslationDirection: 1 },
    insideBottomRight: { xTranslationDirection: -1, yTranslationDirection: -1 },
};
var verticalCrossLineTranslationDirections = {
    top: { xTranslationDirection: 1, yTranslationDirection: 0 },
    bottom: { xTranslationDirection: -1, yTranslationDirection: 0 },
    left: { xTranslationDirection: 0, yTranslationDirection: -1 },
    right: { xTranslationDirection: 0, yTranslationDirection: 1 },
    topLeft: { xTranslationDirection: -1, yTranslationDirection: -1 },
    topRight: { xTranslationDirection: -1, yTranslationDirection: 1 },
    bottomLeft: { xTranslationDirection: 1, yTranslationDirection: -1 },
    bottomRight: { xTranslationDirection: 1, yTranslationDirection: 1 },
    inside: { xTranslationDirection: 0, yTranslationDirection: 0 },
    insideLeft: { xTranslationDirection: 0, yTranslationDirection: 1 },
    insideRight: { xTranslationDirection: 0, yTranslationDirection: -1 },
    insideTop: { xTranslationDirection: -1, yTranslationDirection: 0 },
    insideBottom: { xTranslationDirection: 1, yTranslationDirection: 0 },
    insideTopLeft: { xTranslationDirection: -1, yTranslationDirection: 1 },
    insideBottomLeft: { xTranslationDirection: 1, yTranslationDirection: 1 },
    insideTopRight: { xTranslationDirection: -1, yTranslationDirection: -1 },
    insideBottomRight: { xTranslationDirection: 1, yTranslationDirection: -1 },
};
exports.calculateLabelTranslation = function (_a) {
    var _b;
    var yDirection = _a.yDirection, _c = _a.padding, padding = _c === void 0 ? 0 : _c, position = _a.position, bbox = _a.bbox;
    var crossLineTranslationDirections = yDirection
        ? horizontalCrosslineTranslationDirections
        : verticalCrossLineTranslationDirections;
    var _d = (_b = crossLineTranslationDirections[position]) !== null && _b !== void 0 ? _b : crossLineTranslationDirections['top'], xTranslationDirection = _d.xTranslationDirection, yTranslationDirection = _d.yTranslationDirection;
    var w = yDirection ? bbox.width : bbox.height;
    var h = yDirection ? bbox.height : bbox.width;
    var xTranslation = xTranslationDirection * (padding + w / 2);
    var yTranslation = yTranslationDirection * (padding + h / 2);
    return {
        xTranslation: xTranslation,
        yTranslation: yTranslation,
    };
};
exports.POSITION_TOP_COORDINATES = function (_a) {
    var yDirection = _a.yDirection, xEnd = _a.xEnd, yStart = _a.yStart, yEnd = _a.yEnd;
    if (yDirection) {
        return { x: xEnd / 2, y: yStart };
    }
    else {
        return { x: xEnd, y: !isNaN(yEnd) ? (yStart + yEnd) / 2 : yStart };
    }
};
var POSITION_LEFT_COORDINATES = function (_a) {
    var yDirection = _a.yDirection, xStart = _a.xStart, xEnd = _a.xEnd, yStart = _a.yStart, yEnd = _a.yEnd;
    if (yDirection) {
        return { x: xStart, y: !isNaN(yEnd) ? (yStart + yEnd) / 2 : yStart };
    }
    else {
        return { x: xEnd / 2, y: yStart };
    }
};
var POSITION_RIGHT_COORDINATES = function (_a) {
    var yDirection = _a.yDirection, xEnd = _a.xEnd, yStart = _a.yStart, yEnd = _a.yEnd;
    if (yDirection) {
        return { x: xEnd, y: !isNaN(yEnd) ? (yStart + yEnd) / 2 : yStart };
    }
    else {
        return { x: xEnd / 2, y: !isNaN(yEnd) ? yEnd : yStart };
    }
};
var POSITION_BOTTOM_COORDINATES = function (_a) {
    var yDirection = _a.yDirection, xStart = _a.xStart, xEnd = _a.xEnd, yStart = _a.yStart, yEnd = _a.yEnd;
    if (yDirection) {
        return { x: xEnd / 2, y: !isNaN(yEnd) ? yEnd : yStart };
    }
    else {
        return { x: xStart, y: !isNaN(yEnd) ? (yStart + yEnd) / 2 : yStart };
    }
};
var POSITION_INSIDE_COORDINATES = function (_a) {
    var xEnd = _a.xEnd, yStart = _a.yStart, yEnd = _a.yEnd;
    return { x: xEnd / 2, y: !isNaN(yEnd) ? (yStart + yEnd) / 2 : yStart };
};
var POSITION_TOP_LEFT_COORDINATES = function (_a) {
    var yDirection = _a.yDirection, xStart = _a.xStart, xEnd = _a.xEnd, yStart = _a.yStart;
    if (yDirection) {
        return { x: xStart / 2, y: yStart };
    }
    else {
        return { x: xEnd, y: yStart };
    }
};
var POSITION_BOTTOM_LEFT_COORDINATES = function (_a) {
    var yDirection = _a.yDirection, xStart = _a.xStart, yStart = _a.yStart, yEnd = _a.yEnd;
    if (yDirection) {
        return { x: xStart, y: !isNaN(yEnd) ? yEnd : yStart };
    }
    else {
        return { x: xStart, y: yStart };
    }
};
var POSITION_TOP_RIGHT_COORDINATES = function (_a) {
    var yDirection = _a.yDirection, xEnd = _a.xEnd, yStart = _a.yStart, yEnd = _a.yEnd;
    if (yDirection) {
        return { x: xEnd, y: yStart };
    }
    else {
        return { x: xEnd, y: !isNaN(yEnd) ? yEnd : yStart };
    }
};
var POSITION_BOTTOM_RIGHT_COORDINATES = function (_a) {
    var yDirection = _a.yDirection, xStart = _a.xStart, xEnd = _a.xEnd, yStart = _a.yStart, yEnd = _a.yEnd;
    if (yDirection) {
        return { x: xEnd, y: !isNaN(yEnd) ? yEnd : yStart };
    }
    else {
        return { x: xStart, y: !isNaN(yEnd) ? yEnd : yStart };
    }
};
exports.labeldDirectionHandling = {
    top: { c: exports.POSITION_TOP_COORDINATES },
    bottom: { c: POSITION_BOTTOM_COORDINATES },
    left: { c: POSITION_LEFT_COORDINATES },
    right: { c: POSITION_RIGHT_COORDINATES },
    topLeft: { c: POSITION_TOP_LEFT_COORDINATES },
    topRight: { c: POSITION_TOP_RIGHT_COORDINATES },
    bottomLeft: { c: POSITION_BOTTOM_LEFT_COORDINATES },
    bottomRight: { c: POSITION_BOTTOM_RIGHT_COORDINATES },
    inside: { c: POSITION_INSIDE_COORDINATES },
    insideLeft: { c: POSITION_LEFT_COORDINATES },
    insideRight: { c: POSITION_RIGHT_COORDINATES },
    insideTop: { c: exports.POSITION_TOP_COORDINATES },
    insideBottom: { c: POSITION_BOTTOM_COORDINATES },
    insideTopLeft: { c: POSITION_TOP_LEFT_COORDINATES },
    insideBottomLeft: { c: POSITION_BOTTOM_LEFT_COORDINATES },
    insideTopRight: { c: POSITION_TOP_RIGHT_COORDINATES },
    insideBottomRight: { c: POSITION_BOTTOM_RIGHT_COORDINATES },
};
