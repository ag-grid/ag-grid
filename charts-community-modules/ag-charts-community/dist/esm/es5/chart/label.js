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
        return getFont(this);
    };
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
    return Label;
}());
export { Label };
export function calculateLabelRotation(opts) {
    var _a = opts.parallelFlipRotation, parallelFlipRotation = _a === void 0 ? 0 : _a, _b = opts.regularFlipRotation, regularFlipRotation = _b === void 0 ? 0 : _b;
    var configuredRotation = opts.rotation ? normalizeAngle360(toRadians(opts.rotation)) : 0;
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
export function calculateLabelBBox(text, bbox, labelX, labelY, labelMatrix) {
    // Text.computeBBox() does not take into account any of the transformations that have been applied to the label nodes, only the width and height are useful.
    // Rather than taking into account all transformations including those of parent nodes which would be the result of `computeTransformedBBox()`, giving the x and y in the entire axis coordinate space,
    // take into account only the rotation and translation applied to individual label nodes to get the x y coordinates of the labels relative to each other
    // this makes label collision detection a lot simpler
    var width = bbox.width, height = bbox.height;
    var translatedBBox = new BBox(labelX, labelY, 0, 0);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFiZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY2hhcnQvbGFiZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsY0FBYyxFQUFFLGVBQWUsRUFBRSxZQUFZLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQ3RILE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUU5QyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsU0FBUyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzdELE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFJckM7SUFBQTtRQUVJLFlBQU8sR0FBRyxJQUFJLENBQUM7UUFHZixhQUFRLEdBQUcsRUFBRSxDQUFDO1FBR2QsZUFBVSxHQUFHLHFCQUFxQixDQUFDO1FBR25DLGNBQVMsR0FBZSxTQUFTLENBQUM7UUFHbEMsZUFBVSxHQUFnQixTQUFTLENBQUM7UUFHcEMsVUFBSyxHQUFHLHFCQUFxQixDQUFDO0lBS2xDLENBQUM7SUFIRyx1QkFBTyxHQUFQO1FBQ0ksT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDekIsQ0FBQztJQW5CRDtRQURDLFFBQVEsQ0FBQyxPQUFPLENBQUM7MENBQ0g7SUFHZjtRQURDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7MkNBQ047SUFHZDtRQURDLFFBQVEsQ0FBQyxNQUFNLENBQUM7NkNBQ2tCO0lBR25DO1FBREMsUUFBUSxDQUFDLGNBQWMsQ0FBQzs0Q0FDUztJQUdsQztRQURDLFFBQVEsQ0FBQyxlQUFlLENBQUM7NkNBQ1U7SUFHcEM7UUFEQyxRQUFRLENBQUMsWUFBWSxDQUFDO3dDQUNPO0lBS2xDLFlBQUM7Q0FBQSxBQXRCRCxJQXNCQztTQXRCWSxLQUFLO0FBd0JsQixNQUFNLFVBQVUsc0JBQXNC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