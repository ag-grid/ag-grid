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
import { _, Autowired, Component, PostConstruct, RefSelector } from "@ag-grid-community/core";
import { PaddingPanel } from "./paddingPanel";
import { BackgroundPanel } from "./backgroundPanel";
import TitlePanel from "./titlePanel";
var ChartPanel = /** @class */ (function (_super) {
    __extends(ChartPanel, _super);
    function ChartPanel(_a) {
        var chartController = _a.chartController, chartOptionsService = _a.chartOptionsService, _b = _a.isExpandedOnInit, isExpandedOnInit = _b === void 0 ? false : _b;
        var _this = _super.call(this) || this;
        _this.activePanels = [];
        _this.chartController = chartController;
        _this.chartOptionsService = chartOptionsService;
        _this.isExpandedOnInit = isExpandedOnInit;
        return _this;
    }
    ChartPanel.prototype.init = function () {
        var groupParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical'
        };
        this.setTemplate(ChartPanel.TEMPLATE, { chartGroup: groupParams });
        this.initGroup();
        this.initTitles();
        this.initPaddingPanel();
        this.initBackgroundPanel();
    };
    ChartPanel.prototype.initGroup = function () {
        this.chartGroup
            .setTitle(this.chartTranslationService.translate('chart'))
            .toggleGroupExpand(this.isExpandedOnInit)
            .hideEnabledCheckbox(true);
    };
    ChartPanel.prototype.initTitles = function () {
        var titlePanelComp = this.createBean(new TitlePanel(this.chartOptionsService));
        this.chartGroup.addItem(titlePanelComp);
        this.activePanels.push(titlePanelComp);
    };
    ChartPanel.prototype.initPaddingPanel = function () {
        var paddingPanelComp = this.createBean(new PaddingPanel(this.chartOptionsService, this.chartController));
        this.chartGroup.addItem(paddingPanelComp);
        this.activePanels.push(paddingPanelComp);
    };
    ChartPanel.prototype.initBackgroundPanel = function () {
        var backgroundPanelComp = this.createBean(new BackgroundPanel(this.chartOptionsService));
        this.chartGroup.addItem(backgroundPanelComp);
        this.activePanels.push(backgroundPanelComp);
    };
    ChartPanel.prototype.destroyActivePanels = function () {
        var _this = this;
        this.activePanels.forEach(function (panel) {
            _.removeFromParent(panel.getGui());
            _this.destroyBean(panel);
        });
    };
    ChartPanel.prototype.destroy = function () {
        this.destroyActivePanels();
        _super.prototype.destroy.call(this);
    };
    ChartPanel.TEMPLATE = "<div>\n            <ag-group-component ref=\"chartGroup\"></ag-group-component>\n        </div>";
    __decorate([
        RefSelector('chartGroup')
    ], ChartPanel.prototype, "chartGroup", void 0);
    __decorate([
        Autowired('chartTranslationService')
    ], ChartPanel.prototype, "chartTranslationService", void 0);
    __decorate([
        PostConstruct
    ], ChartPanel.prototype, "init", null);
    return ChartPanel;
}(Component));
export { ChartPanel };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcnRQYW5lbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydHMvY2hhcnRDb21wL21lbnUvZm9ybWF0L2NoYXJ0L2NoYXJ0UGFuZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUNILENBQUMsRUFHRCxTQUFTLEVBQ1QsU0FBUyxFQUNULGFBQWEsRUFDYixXQUFXLEVBQ2QsTUFBTSx5QkFBeUIsQ0FBQztBQUNqQyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFOUMsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ3BELE9BQU8sVUFBVSxNQUFNLGNBQWMsQ0FBQztBQUt0QztJQUFnQyw4QkFBUztJQWlCckMsb0JBQVksRUFJUztZQUhqQixlQUFlLHFCQUFBLEVBQ2YsbUJBQW1CLHlCQUFBLEVBQ25CLHdCQUF3QixFQUF4QixnQkFBZ0IsbUJBQUcsS0FBSyxLQUFBO1FBSDVCLFlBS0ksaUJBQU8sU0FLVjtRQVpPLGtCQUFZLEdBQWdCLEVBQUUsQ0FBQztRQVNuQyxLQUFJLENBQUMsZUFBZSxHQUFHLGVBQWUsQ0FBQztRQUN2QyxLQUFJLENBQUMsbUJBQW1CLEdBQUcsbUJBQW1CLENBQUM7UUFDL0MsS0FBSSxDQUFDLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDOztJQUM3QyxDQUFDO0lBR08seUJBQUksR0FBWjtRQUNJLElBQU0sV0FBVyxHQUEyQjtZQUN4QyxhQUFhLEVBQUUseUJBQXlCO1lBQ3hDLFNBQVMsRUFBRSxVQUFVO1NBQ3hCLENBQUM7UUFDRixJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQztRQUVuRSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDakIsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0lBQy9CLENBQUM7SUFFTyw4QkFBUyxHQUFqQjtRQUNJLElBQUksQ0FBQyxVQUFVO2FBQ1YsUUFBUSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDekQsaUJBQWlCLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDO2FBQ3hDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFFTywrQkFBVSxHQUFsQjtRQUNJLElBQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQztRQUVqRixJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUN4QyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBRU8scUNBQWdCLEdBQXhCO1FBQ0ksSUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztRQUMzRyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQzFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVPLHdDQUFtQixHQUEzQjtRQUNJLElBQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLGVBQWUsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO1FBQzNGLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDN0MsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBRU8sd0NBQW1CLEdBQTNCO1FBQUEsaUJBS0M7UUFKRyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxVQUFBLEtBQUs7WUFDM0IsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1lBQ25DLEtBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDNUIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRVMsNEJBQU8sR0FBakI7UUFDSSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUMzQixpQkFBTSxPQUFPLFdBQUUsQ0FBQztJQUNwQixDQUFDO0lBN0VhLG1CQUFRLEdBQ2xCLGlHQUVPLENBQUM7SUFFZTtRQUExQixXQUFXLENBQUMsWUFBWSxDQUFDO2tEQUFzQztJQUUxQjtRQUFyQyxTQUFTLENBQUMseUJBQXlCLENBQUM7K0RBQTBEO0lBcUIvRjtRQURDLGFBQWE7MENBWWI7SUF1Q0wsaUJBQUM7Q0FBQSxBQWhGRCxDQUFnQyxTQUFTLEdBZ0Z4QztTQWhGWSxVQUFVIn0=