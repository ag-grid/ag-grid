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
exports.MiniPie = void 0;
var miniDoughnut_1 = require("./miniDoughnut");
var MiniPie = /** @class */ (function (_super) {
    __extends(MiniPie, _super);
    function MiniPie(container, fills, strokes) {
        return _super.call(this, container, fills, strokes, 0, "pieTooltip") || this;
    }
    MiniPie.chartType = 'pie';
    return MiniPie;
}(miniDoughnut_1.MiniDoughnut));
exports.MiniPie = MiniPie;
