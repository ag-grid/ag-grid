"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const horizontalCrosslineTranslationDirections = {
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
const verticalCrossLineTranslationDirections = {
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
exports.calculateLabelTranslation = ({ yDirection, padding = 0, position, bbox, }) => {
    var _a;
    const crossLineTranslationDirections = yDirection
        ? horizontalCrosslineTranslationDirections
        : verticalCrossLineTranslationDirections;
    const { xTranslationDirection, yTranslationDirection } = (_a = crossLineTranslationDirections[position], (_a !== null && _a !== void 0 ? _a : crossLineTranslationDirections['top']));
    const w = yDirection ? bbox.width : bbox.height;
    const h = yDirection ? bbox.height : bbox.width;
    const xTranslation = xTranslationDirection * (padding + w / 2);
    const yTranslation = yTranslationDirection * (padding + h / 2);
    return {
        xTranslation,
        yTranslation,
    };
};
exports.POSITION_TOP_COORDINATES = ({ yDirection, xEnd, yStart, yEnd }) => {
    if (yDirection) {
        return { x: xEnd / 2, y: yStart };
    }
    else {
        return { x: xEnd, y: !isNaN(yEnd) ? (yStart + yEnd) / 2 : yStart };
    }
};
exports.POSITION_LEFT_COORDINATES = ({ yDirection, xStart, xEnd, yStart, yEnd }) => {
    if (yDirection) {
        return { x: xStart, y: !isNaN(yEnd) ? (yStart + yEnd) / 2 : yStart };
    }
    else {
        return { x: xEnd / 2, y: yStart };
    }
};
exports.POSITION_RIGHT_COORDINATES = ({ yDirection, xEnd, yStart, yEnd }) => {
    if (yDirection) {
        return { x: xEnd, y: !isNaN(yEnd) ? (yStart + yEnd) / 2 : yStart };
    }
    else {
        return { x: xEnd / 2, y: !isNaN(yEnd) ? yEnd : yStart };
    }
};
exports.POSITION_BOTTOM_COORDINATES = ({ yDirection, xStart, xEnd, yStart, yEnd }) => {
    if (yDirection) {
        return { x: xEnd / 2, y: !isNaN(yEnd) ? yEnd : yStart };
    }
    else {
        return { x: xStart, y: !isNaN(yEnd) ? (yStart + yEnd) / 2 : yStart };
    }
};
exports.POSITION_INSIDE_COORDINATES = ({ xEnd, yStart, yEnd }) => {
    return { x: xEnd / 2, y: !isNaN(yEnd) ? (yStart + yEnd) / 2 : yStart };
};
exports.POSITION_TOP_LEFT_COORDINATES = ({ yDirection, xStart, xEnd, yStart }) => {
    if (yDirection) {
        return { x: xStart / 2, y: yStart };
    }
    else {
        return { x: xEnd, y: yStart };
    }
};
exports.POSITION_BOTTOM_LEFT_COORDINATES = ({ yDirection, xStart, yStart, yEnd }) => {
    if (yDirection) {
        return { x: xStart, y: !isNaN(yEnd) ? yEnd : yStart };
    }
    else {
        return { x: xStart, y: yStart };
    }
};
exports.POSITION_TOP_RIGHT_COORDINATES = ({ yDirection, xEnd, yStart, yEnd }) => {
    if (yDirection) {
        return { x: xEnd, y: yStart };
    }
    else {
        return { x: xEnd, y: !isNaN(yEnd) ? yEnd : yStart };
    }
};
exports.POSITION_BOTTOM_RIGHT_COORDINATES = ({ yDirection, xStart, xEnd, yStart, yEnd }) => {
    if (yDirection) {
        return { x: xEnd, y: !isNaN(yEnd) ? yEnd : yStart };
    }
    else {
        return { x: xStart, y: !isNaN(yEnd) ? yEnd : yStart };
    }
};
exports.labeldDirectionHandling = {
    top: { c: exports.POSITION_TOP_COORDINATES },
    bottom: { c: exports.POSITION_BOTTOM_COORDINATES },
    left: { c: exports.POSITION_LEFT_COORDINATES },
    right: { c: exports.POSITION_RIGHT_COORDINATES },
    topLeft: { c: exports.POSITION_TOP_LEFT_COORDINATES },
    topRight: { c: exports.POSITION_TOP_RIGHT_COORDINATES },
    bottomLeft: { c: exports.POSITION_BOTTOM_LEFT_COORDINATES },
    bottomRight: { c: exports.POSITION_BOTTOM_RIGHT_COORDINATES },
    inside: { c: exports.POSITION_INSIDE_COORDINATES },
    insideLeft: { c: exports.POSITION_LEFT_COORDINATES },
    insideRight: { c: exports.POSITION_RIGHT_COORDINATES },
    insideTop: { c: exports.POSITION_TOP_COORDINATES },
    insideBottom: { c: exports.POSITION_BOTTOM_COORDINATES },
    insideTopLeft: { c: exports.POSITION_TOP_LEFT_COORDINATES },
    insideBottomLeft: { c: exports.POSITION_BOTTOM_LEFT_COORDINATES },
    insideTopRight: { c: exports.POSITION_TOP_RIGHT_COORDINATES },
    insideBottomRight: { c: exports.POSITION_BOTTOM_RIGHT_COORDINATES },
};
