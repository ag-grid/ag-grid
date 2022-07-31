"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const text_1 = require("./scene/shape/text");
const node_1 = require("./scene/node");
const observable_1 = require("./util/observable");
class Caption extends observable_1.Observable {
    constructor() {
        super();
        this.node = new text_1.Text();
        this.enabled = false;
        const node = this.node;
        node.textAlign = 'center';
        node.textBaseline = 'top';
        node.pointerEvents = node_1.PointerEvents.None;
    }
    set text(value) {
        this.node.text = value;
    }
    get text() {
        return this.node.text;
    }
    set fontStyle(value) {
        this.node.fontStyle = value;
    }
    get fontStyle() {
        return this.node.fontStyle;
    }
    set fontWeight(value) {
        this.node.fontWeight = value;
    }
    get fontWeight() {
        return this.node.fontWeight;
    }
    set fontSize(value) {
        this.node.fontSize = value;
    }
    get fontSize() {
        return this.node.fontSize;
    }
    set fontFamily(value) {
        this.node.fontFamily = value;
    }
    get fontFamily() {
        return this.node.fontFamily;
    }
    set color(value) {
        this.node.fill = value;
    }
    get color() {
        return this.node.fill;
    }
}
exports.Caption = Caption;
Caption.PADDING = 10;
