"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartesianAxis = void 0;
const axis_1 = require("../../axis");
const validation_1 = require("../../util/validation");
const chartAxisDirection_1 = require("../chartAxisDirection");
const chartOptions_1 = require("../chartOptions");
const cartesianCrossLine_1 = require("../crossline/cartesianCrossLine");
class CartesianAxis extends axis_1.Axis {
    constructor() {
        super(...arguments);
        this.thickness = 0;
        this.position = 'left';
    }
    get direction() {
        return ['top', 'bottom'].includes(this.position) ? chartAxisDirection_1.ChartAxisDirection.X : chartAxisDirection_1.ChartAxisDirection.Y;
    }
    updateDirection() {
        switch (this.position) {
            case 'top':
                this.rotation = -90;
                this.label.mirrored = true;
                this.label.parallel = true;
                break;
            case 'right':
                this.rotation = 0;
                this.label.mirrored = true;
                this.label.parallel = false;
                break;
            case 'bottom':
                this.rotation = -90;
                this.label.mirrored = false;
                this.label.parallel = true;
                break;
            case 'left':
                this.rotation = 0;
                this.label.mirrored = false;
                this.label.parallel = false;
                break;
        }
        if (this.axisContext) {
            this.axisContext.position = this.position;
            this.axisContext.direction = this.direction;
        }
    }
    update(primaryTickCount) {
        this.updateDirection();
        return super.update(primaryTickCount);
    }
    createAxisContext() {
        return Object.assign(Object.assign({}, super.createAxisContext()), { position: this.position });
    }
    assignCrossLineArrayConstructor(crossLines) {
        chartOptions_1.assignJsonApplyConstructedArray(crossLines, cartesianCrossLine_1.CartesianCrossLine);
    }
}
__decorate([
    validation_1.Validate(validation_1.NUMBER(0))
], CartesianAxis.prototype, "thickness", void 0);
__decorate([
    validation_1.Validate(validation_1.POSITION)
], CartesianAxis.prototype, "position", void 0);
exports.CartesianAxis = CartesianAxis;
