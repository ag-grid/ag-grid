"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const text_1 = require("../../scene/shape/text");
const observable_1 = require("../../util/observable");
class Label extends observable_1.Observable {
    constructor() {
        super();
        this.enabled = true;
        this.fontSize = 8;
        this.fontFamily = 'Verdana, sans-serif';
        this.color = 'rgba(70, 70, 70, 1)';
    }
    getFont() {
        return text_1.getFont(this.fontSize, this.fontFamily, this.fontStyle, this.fontWeight);
    }
}
__decorate([
    observable_1.reactive('change', 'dataChange')
], Label.prototype, "enabled", void 0);
__decorate([
    observable_1.reactive('change')
], Label.prototype, "fontSize", void 0);
__decorate([
    observable_1.reactive('change')
], Label.prototype, "fontFamily", void 0);
__decorate([
    observable_1.reactive('change')
], Label.prototype, "fontStyle", void 0);
__decorate([
    observable_1.reactive('change')
], Label.prototype, "fontWeight", void 0);
__decorate([
    observable_1.reactive('change')
], Label.prototype, "color", void 0);
exports.Label = Label;
