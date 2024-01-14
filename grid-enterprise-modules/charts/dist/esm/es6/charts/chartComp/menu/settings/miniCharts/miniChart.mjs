var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Component, PostConstruct } from "@ag-grid-community/core";
import { _Scene } from "ag-charts-community";
// import { _Scene } from "ag-charts-enterprise";
const CANVAS_CLASS = 'ag-chart-mini-thumbnail-canvas';
const ERROR_MESSAGE = 'AG Grid - chart update failed';
export class MiniChart extends Component {
    constructor(container, tooltipName) {
        super();
        this.size = 58;
        this.padding = 5;
        this.root = new _Scene.Group();
        const scene = new _Scene.Scene({
            window: window,
            document: window.document,
            width: this.size,
            height: this.size
        });
        scene.canvas.element.classList.add(CANVAS_CLASS);
        scene.root = this.root;
        scene.container = container;
        this.scene = scene;
        this.tooltipName = tooltipName;
    }
    init() {
        this.scene.canvas.element.title = this.chartTranslationService.translate(this.tooltipName);
        // Necessary to force scene graph render as we are not using the standalone factory.
        this.scene.render()
            .catch((e) => {
            console.error(`${ERROR_MESSAGE}`, e);
        });
    }
}
__decorate([
    Autowired('chartTranslationService')
], MiniChart.prototype, "chartTranslationService", void 0);
__decorate([
    PostConstruct
], MiniChart.prototype, "init", null);
