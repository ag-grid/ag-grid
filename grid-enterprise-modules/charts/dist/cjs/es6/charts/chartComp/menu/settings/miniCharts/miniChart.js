"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniChart = void 0;
const core_1 = require("@ag-grid-community/core");
const ag_charts_community_1 = require("ag-charts-community");
class MiniChart extends core_1.Component {
    constructor(container, tooltipName) {
        super();
        this.size = 58;
        this.padding = 5;
        this.root = new ag_charts_community_1._Scene.Group();
        const scene = new ag_charts_community_1._Scene.Scene({ document: window.document, width: this.size, height: this.size });
        scene.canvas.element.classList.add('ag-chart-mini-thumbnail-canvas');
        scene.root = this.root;
        scene.container = container;
        this.scene = scene;
        this.tooltipName = tooltipName;
    }
    init() {
        this.scene.canvas.element.title = this.chartTranslationService.translate(this.tooltipName);
        // necessary to force scene graph render as we are not using the standalone factory!
        this.scene.render();
    }
}
__decorate([
    core_1.Autowired('chartTranslationService')
], MiniChart.prototype, "chartTranslationService", void 0);
__decorate([
    core_1.PostConstruct
], MiniChart.prototype, "init", null);
exports.MiniChart = MiniChart;
