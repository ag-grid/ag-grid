"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateLabelBBox = exports.getTextAlign = exports.getTextBaseline = exports.getLabelSpacing = exports.calculateLabelRotation = exports.Label = void 0;
var validation_1 = require("../util/validation");
var text_1 = require("../scene/shape/text");
var angle_1 = require("../util/angle");
var bbox_1 = require("../scene/bbox");
var Label = /** @class */ (function () {
    function Label() {
        this.enabled = true;
        this.fontSize = 12;
        this.fontFamily = 'Verdana, sans-serif';
        this.fontStyle = undefined;
        this.fontWeight = undefined;
        this.color = 'rgba(70, 70, 70, 1)';
    }
    Label.prototype.getFont = function () {
        return text_1.getFont(this);
    };
    __decorate([
        validation_1.Validate(validation_1.BOOLEAN)
    ], Label.prototype, "enabled", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0))
    ], Label.prototype, "fontSize", void 0);
    __decorate([
        validation_1.Validate(validation_1.STRING)
    ], Label.prototype, "fontFamily", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_FONT_STYLE)
    ], Label.prototype, "fontStyle", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_FONT_WEIGHT)
    ], Label.prototype, "fontWeight", void 0);
    __decorate([
        validation_1.Validate(validation_1.COLOR_STRING)
    ], Label.prototype, "color", void 0);
    return Label;
}());
exports.Label = Label;
function calculateLabelRotation(opts) {
    var _a = opts.parallelFlipRotation, parallelFlipRotation = _a === void 0 ? 0 : _a, _b = opts.regularFlipRotation, regularFlipRotation = _b === void 0 ? 0 : _b;
    var configuredRotation = opts.rotation ? angle_1.normalizeAngle360(angle_1.toRadians(opts.rotation)) : 0;
    var parallelFlipFlag = !configuredRotation && parallelFlipRotation >= 0 && parallelFlipRotation <= Math.PI ? -1 : 1;
    // Flip if the axis rotation angle is in the top hemisphere.
    var regularFlipFlag = !configuredRotation && regularFlipRotation >= 0 && regularFlipRotation <= Math.PI ? -1 : 1;
    var defaultRotation = 0;
    if (opts.parallel) {
        defaultRotation = (parallelFlipFlag * Math.PI) / 2;
    }
    else if (regularFlipFlag === -1) {
        defaultRotation = Math.PI;
    }
    return { configuredRotation: configuredRotation, defaultRotation: defaultRotation, parallelFlipFlag: parallelFlipFlag, regularFlipFlag: regularFlipFlag };
}
exports.calculateLabelRotation = calculateLabelRotation;
function getLabelSpacing(minSpacing, rotated) {
    if (!isNaN(minSpacing)) {
        return minSpacing;
    }
    return rotated ? 0 : 10;
}
exports.getLabelSpacing = getLabelSpacing;
function getTextBaseline(parallel, labelRotation, sideFlag, parallelFlipFlag) {
    if (parallel && !labelRotation) {
        if (sideFlag * parallelFlipFlag === -1) {
            return 'hanging';
        }
        else {
            return 'bottom';
        }
    }
    return 'middle';
}
exports.getTextBaseline = getTextBaseline;
function getTextAlign(parallel, labelRotation, labelAutoRotation, sideFlag, regularFlipFlag) {
    var labelRotated = labelRotation > 0 && labelRotation <= Math.PI;
    var labelAutoRotated = labelAutoRotation > 0 && labelAutoRotation <= Math.PI;
    var alignFlag = labelRotated || labelAutoRotated ? -1 : 1;
    if (parallel) {
        if (labelRotation || labelAutoRotation) {
            if (sideFlag * alignFlag === -1) {
                return 'end';
            }
        }
        else {
            return 'center';
        }
    }
    else if (sideFlag * regularFlipFlag === -1) {
        return 'end';
    }
    return 'start';
}
exports.getTextAlign = getTextAlign;
function calculateLabelBBox(text, bbox, labelX, labelY, labelMatrix) {
    // Text.computeBBox() does not take into account any of the transformations that have been applied to the label nodes, only the width and height are useful.
    // Rather than taking into account all transformations including those of parent nodes which would be the result of `computeTransformedBBox()`, giving the x and y in the entire axis coordinate space,
    // take into account only the rotation and translation applied to individual label nodes to get the x y coordinates of the labels relative to each other
    // this makes label collision detection a lot simpler
    var width = bbox.width, height = bbox.height;
    var translatedBBox = new bbox_1.BBox(labelX, labelY, 0, 0);
    labelMatrix.transformBBox(translatedBBox, bbox);
    var _a = bbox.x, x = _a === void 0 ? 0 : _a, _b = bbox.y, y = _b === void 0 ? 0 : _b;
    bbox.width = width;
    bbox.height = height;
    return {
        point: {
            x: x,
            y: y,
            size: 0,
        },
        label: {
            width: width,
            height: height,
            text: text,
        },
    };
}
exports.calculateLabelBBox = calculateLabelBBox;
//# sourceMappingURL=label.js.map