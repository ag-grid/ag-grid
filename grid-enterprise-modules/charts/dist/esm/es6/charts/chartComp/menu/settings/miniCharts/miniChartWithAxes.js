var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PostConstruct } from "@ag-grid-community/core";
import { MiniChart } from "./miniChart";
import { _Scene } from "ag-charts-community";
export class MiniChartWithAxes extends MiniChart {
    constructor(container, tooltipName) {
        super(container, tooltipName);
        this.stroke = 'gray';
        this.axisOvershoot = 3;
    }
    addAxes() {
        const size = this.size;
        const padding = this.padding;
        const leftAxis = new _Scene.Line();
        leftAxis.x1 = padding;
        leftAxis.y1 = padding;
        leftAxis.x2 = padding;
        leftAxis.y2 = size - padding + this.axisOvershoot;
        leftAxis.stroke = this.stroke;
        const bottomAxis = new _Scene.Line();
        bottomAxis.x1 = padding - this.axisOvershoot + 1;
        bottomAxis.y1 = size - padding;
        bottomAxis.x2 = size - padding + 1;
        bottomAxis.y2 = size - padding;
        bottomAxis.stroke = this.stroke;
        const root = this.root;
        root.append(leftAxis);
        root.append(bottomAxis);
    }
}
__decorate([
    PostConstruct
], MiniChartWithAxes.prototype, "addAxes", null);
