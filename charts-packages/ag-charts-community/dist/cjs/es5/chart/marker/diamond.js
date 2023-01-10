"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Diamond = void 0;
var marker_1 = require("./marker");
var Diamond = /** @class */ (function (_super) {
    __extends(Diamond, _super);
    function Diamond() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Diamond.prototype.updatePath = function () {
        var s = this.size / 2;
        _super.prototype.applyPath.call(this, s, Diamond.moves);
    };
    Diamond.className = 'Diamond';
    Diamond.moves = [
        { x: 0, y: -1, t: 'move' },
        { x: +1, y: +1 },
        { x: -1, y: +1 },
        { x: -1, y: -1 },
        { x: +1, y: -1 },
    ];
    return Diamond;
}(marker_1.Marker));
exports.Diamond = Diamond;
