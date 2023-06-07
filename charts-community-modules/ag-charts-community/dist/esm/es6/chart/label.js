var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BOOLEAN, NUMBER, OPT_FONT_STYLE, OPT_FONT_WEIGHT, COLOR_STRING, STRING, Validate } from '../util/validation';
import { getFont } from '../scene/shape/text';
import { normalizeAngle360, toRadians } from '../util/angle';
import { BBox } from '../scene/bbox';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFiZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY2hhcnQvbGFiZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsY0FBYyxFQUFFLGVBQWUsRUFBRSxZQUFZLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQ3RILE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUU5QyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsU0FBUyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzdELE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFJckMsTUFBTSxPQUFPLEtBQUs7SUFBbEI7UUFFSSxZQUFPLEdBQUcsSUFBSSxDQUFDO1FBR2YsYUFBUSxHQUFHLEVBQUUsQ0FBQztRQUdkLGVBQVUsR0FBRyxxQkFBcUIsQ0FBQztRQUduQyxjQUFTLEdBQWUsU0FBUyxDQUFDO1FBR2xDLGVBQVUsR0FBZ0IsU0FBUyxDQUFDO1FBR3BDLFVBQUssR0FBRyxxQkFBcUIsQ0FBQztJQUtsQyxDQUFDO0lBSEcsT0FBTztRQUNILE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3pCLENBQUM7Q0FDSjtBQXBCRztJQURDLFFBQVEsQ0FBQyxPQUFPLENBQUM7c0NBQ0g7QUFHZjtJQURDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7dUNBQ047QUFHZDtJQURDLFFBQVEsQ0FBQyxNQUFNLENBQUM7eUNBQ2tCO0FBR25DO0lBREMsUUFBUSxDQUFDLGNBQWMsQ0FBQzt3Q0FDUztBQUdsQztJQURDLFFBQVEsQ0FBQyxlQUFlLENBQUM7eUNBQ1U7QUFHcEM7SUFEQyxRQUFRLENBQUMsWUFBWSxDQUFDO29DQUNPO0FBT2xDLE1BQU0sVUFBVSxzQkFBc0IsQ0FBQyxJQUt0QztJQUNHLE1BQU0sRUFB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