"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateLabelRotation = exports.Label = void 0;
const validation_1 = require("../util/validation");
const text_1 = require("../scene/shape/text");
const angle_1 = require("../util/angle");
class Label {
    constructor() {
        this.enabled = true;
        this.fontSize = 12;
        this.fontFamily = 'Verdana, sans-serif';
        this.fontStyle = undefined;
        this.fontWeight = undefined;
        this.color = 'rgba(70, 70, 70, 1)';
    }
    getFont() {
        return text_1.getFont(this.fontSize, this.fontFamily, this.fontStyle, this.fontWeight);
    }
}
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
exports.Label = Label;
function calculateLabelRotation(opts) {
    const { parallelFlipRotation = 0, regularFlipRotation = 0 } = opts;
    const labelRotation = opts.rotation ? angle_1.normalizeAngle360(angle_1.toRadians(opts.rotation)) : 0;
    const parallelFlipFlag = !labelRotation && parallelFlipRotation >= 0 && parallelFlipRotation <= Math.PI ? -1 : 1;
    // Flip if the axis rotation angle is in the top hemisphere.
    const regularFlipFlag = !labelRotation && regularFlipRotation >= 0 && regularFlipRotation <= Math.PI ? -1 : 1;
    let autoRotation = 0;
    if (opts.parallel) {
        autoRotation = (parallelFlipFlag * Math.PI) / 2;
    }
    else if (regularFlipFlag === -1) {
        autoRotation = Math.PI;
    }
    return { labelRotation, autoRotation, parallelFlipFlag, regularFlipFlag };
}
exports.calculateLabelRotation = calculateLabelRotation;
