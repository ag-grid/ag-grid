var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Component, PostConstruct } from "@ag-grid-community/core";
import { _Scene } from "ag-charts-community";
export class MiniChart extends Component {
    constructor(container, tooltipName) {
        super();
        this.size = 58;
        this.padding = 5;
        this.root = new _Scene.Group();
        const scene = new _Scene.Scene({ document: window.document, width: this.size, height: this.size });
        scene.canvas.element.classList.add('ag-chart-mini-thumbnail-canvas');
        scene.root = this.root;
        scene.container = container;
        this.scene = scene;
        this.tooltipName = tooltipName;
    }
    init() {
        this.scene.canvas.element.title = this.chartTranslationService.translate(this.tooltipName);
        // necessary to force scene graph render as we are not using the standalone factory!
        this.scene.render()
            .catch((e) => console.error(`AG Grid - chart update failed`, e));
    }
}
__decorate([
    Autowired('chartTranslationService')
], MiniChart.prototype, "chartTranslationService", void 0);
__decorate([
    PostConstruct
], MiniChart.prototype, "init", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWluaUNoYXJ0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0cy9jaGFydENvbXAvbWVudS9zZXR0aW5ncy9taW5pQ2hhcnRzL21pbmlDaGFydC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUU5RSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFFN0MsTUFBTSxPQUFnQixTQUFVLFNBQVEsU0FBUztJQVU3QyxZQUFZLFNBQXNCLEVBQUUsV0FBbUI7UUFDbkQsS0FBSyxFQUFFLENBQUM7UUFOTyxTQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ1YsWUFBTyxHQUFHLENBQUMsQ0FBQztRQUNaLFNBQUksR0FBRyxJQUFJLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQU16QyxNQUFNLEtBQUssR0FBRyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7UUFDbkcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO1FBQ3JFLEtBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN2QixLQUFLLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUU1QixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztJQUNuQyxDQUFDO0lBR1MsSUFBSTtRQUNWLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7UUFFM0Ysb0ZBQW9GO1FBQ3BGLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFO2FBQ2QsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLCtCQUErQixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFekUsQ0FBQztDQUdKO0FBL0J5QztJQUFyQyxTQUFTLENBQUMseUJBQXlCLENBQUM7MERBQTREO0FBcUJqRztJQURDLGFBQWE7cUNBUWIifQ==