"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniChartWithPolarAxes = void 0;
const core_1 = require("@ag-grid-community/core");
const miniChart_1 = require("./miniChart");
const ag_charts_community_1 = require("ag-charts-community");
class MiniChartWithPolarAxes extends miniChart_1.MiniChart {
    constructor(container, tooltipName) {
        super(container, tooltipName);
        this.stroke = 'gray';
        this.showRadiusAxisLine = true;
        this.showAngleAxisLines = true;
    }
    addAxes() {
        const size = this.size;
        const padding = this.padding;
        const combinedPadding = padding * 2;
        const axisLineRadius = (size - combinedPadding) / 2;
        const gridRadii = this.showAngleAxisLines ? [
            axisLineRadius,
            axisLineRadius * 0.8,
            axisLineRadius * 0.6,
            axisLineRadius * 0.4,
        ] : [];
        const radiusAxisLine = new ag_charts_community_1._Scene.Line();
        radiusAxisLine.x1 = size / 2;
        radiusAxisLine.y1 = padding;
        radiusAxisLine.x2 = size / 2;
        radiusAxisLine.y2 = size - padding - axisLineRadius - gridRadii[gridRadii.length - 1];
        radiusAxisLine.stroke = this.stroke;
        radiusAxisLine.strokeOpacity = 0.5;
        radiusAxisLine.fill = undefined;
        radiusAxisLine.visible = this.showRadiusAxisLine;
        const x = padding + axisLineRadius;
        this.gridLines = gridRadii.map((radius, index) => {
            const gridLine = new ag_charts_community_1._Scene.Path();
            gridLine.path.arc(x, x, radius, 0, 2 * Math.PI);
            gridLine.strokeWidth = 1;
            gridLine.stroke = this.stroke;
            gridLine.strokeOpacity = index === 0 ? 0.5 : 0.2;
            gridLine.fill = undefined;
            return gridLine;
        });
        const root = this.root;
        root.append(radiusAxisLine);
        if (this.gridLines.length > 0)
            root.append(this.gridLines);
    }
}
__decorate([
    core_1.PostConstruct
], MiniChartWithPolarAxes.prototype, "addAxes", null);
exports.MiniChartWithPolarAxes = MiniChartWithPolarAxes;
