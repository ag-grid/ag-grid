// ag-grid-enterprise v20.2.0
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var offset_1 = require("./offset");
exports.Offset = offset_1.Offset;
var DropShadow = /** @class */ (function () {
    function DropShadow(color, offset, blur) {
        this.color = color;
        this.offset = offset;
        this.blur = blur;
        Object.freeze(this);
    }
    return DropShadow;
}());
exports.DropShadow = DropShadow;
