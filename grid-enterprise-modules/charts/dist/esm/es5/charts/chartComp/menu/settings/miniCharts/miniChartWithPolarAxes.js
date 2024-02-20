var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
import { PostConstruct } from '@ag-grid-community/core';
import { MiniChart } from './miniChart';
import { _Scene } from 'ag-charts-community';
var MiniChartWithPolarAxes = /** @class */ (function (_super) {
    __extends(MiniChartWithPolarAxes, _super);
    function MiniChartWithPolarAxes(container, tooltipName) {
        var _this = _super.call(this, container, tooltipName) || this;
        _this.stroke = 'gray';
        _this.showRadiusAxisLine = true;
        _this.showAngleAxisLines = true;
        return _this;
    }
    MiniChartWithPolarAxes.prototype.addAxes = function () {
        var _this = this;
        var size = this.size;
        var padding = this.padding;
        var combinedPadding = padding * 2;
        var axisLineRadius = (size - combinedPadding) / 2;
        var gridRadii = this.showAngleAxisLines ? [
            axisLineRadius,
            axisLineRadius * 0.8,
            axisLineRadius * 0.6,
            axisLineRadius * 0.4,
        ] : [];
        var radiusAxisLine = new _Scene.Line();
        radiusAxisLine.x1 = size / 2;
        radiusAxisLine.y1 = padding;
        radiusAxisLine.x2 = size / 2;
        radiusAxisLine.y2 = size - padding - axisLineRadius - gridRadii[gridRadii.length - 1];
        radiusAxisLine.stroke = this.stroke;
        radiusAxisLine.strokeOpacity = 0.5;
        radiusAxisLine.fill = undefined;
        radiusAxisLine.visible = this.showRadiusAxisLine;
        var x = padding + axisLineRadius;
        this.gridLines = gridRadii.map(function (radius, index) {
            var gridLine = new _Scene.Path();
            gridLine.path.arc(x, x, radius, 0, 2 * Math.PI);
            gridLine.strokeWidth = 1;
            gridLine.stroke = _this.stroke;
            gridLine.strokeOpacity = index === 0 ? 0.5 : 0.2;
            gridLine.fill = undefined;
            return gridLine;
        });
        var root = this.root;
        root.append(radiusAxisLine);
        if (this.gridLines.length > 0)
            root.append(this.gridLines);
    };
    __decorate([
        PostConstruct
    ], MiniChartWithPolarAxes.prototype, "addAxes", null);
    return MiniChartWithPolarAxes;
}(MiniChart));
export { MiniChartWithPolarAxes };
