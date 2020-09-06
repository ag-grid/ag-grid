var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PostConstruct } from "@ag-grid-community/core";
import { MiniChart } from "./miniChart";
import { Line } from "ag-charts-community";
var MiniChartWithAxes = /** @class */ (function (_super) {
    __extends(MiniChartWithAxes, _super);
    function MiniChartWithAxes(container, tooltipName) {
        var _this = _super.call(this, container, tooltipName) || this;
        _this.stroke = 'gray';
        _this.axisOvershoot = 3;
        return _this;
    }
    MiniChartWithAxes.prototype.addAxes = function () {
        var size = this.size;
        var padding = this.padding;
        var leftAxis = new Line();
        leftAxis.x1 = padding;
        leftAxis.y1 = padding;
        leftAxis.x2 = padding;
        leftAxis.y2 = size - padding + this.axisOvershoot;
        leftAxis.stroke = this.stroke;
        var bottomAxis = new Line();
        bottomAxis.x1 = padding - this.axisOvershoot + 1;
        bottomAxis.y1 = size - padding;
        bottomAxis.x2 = size - padding + 1;
        bottomAxis.y2 = size - padding;
        bottomAxis.stroke = this.stroke;
        var root = this.root;
        root.append(leftAxis);
        root.append(bottomAxis);
    };
    __decorate([
        PostConstruct
    ], MiniChartWithAxes.prototype, "addAxes", null);
    return MiniChartWithAxes;
}(MiniChart));
export { MiniChartWithAxes };
