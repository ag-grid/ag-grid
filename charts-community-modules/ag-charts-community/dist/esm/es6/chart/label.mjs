var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BOOLEAN, NUMBER, OPT_FONT_STYLE, OPT_FONT_WEIGHT, COLOR_STRING, STRING, Validate } from '../util/validation.mjs';
import { getFont } from '../scene/shape/text.mjs';
import { normalizeAngle360, toRadians } from '../util/angle.mjs';
import { BBox } from '../scene/bbox.mjs';
export class Label {
    constructor() {
        this.enabled = true;
        this.fontSize = 12;
        this.fontFamily = 'Verdana, sans-serif';
        this.fontStyle = undefined;
        this.fontWeight = undefined;
        this.color = 'rgba(70, 70, 70, 1)';
    }
    getFont() {
        return getFont(this);
    }
}
__decorate([
    Validate(BOOLEAN)
], Label.prototype, "enabled", void 0);
__decorate([
    Validate(NUMBER(0))
], Label.prototype, "fontSize", void 0);
__decorate([
    Validate(STRING)
], Label.prototype, "fontFamily", void 0);
__decorate([
    Validate(OPT_FONT_STYLE)
], Label.prototype, "fontStyle", void 0);
__decorate([
    Validate(OPT_FONT_WEIGHT)
], Label.prototype, "fontWeight", void 0);
__decorate([
    Validate(COLOR_STRING)
], Label.prototype, "color", void 0);
export function calculateLabelRotation(opts) {
    const { parallelFlipRotation = 0, regularFlipRotation = 0 } = opts;
    const configuredRotation = opts.rotation ? normalizeAngle360(toRadians(opts.rotation)) : 0;
    const parallelFlipFlag = !configuredRotation && parallelFlipRotation >= 0 && parallelFlipRotation <= Math.PI ? -1 : 1;
    // Flip if the axis rotation angle is in the top hemisphere.
    const regularFlipFlag = !configuredRotation && regularFlipRotation >= 0 && regularFlipRotation <= Math.PI ? -1 : 1;
    let defaultRotation = 0;
    if (opts.parallel) {
        defaultRotation = (parallelFlipFlag * Math.PI) / 2;
    }
    else if (regularFlipFlag === -1) {
        defaultRotation = Math.PI;
    }
    return { configuredRotation, defaultRotation, parallelFlipFlag, regularFlipFlag };
}
export function getLabelSpacing(minSpacing, rotated) {
    if (!isNaN(minSpacing)) {
        return minSpacing;
    }
    return rotated ? 0 : 10;
}
export function getTextBaseline(parallel, labelRotation, sideFlag, parallelFlipFlag) {
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
export function getTextAlign(parallel, labelRotation, labelAutoRotation, sideFlag, regularFlipFlag) {
    const labelRotated = labelRotation > 0 && labelRotation <= Math.PI;
    const labelAutoRotated = labelAutoRotation > 0 && labelAutoRotation <= Math.PI;
    const alignFlag = labelRotated || labelAutoRotated ? -1 : 1;
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
export function calculateLabelBBox(text, bbox, labelX, labelY, labelMatrix) {
    // Text.computeBBox() does not take into account any of the transformations that have been applied to the label nodes, only the width and height are useful.
    // Rather than taking into account all transformations including those of parent nodes which would be the result of `computeTransformedBBox()`, giving the x and y in the entire axis coordinate space,
    // take into account only the rotation and translation applied to individual label nodes to get the x y coordinates of the labels relative to each other
    // this makes label collision detection a lot simpler
    const { width, height } = bbox;
    const translatedBBox = new BBox(labelX, labelY, 0, 0);
    labelMatrix.transformBBox(translatedBBox, bbox);
    const { x = 0, y = 0 } = bbox;
    bbox.width = width;
    bbox.height = height;
    return {
        point: {
            x,
            y,
            size: 0,
        },
        label: {
            width,
            height,
            text,
        },
    };
}
