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
import { _, Autowired, Component, PostConstruct, RefSelector, } from "@ag-grid-community/core";
import { FontPanel } from "../fontPanel";
import { getMaxValue } from "../formatPanel";
var LegendPanel = /** @class */ (function (_super) {
    __extends(LegendPanel, _super);
    function LegendPanel(_a) {
        var chartOptionsService = _a.chartOptionsService, _b = _a.isExpandedOnInit, isExpandedOnInit = _b === void 0 ? false : _b;
        var _this = _super.call(this) || this;
        _this.activePanels = [];
        _this.chartOptionsService = chartOptionsService;
        _this.isExpandedOnInit = isExpandedOnInit;
        return _this;
    }
    LegendPanel.prototype.init = function () {
        var groupParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical'
        };
        this.setTemplate(LegendPanel.TEMPLATE, { legendGroup: groupParams });
        this.initLegendGroup();
        this.initLegendPosition();
        this.initLegendPadding();
        this.initLegendItems();
        this.initLabelPanel();
    };
    LegendPanel.prototype.initLegendGroup = function () {
        var _this = this;
        this.legendGroup
            .setTitle(this.chartTranslationService.translate("legend"))
            .hideEnabledCheckbox(false)
            .setEnabled(this.chartOptionsService.getChartOption("legend.enabled") || false)
            .toggleGroupExpand(this.isExpandedOnInit)
            .onEnableChange(function (enabled) {
            _this.chartOptionsService.setChartOption("legend.enabled", enabled);
            _this.legendGroup.toggleGroupExpand(true);
        });
    };
    LegendPanel.prototype.initLegendPosition = function () {
        var _this = this;
        var positions = ['top', 'right', 'bottom', 'left'];
        this.legendPositionSelect
            .setLabel(this.chartTranslationService.translate("position"))
            .setLabelWidth("flex")
            .setInputWidth(80)
            .addOptions(positions.map(function (position) { return ({
            value: position,
            text: _this.chartTranslationService.translate(position)
        }); }))
            .setValue(this.chartOptionsService.getChartOption("legend.position"))
            .onValueChange(function (newValue) { return _this.chartOptionsService.setChartOption("legend.position", newValue); });
    };
    LegendPanel.prototype.initLegendPadding = function () {
        var _this = this;
        var currentValue = this.chartOptionsService.getChartOption("legend.spacing");
        this.legendPaddingSlider
            .setLabel(this.chartTranslationService.translate("spacing"))
            .setMaxValue(getMaxValue(currentValue, 200))
            .setValue("" + currentValue)
            .setTextFieldWidth(45)
            .onValueChange(function (newValue) { return _this.chartOptionsService.setChartOption("legend.spacing", newValue); });
    };
    LegendPanel.prototype.initLegendItems = function () {
        var _this = this;
        var initSlider = function (expression, labelKey, input, defaultMaxValue) {
            var currentValue = _this.chartOptionsService.getChartOption("legend." + expression);
            input.setLabel(_this.chartTranslationService.translate(labelKey))
                .setMaxValue(getMaxValue(currentValue, defaultMaxValue))
                .setValue("" + currentValue)
                .setTextFieldWidth(45)
                .onValueChange(function (newValue) {
                _this.chartOptionsService.setChartOption("legend." + expression, newValue);
            });
        };
        initSlider("item.marker.size", "markerSize", this.markerSizeSlider, 40);
        initSlider("item.marker.strokeWidth", "markerStroke", this.markerStrokeSlider, 10);
        initSlider("item.marker.padding", "itemSpacing", this.markerPaddingSlider, 20);
        initSlider("item.paddingX", "layoutHorizontalSpacing", this.itemPaddingXSlider, 50);
        initSlider("item.paddingY", "layoutVerticalSpacing", this.itemPaddingYSlider, 50);
    };
    LegendPanel.prototype.initLabelPanel = function () {
        var _this = this;
        var chartProxy = this.chartOptionsService;
        var initialFont = {
            family: chartProxy.getChartOption("legend.item.label.fontFamily"),
            style: chartProxy.getChartOption("legend.item.label.fontStyle"),
            weight: chartProxy.getChartOption("legend.item.label.fontWeight"),
            size: chartProxy.getChartOption("legend.item.label.fontSize"),
            color: chartProxy.getChartOption("legend.item.label.color")
        };
        var setFont = function (font) {
            var proxy = _this.chartOptionsService;
            if (font.family) {
                proxy.setChartOption("legend.item.label.fontFamily", font.family);
            }
            if (font.weight) {
                proxy.setChartOption("legend.item.label.fontWeight", font.weight);
            }
            if (font.style) {
                proxy.setChartOption("legend.item.label.fontStyle", font.style);
            }
            if (font.size) {
                proxy.setChartOption("legend.item.label.fontSize", font.size);
            }
            if (font.color) {
                proxy.setChartOption("legend.item.label.color", font.color);
            }
        };
        var params = {
            enabled: true,
            suppressEnabledCheckbox: true,
            initialFont: initialFont,
            setFont: setFont
        };
        var fontPanelComp = this.createBean(new FontPanel(params));
        this.legendGroup.addItem(fontPanelComp);
        this.activePanels.push(fontPanelComp);
    };
    LegendPanel.prototype.destroyActivePanels = function () {
        var _this = this;
        this.activePanels.forEach(function (panel) {
            _.removeFromParent(panel.getGui());
            _this.destroyBean(panel);
        });
    };
    LegendPanel.prototype.destroy = function () {
        this.destroyActivePanels();
        _super.prototype.destroy.call(this);
    };
    LegendPanel.TEMPLATE = "<div>\n            <ag-group-component ref=\"legendGroup\">\n                <ag-select ref=\"legendPositionSelect\"></ag-select>\n                <ag-slider ref=\"legendPaddingSlider\"></ag-slider>\n                <ag-slider ref=\"markerSizeSlider\"></ag-slider>\n                <ag-slider ref=\"markerStrokeSlider\"></ag-slider>\n                <ag-slider ref=\"markerPaddingSlider\"></ag-slider>\n                <ag-slider ref=\"itemPaddingXSlider\"></ag-slider>\n                <ag-slider ref=\"itemPaddingYSlider\"></ag-slider>\n            </ag-group-component>\n        </div>";
    __decorate([
        RefSelector('legendGroup')
    ], LegendPanel.prototype, "legendGroup", void 0);
    __decorate([
        RefSelector('legendPositionSelect')
    ], LegendPanel.prototype, "legendPositionSelect", void 0);
    __decorate([
        RefSelector('legendPaddingSlider')
    ], LegendPanel.prototype, "legendPaddingSlider", void 0);
    __decorate([
        RefSelector('markerSizeSlider')
    ], LegendPanel.prototype, "markerSizeSlider", void 0);
    __decorate([
        RefSelector('markerStrokeSlider')
    ], LegendPanel.prototype, "markerStrokeSlider", void 0);
    __decorate([
        RefSelector('markerPaddingSlider')
    ], LegendPanel.prototype, "markerPaddingSlider", void 0);
    __decorate([
        RefSelector('itemPaddingXSlider')
    ], LegendPanel.prototype, "itemPaddingXSlider", void 0);
    __decorate([
        RefSelector('itemPaddingYSlider')
    ], LegendPanel.prototype, "itemPaddingYSlider", void 0);
    __decorate([
        Autowired('chartTranslationService')
    ], LegendPanel.prototype, "chartTranslationService", void 0);
    __decorate([
        PostConstruct
    ], LegendPanel.prototype, "init", null);
    return LegendPanel;
}(Component));
export { LegendPanel };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGVnZW5kUGFuZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2hhcnRzL2NoYXJ0Q29tcC9tZW51L2Zvcm1hdC9sZWdlbmQvbGVnZW5kUGFuZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUNILENBQUMsRUFLRCxTQUFTLEVBQ1QsU0FBUyxFQUNULGFBQWEsRUFDYixXQUFXLEdBQ2QsTUFBTSx5QkFBeUIsQ0FBQztBQUVqQyxPQUFPLEVBQVEsU0FBUyxFQUFtQixNQUFNLGNBQWMsQ0FBQztBQUdoRSxPQUFPLEVBQXNCLFdBQVcsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRWpFO0lBQWlDLCtCQUFTO0lBK0J0QyxxQkFBWSxFQUFxRTtZQUFuRSxtQkFBbUIseUJBQUEsRUFBRSx3QkFBd0IsRUFBeEIsZ0JBQWdCLG1CQUFHLEtBQUssS0FBQTtRQUEzRCxZQUNJLGlCQUFPLFNBSVY7UUFQTyxrQkFBWSxHQUFnQixFQUFFLENBQUM7UUFLbkMsS0FBSSxDQUFDLG1CQUFtQixHQUFHLG1CQUFtQixDQUFDO1FBQy9DLEtBQUksQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQzs7SUFDN0MsQ0FBQztJQUdPLDBCQUFJLEdBQVo7UUFDSSxJQUFNLFdBQVcsR0FBMkI7WUFDeEMsYUFBYSxFQUFFLHlCQUF5QjtZQUN4QyxTQUFTLEVBQUUsVUFBVTtTQUN4QixDQUFDO1FBQ0YsSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLEVBQUMsV0FBVyxFQUFFLFdBQVcsRUFBQyxDQUFDLENBQUM7UUFFbkUsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQzFCLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUN2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