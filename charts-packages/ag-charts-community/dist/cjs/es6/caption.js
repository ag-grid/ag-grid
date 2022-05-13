"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const padding_1 = require("./util/padding");
const text_1 = require("./scene/shape/text");
const node_1 = require("./scene/node");
const observable_1 = require("./util/observable");
class Caption extends observable_1.Observable {
    constructor() {
        super();
        this.node = new text_1.Text();
        this.enabled = false;
        this.padding = new padding_1.Padding(10);
        const node = this.node;
        node.textAlign = 'center';
        node.textBaseline = 'top';
        node.pointerEvents = node_1.PointerEvents.None;
    }
    set text(value) {
        if (this.node.text !== value) {
            this.node.text = value;
            this.fireEvent({ type: 'change' });
        }
    }
    get text() {
        return this.node.text;
    }
    set fontStyle(value) {
        if (this.node.fontStyle !== value) {
            this.node.fontStyle = value;
            this.fireEvent({ type: 'change' });
        }
    }
    get fontStyle() {
        return this.node.fontStyle;
    }
    set fontWeight(value) {
        if (this.node.fontWeight !== value) {
            this.node.fontWeight = value;
            this.fireEvent({ type: 'change' });
        }
    }
    get fontWeight() {
        return this.node.fontWeight;
    }
    set fontSize(value) {
        if (this.node.fontSize !== value) {
            this.node.fontSize = value;
            this.fireEvent({ type: 'change' });
        }
    }
    get fontSize() {
        return this.node.fontSize;
    }
    set fontFamily(value) {
        if (this.node.fontFamily !== value) {
            this.node.fontFamily = value;
            this.fireEvent({ type: 'change' });
        }
    }
    get fontFamily() {
        return this.node.fontFamily;
    }
    set color(value) {
        if (this.node.fill !== value) {
            this.node.fill = value;
            this.fireEvent({ type: 'change' });
        }
    }
    get color() {
        return this.node.fill;
    }
}
__decorate([
    observable_1.reactive('change')
], Caption.prototype, "enabled", void 0);
__decorate([
    observable_1.reactive('change')
], Caption.prototype, "padding", void 0);
exports.Caption = Caption;
//# sourceMappingURL=caption.js.map