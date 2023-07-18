"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AxisTitle = void 0;
var validation_1 = require("../../util/validation");
var AxisTitle = /** @class */ (function () {
    function AxisTitle() {
        this.enabled = false;
        this.text = undefined;
        this.fontStyle = undefined;
        this.fontWeight = undefined;
        this.fontSize = 10;
        this.fontFamily = 'sans-serif';
        this.color = undefined;
        this.wrapping = 'always';
        this.formatter = undefined;
    }
    __decorate([
        validation_1.Validate(validation_1.BOOLEAN)
    ], AxisTitle.prototype, "enabled", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING)
    ], AxisTitle.prototype, "text", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_FONT_STYLE)
    ], AxisTitle.prototype, "fontStyle", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_FONT_WEIGHT)
    ], AxisTitle.prototype, "fontWeight", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0))
    ], AxisTitle.prototype, "fontSize", void 0);
    __decorate([
        validation_1.Validate(validation_1.STRING)
    ], AxisTitle.prototype, "fontFamily", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_COLOR_STRING)
    ], AxisTitle.prototype, "color", void 0);
    __decorate([
        validation_1.Validate(validation_1.TEXT_WRAP)
    ], AxisTitle.prototype, "wrapping", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_FUNCTION)
    ], AxisTitle.prototype, "formatter", void 0);
    return AxisTitle;
}());
exports.AxisTitle = AxisTitle;
//# sourceMappingURL=axisTitle.js.map