"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AxisLabel = void 0;
var text_1 = require("../../scene/shape/text");
var validation_1 = require("../../util/validation");
var default_1 = require("../../util/default");
var AxisLabel = /** @class */ (function () {
    function AxisLabel() {
        this.enabled = true;
        /** If set to `false`, axis labels will not be wrapped on multiple lines. */
        this.autoWrap = false;
        /** Used to constrain the width of the label when `autoWrap` is `true`, if the label text width exceeds the `maxWidth`, it will be wrapped on multiple lines automatically. If `maxWidth` is omitted, a default width constraint will be applied. */
        this.maxWidth = undefined;
        /** Used to constrain the height of the multiline label, if the label text height exceeds the `maxHeight`, it will be truncated automatically. If `maxHeight` is omitted, a default height constraint will be applied. */
        this.maxHeight = undefined;
        this.fontStyle = undefined;
        this.fontWeight = undefined;
        this.fontSize = 12;
        this.fontFamily = 'Verdana, sans-serif';
        /**
         * The padding between the labels and the ticks.
         */
        this.padding = 5;
        /**
         * Minimum gap in pixels between the axis labels before being removed to avoid collisions.
         */
        this.minSpacing = NaN;
        /**
         * The color of the labels.
         * Use `undefined` rather than `rgba(0, 0, 0, 0)` to make labels invisible.
         */
        this.color = 'rgba(87, 87, 87, 1)';
        /**
         * Custom label rotation in degrees.
         * Labels are rendered perpendicular to the axis line by default.
         * Or parallel to the axis line, if the {@link parallel} is set to `true`.
         * The value of this config is used as the angular offset/deflection
         * from the default rotation.
         */
        this.rotation = undefined;
        /**
         * If specified and axis labels may collide, they are rotated to reduce collisions. If the
         * `rotation` property is specified, it takes precedence.
         */
        this.autoRotate = undefined;
        /**
         * Rotation angle to use when autoRotate is applied.
         */
        this.autoRotateAngle = 335;
        /**
         * Avoid axis label collision by automatically reducing the number of ticks displayed. If set to `false`, axis labels may collide.
         */
        this.avoidCollisions = true;
        /**
         * By default labels and ticks are positioned to the left of the axis line.
         * `true` positions the labels to the right of the axis line.
         * However, if the axis is rotated, it's easier to think in terms
         * of this side or the opposite side, rather than left and right.
         * We use the term `mirror` for conciseness, although it's not
         * true mirroring - for example, when a label is rotated, so that
         * it is inclined at the 45 degree angle, text flowing from north-west
         * to south-east, ending at the tick to the left of the axis line,
         * and then we set this config to `true`, the text will still be flowing
         * from north-west to south-east, _starting_ at the tick to the right
         * of the axis line.
         */
        this.mirrored = false;
        /**
         * Labels are rendered perpendicular to the axis line by default.
         * Setting this config to `true` makes labels render parallel to the axis line
         * and center aligns labels' text at the ticks.
         */
        this.parallel = false;
        /**
         * In case {@param value} is a number, the {@param fractionDigits} parameter will
         * be provided as well. The `fractionDigits` corresponds to the number of fraction
         * digits used by the tick step. For example, if the tick step is `0.0005`,
         * the `fractionDigits` is 4.
         */
        this.formatter = undefined;
        this.format = undefined;
    }
    /**
     * The side of the axis line to position the labels on.
     * -1 = left (default)
     * 1 = right
     */
    AxisLabel.prototype.getSideFlag = function () {
        return this.mirrored ? 1 : -1;
    };
    AxisLabel.prototype.getFont = function () {
        return text_1.getFont(this);
    };
    __decorate([
        validation_1.Validate(validation_1.BOOLEAN)
    ], AxisLabel.prototype, "enabled", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_BOOLEAN)
    ], AxisLabel.prototype, "autoWrap", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_NUMBER(0))
    ], AxisLabel.prototype, "maxWidth", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_NUMBER(0))
    ], AxisLabel.prototype, "maxHeight", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_FONT_STYLE)
    ], AxisLabel.prototype, "fontStyle", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_FONT_WEIGHT)
    ], AxisLabel.prototype, "fontWeight", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(1))
    ], AxisLabel.prototype, "fontSize", void 0);
    __decorate([
        validation_1.Validate(validation_1.STRING)
    ], AxisLabel.prototype, "fontFamily", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0))
    ], AxisLabel.prototype, "padding", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER_OR_NAN()),
        default_1.Default(NaN)
    ], AxisLabel.prototype, "minSpacing", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_COLOR_STRING)
    ], AxisLabel.prototype, "color", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_NUMBER(-360, 360))
    ], AxisLabel.prototype, "rotation", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_BOOLEAN)
    ], AxisLabel.prototype, "autoRotate", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(-360, 360))
    ], AxisLabel.prototype, "autoRotateAngle", void 0);
    __decorate([
        validation_1.Validate(validation_1.BOOLEAN)
    ], AxisLabel.prototype, "avoidCollisions", void 0);
    __decorate([
        validation_1.Validate(validation_1.BOOLEAN)
    ], AxisLabel.prototype, "mirrored", void 0);
    __decorate([
        validation_1.Validate(validation_1.BOOLEAN)
    ], AxisLabel.prototype, "parallel", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING)
    ], AxisLabel.prototype, "format", void 0);
    return AxisLabel;
}());
exports.AxisLabel = AxisLabel;
//# sourceMappingURL=axisLabel.js.map