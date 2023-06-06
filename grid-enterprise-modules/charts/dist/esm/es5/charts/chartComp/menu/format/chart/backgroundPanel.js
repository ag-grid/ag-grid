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
import { Autowired, Component, PostConstruct, RefSelector } from "@ag-grid-community/core";
var BackgroundPanel = /** @class */ (function (_super) {
    __extends(BackgroundPanel, _super);
    function BackgroundPanel(chartOptionsService) {
        var _this = _super.call(this) || this;
        _this.chartOptionsService = chartOptionsService;
        return _this;
    }
    BackgroundPanel.prototype.init = function () {
        var groupParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            suppressOpenCloseIcons: true
        };
        this.setTemplate(BackgroundPanel.TEMPLATE, { chartBackgroundGroup: groupParams });
        this.initGroup();
        this.initColorPicker();
    };
    BackgroundPanel.prototype.initGroup = function () {
        var _this = this;
        this.group
            .setTitle(this.chartTranslationService.translate('background'))
            .setEnabled(this.chartOptionsService.getChartOption('background.visible'))
            .hideOpenCloseIcons(true)
            .hideEnabledCheckbox(false)
            .onEnableChange(function (enabled) { return _this.chartOptionsService.setChartOption('background.visible', enabled); });
    };
    BackgroundPanel.prototype.initColorPicker = function () {
        var _this = this;
        this.colorPicker
            .setLabel(this.chartTranslationService.translate('color'))
            .setLabelWidth('flex')
            .setInputWidth(45)
            .setValue(this.chartOptionsService.getChartOption('background.fill'))
            .onValueChange(function (newColor) { return _this.chartOptionsService.setChartOption('background.fill', newColor); });
    };
    BackgroundPanel.TEMPLATE = "<div>\n            <ag-group-component ref=\"chartBackgroundGroup\">\n                <ag-color-picker ref=\"colorPicker\"></ag-color-picker>\n            </ag-group-component>\n        <div>";
    __decorate([
        RefSelector('chartBackgroundGroup')
    ], BackgroundPanel.prototype, "group", void 0);
    __decorate([
        RefSelector('colorPicker')
    ], BackgroundPanel.prototype, "colorPicker", void 0);
    __decorate([
        Autowired('chartTranslationService')
    ], BackgroundPanel.prototype, "chartTranslationService", void 0);
    __decorate([
        PostConstruct
    ], BackgroundPanel.prototype, "init", null);
    return BackgroundPanel;
}(Component));
export { BackgroundPanel };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2dyb3VuZFBhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0cy9jaGFydENvbXAvbWVudS9mb3JtYXQvY2hhcnQvYmFja2dyb3VuZFBhbmVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFHSCxTQUFTLEVBQ1QsU0FBUyxFQUNULGFBQWEsRUFDYixXQUFXLEVBQ2QsTUFBTSx5QkFBeUIsQ0FBQztBQUtqQztJQUFxQyxtQ0FBUztJQWExQyx5QkFBNkIsbUJBQXdDO1FBQXJFLFlBQ0ksaUJBQU8sU0FDVjtRQUY0Qix5QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCOztJQUVyRSxDQUFDO0lBR08sOEJBQUksR0FBWjtRQUNJLElBQU0sV0FBVyxHQUEyQjtZQUN4QyxhQUFhLEVBQUUseUJBQXlCO1lBQ3hDLFNBQVMsRUFBRSxVQUFVO1lBQ3JCLHNCQUFzQixFQUFFLElBQUk7U0FDL0IsQ0FBQztRQUNGLElBQUksQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxFQUFDLG9CQUFvQixFQUFFLFdBQVcsRUFBQyxDQUFDLENBQUM7UUFFaEYsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztJQUMzQixDQUFDO0lBRU8sbUNBQVMsR0FBakI7UUFBQSxpQkFPQztRQU5HLElBQUksQ0FBQyxLQUFLO2FBQ0wsUUFBUSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7YUFDOUQsVUFBVSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxjQUFjLENBQUMsb0JBQW9CLENBQUMsQ0FBQzthQUN6RSxrQkFBa0IsQ0FBQyxJQUFJLENBQUM7YUFDeEIsbUJBQW1CLENBQUMsS0FBSyxDQUFDO2FBQzFCLGNBQWMsQ0FBQyxVQUFBLE9BQU8sSUFBSSxPQUFBLEtBQUksQ0FBQyxtQkFBbUIsQ0FBQyxjQUFjLENBQUMsb0JBQW9CLEVBQUUsT0FBTyxDQUFDLEVBQXRFLENBQXNFLENBQUMsQ0FBQztJQUMzRyxDQUFDO0lBRU8seUNBQWUsR0FBdkI7UUFBQSxpQkFPQztRQU5HLElBQUksQ0FBQyxXQUFXO2FBQ1gsUUFBUSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDekQsYUFBYSxDQUFDLE1BQU0sQ0FBQzthQUNyQixhQUFhLENBQUMsRUFBRSxDQUFDO2FBQ2pCLFFBQVEsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsY0FBYyxDQUFDLGlCQUFpQixDQUFDLENBQUM7YUFDcEUsYUFBYSxDQUFDLFVBQUEsUUFBUSxJQUFJLE9BQUEsS0FBSSxDQUFDLG1CQUFtQixDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsRUFBRSxRQUFRLENBQUMsRUFBcEUsQ0FBb0UsQ0FBQyxDQUFDO0lBQ3pHLENBQUM7SUE3Q2Esd0JBQVEsR0FDbEIsaU1BSU0sQ0FBQztJQUUwQjtRQUFwQyxXQUFXLENBQUMsc0JBQXNCLENBQUM7a0RBQWlDO0lBQ3pDO1FBQTNCLFdBQVcsQ0FBQyxhQUFhLENBQUM7d0RBQW9DO0lBRXpCO1FBQXJDLFNBQVMsQ0FBQyx5QkFBeUIsQ0FBQztvRUFBMEQ7SUFPL0Y7UUFEQyxhQUFhOytDQVdiO0lBbUJMLHNCQUFDO0NBQUEsQUEvQ0QsQ0FBcUMsU0FBUyxHQStDN0M7U0EvQ1ksZUFBZSJ9