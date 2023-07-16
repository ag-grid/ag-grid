var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Axis } from '../../axis.mjs';
import { Validate, NUMBER, POSITION } from '../../util/validation.mjs';
import { ChartAxisDirection } from '../chartAxisDirection.mjs';
import { assignJsonApplyConstructedArray } from '../chartOptions.mjs';
import { CartesianCrossLine } from '../crossline/cartesianCrossLine.mjs';
export class CartesianAxis extends Axis {
    constructor() {
        super(...arguments);
        this.thickness = 0;
        this.position = 'left';
    }
    get direction() {
        return ['top', 'bottom'].includes(this.position) ? ChartAxisDirection.X : ChartAxisDirection.Y;
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
        assignJsonApplyConstructedArray(crossLines, CartesianCrossLine);
    }
}
__decorate([
    Validate(NUMBER(0))
], CartesianAxis.prototype, "thickness", void 0);
__decorate([
    Validate(POSITION)
], CartesianAxis.prototype, "position", void 0);
