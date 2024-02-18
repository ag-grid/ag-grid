var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PostConstruct } from '@ag-grid-community/core';
import { MiniChart } from './miniChart.mjs';
import { _Scene } from 'ag-charts-community';
export class MiniChartWithPolarAxes extends MiniChart {
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
        const radiusAxisLine = new _Scene.Line();
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
            const gridLine = new _Scene.Path();
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
    PostConstruct
], MiniChartWithPolarAxes.prototype, "addAxes", null);
