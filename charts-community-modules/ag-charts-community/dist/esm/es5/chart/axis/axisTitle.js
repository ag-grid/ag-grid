var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Validate, BOOLEAN, NUMBER, OPT_FONT_STYLE, OPT_FONT_WEIGHT, STRING, OPT_COLOR_STRING, OPT_STRING, TEXT_WRAP, OPT_FUNCTION, } from '../../util/validation';
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
        Validate(BOOLEAN)
    ], AxisTitle.prototype, "enabled", void 0);
    __decorate([
        Validate(OPT_STRING)
    ], AxisTitle.prototype, "text", void 0);
    __decorate([
        Validate(OPT_FONT_STYLE)
    ], AxisTitle.prototype, "fontStyle", void 0);
    __decorate([
        Validate(OPT_FONT_WEIGHT)
    ], AxisTitle.prototype, "fontWeight", void 0);
    __decorate([
        Validate(NUMBER(0))
    ], AxisTitle.prototype, "fontSize", void 0);
    __decorate([
        Validate(STRING)
    ], AxisTitle.prototype, "fontFamily", void 0);
    __decorate([
        Validate(OPT_COLOR_STRING)
    ], AxisTitle.prototype, "color", void 0);
    __decorate([
        Validate(TEXT_WRAP)
    ], AxisTitle.prototype, "wrapping", void 0);
    __decorate([
        Validate(OPT_FUNCTION)
    ], AxisTitle.prototype, "formatter", void 0);
    return AxisTitle;
}());
export { AxisTitle };
