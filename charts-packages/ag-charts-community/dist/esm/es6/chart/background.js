var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Rect } from '../scene/shape/rect';
import { Observable } from '../util/observable';
import { BOOLEAN, OPT_COLOR_STRING, Validate } from '../util/validation';
export class Background extends Observable {
    constructor() {
        super(...arguments);
        this.node = new Rect();
        this._visible = true;
    }
    set width(value) {
        this.node.width = value;
    }
    get width() {
        return this.node.width;
    }
    set height(value) {
        this.node.height = value;
    }
    get height() {
        return this.node.height;
    }
    set visible(value) {
        this._visible = value;
        this.node.visible = this._visible;
    }
    get visible() {
        return this._visible;
    }
    set fill(value) {
        this._fill = value;
        this.node.fill = this._fill;
    }
    get fill() {
        return this._fill;
    }
}
__decorate([
    Validate(BOOLEAN)
], Background.prototype, "_visible", void 0);
__decorate([
    Validate(OPT_COLOR_STRING)
], Background.prototype, "_fill", void 0);
