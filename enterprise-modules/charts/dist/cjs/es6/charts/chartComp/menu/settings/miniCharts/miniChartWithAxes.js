"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
const miniChart_1 = require("./miniChart");
const ag_charts_community_1 = require("ag-charts-community");
class MiniChartWithAxes extends miniChart_1.MiniChart {
    constructor(container, tooltipName) {
        super(container, tooltipName);
        this.stroke = 'gray';
        this.axisOvershoot = 3;
    }
    addAxes() {
        const size = this.size;
        const padding = this.padding;
        const leftAxis = new ag_charts_community_1.Line();
        leftAxis.x1 = padding;
        leftAxis.y1 = padding;
        leftAxis.x2 = padding;
        leftAxis.y2 = size - padding + this.axisOvershoot;
        leftAxis.stroke = this.stroke;
        const bottomAxis = new ag_charts_community_1.Line();
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
    core_1.PostConstruct
], MiniChartWithAxes.prototype, "addAxes", null);
exports.MiniChartWithAxes = MiniChartWithAxes;
