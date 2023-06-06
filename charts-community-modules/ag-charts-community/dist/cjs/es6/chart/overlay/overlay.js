"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Overlay = void 0;
const validation_1 = require("../../util/validation");
class Overlay {
    constructor(className, parent) {
        this.renderer = undefined;
        this.text = undefined;
        this.className = className;
        this.parentElement = parent;
    }
    show(rect) {
        var _a, _b;
        let element = this.element;
        if (!this.element) {
            element = document.createElement('div');
            element.className = this.className;
            this.element = element;
        }
        element.style.position = 'absolute';
        element.style.left = `${rect.x}px`;
        element.style.top = `${rect.y}px`;
        element.style.width = `${rect.width}px`;
        element.style.height = `${rect.height}px`;
        if (this.renderer) {
            this.element.innerHTML = this.renderer();
        }
        else {
            const content = document.createElement('div');
            content.style.alignItems = 'center';
            content.style.boxSizing = 'border-box';
            content.style.display = 'flex';
            content.style.justifyContent = 'center';
            content.style.margin = '8px';
            content.style.height = '100%';
            content.style.font = '12px Verdana, sans-serif';
            content.innerText = (_a = this.text) !== null && _a !== void 0 ? _a : 'No data to display';
            element.append(content);
        }
        (_b = this.parentElement) === null || _b === void 0 ? void 0 : _b.append(element);
    }
    hide() {
        var _a;
        (_a = this.element) === null || _a === void 0 ? void 0 : _a.remove();
        this.element = undefined;
    }
}
__decorate([
    validation_1.Validate(validation_1.OPT_FUNCTION)
], Overlay.prototype, "renderer", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_STRING)
], Overlay.prototype, "text", void 0);
exports.Overlay = Overlay;
