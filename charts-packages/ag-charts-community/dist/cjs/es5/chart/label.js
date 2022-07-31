"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var text_1 = require("../scene/shape/text");
var Label = /** @class */ (function () {
    function Label() {
        this.enabled = true;
        this.fontSize = 12;
        this.fontFamily = 'Verdana, sans-serif';
        this.fontStyle = undefined;
        this.fontWeight = undefined;
        this.color = 'rgba(70, 70, 70, 1)';
    }
    Label.prototype.getFont = function () {
        return text_1.getFont(this.fontSize, this.fontFamily, this.fontStyle, this.fontWeight);
    };
    return Label;
}());
exports.Label = Label;
