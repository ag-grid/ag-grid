"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const text_1 = require("../scene/shape/text");
class Label {
    constructor() {
        this.enabled = true;
        this.fontSize = 12;
        this.fontFamily = 'Verdana, sans-serif';
        this.fontStyle = undefined;
        this.fontWeight = undefined;
        this.color = 'rgba(70, 70, 70, 1)';
    }
    getFont() {
        return text_1.getFont(this.fontSize, this.fontFamily, this.fontStyle, this.fontWeight);
    }
}
exports.Label = Label;
