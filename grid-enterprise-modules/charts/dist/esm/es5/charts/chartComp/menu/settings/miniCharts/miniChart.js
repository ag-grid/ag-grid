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
import { Autowired, Component, PostConstruct } from "@ag-grid-community/core";
import { _Scene } from "ag-charts-community";
var MiniChart = /** @class */ (function (_super) {
    __extends(MiniChart, _super);
    function MiniChart(container, tooltipName) {
        var _this = _super.call(this) || this;
        _this.size = 58;
        _this.padding = 5;
        _this.root = new _Scene.Group();
        var scene = new _Scene.Scene({ document: window.document, width: _this.size, height: _this.size });
        scene.canvas.element.classList.add('ag-chart-mini-thumbnail-canvas');
        scene.root = _this.root;
        scene.container = container;
        _this.scene = scene;
        _this.tooltipName = tooltipName;
        return _this;
    }
    MiniChart.prototype.init = function () {
        this.scene.canvas.element.title = this.chartTranslationService.translate(this.tooltipName);
        // necessary to force scene graph render as we are not using the standalone factory!
        this.scene.render()
            .catch(function (e) { return console.error("AG Grid - chart update failed", e); });
    };
    __decorate([
        Autowired('chartTranslationService')
    ], MiniChart.prototype, "chartTranslationService", void 0);
    __decorate([
        PostConstruct
    ], MiniChart.prototype, "init", null);
    return MiniChart;
}(Component));
export { MiniChart };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWluaUNoYXJ0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0cy9jaGFydENvbXAvbWVudS9zZXR0aW5ncy9taW5pQ2hhcnRzL21pbmlDaGFydC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUU5RSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFFN0M7SUFBd0MsNkJBQVM7SUFVN0MsbUJBQVksU0FBc0IsRUFBRSxXQUFtQjtRQUF2RCxZQUNJLGlCQUFPLFNBU1Y7UUFma0IsVUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNWLGFBQU8sR0FBRyxDQUFDLENBQUM7UUFDWixVQUFJLEdBQUcsSUFBSSxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7UUFNekMsSUFBTSxLQUFLLEdBQUcsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLEtBQUksQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ25HLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztRQUNyRSxLQUFLLENBQUMsSUFBSSxHQUFHLEtBQUksQ0FBQyxJQUFJLENBQUM7UUFDdkIsS0FBSyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFFNUIsS0FBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsS0FBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7O0lBQ25DLENBQUM7SUFHUyx3QkFBSSxHQUFkO1FBQ0ksSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUUzRixvRkFBb0Y7UUFDcEYsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUU7YUFDZCxLQUFLLENBQUMsVUFBQyxDQUFDLElBQUssT0FBQSxPQUFPLENBQUMsS0FBSyxDQUFDLCtCQUErQixFQUFFLENBQUMsQ0FBQyxFQUFqRCxDQUFpRCxDQUFDLENBQUM7SUFFekUsQ0FBQztJQTVCcUM7UUFBckMsU0FBUyxDQUFDLHlCQUF5QixDQUFDOzhEQUE0RDtJQXFCakc7UUFEQyxhQUFhO3lDQVFiO0lBR0wsZ0JBQUM7Q0FBQSxBQWpDRCxDQUF3QyxTQUFTLEdBaUNoRDtTQWpDcUIsU0FBUyJ9