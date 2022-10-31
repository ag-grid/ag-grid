"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const rect_1 = require("../scene/shape/rect");
const observable_1 = require("../util/observable");
const validation_1 = require("../util/validation");
class Background extends observable_1.Observable {
    constructor() {
        super(...arguments);
        this.node = new rect_1.Rect();
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
    validation_1.Validate(validation_1.BOOLEAN)
], Background.prototype, "_visible", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_COLOR_STRING)
], Background.prototype, "_fill", void 0);
exports.Background = Background;
