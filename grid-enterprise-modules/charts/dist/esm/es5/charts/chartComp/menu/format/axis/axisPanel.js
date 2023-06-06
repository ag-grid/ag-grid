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
import { _, AgCheckbox, AgSlider, Autowired, Component, PostConstruct, RefSelector, } from "@ag-grid-community/core";
import { ChartController } from "../../../chartController";
import { AxisTicksPanel } from "./axisTicksPanel";
import { FontPanel } from "../fontPanel";
import { getMaxValue } from "../formatPanel";
import { AgAngleSelect } from "../../../../../widgets/agAngleSelect";
var AxisPanel = /** @class */ (function (_super) {
    __extends(AxisPanel, _super);
    function AxisPanel(_a) {
        var chartController = _a.chartController, chartOptionsService = _a.chartOptionsService, _b = _a.isExpandedOnInit, isExpandedOnInit = _b === void 0 ? false : _b;
        var _this = _super.call(this) || this;
        _this.activePanels = [];
        _this.axisLabelUpdateFuncs = [];
        _this.prevXRotation = 0;
        _this.prevYRotation = 0;
        _this.chartController = chartController;
        _this.chartOptionsService = chartOptionsService;
        _this.isExpandedOnInit = isExpandedOnInit;
        return _this;
    }
    AxisPanel.prototype.init = function () {
        var _this = this;
        var groupParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical'
        };
        this.setTemplate(AxisPanel.TEMPLATE, { axisGroup: groupParams });
        this.initAxis();
        this.initAxisTicks();
        this.initAxisLabels();
        var updateAxisLabelRotations = function () { return _this.axisLabelUpdateFuncs.forEach(function (func) { return func(); }); };
        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_UPDATED, updateAxisLabelRotations);
    };
    AxisPanel.prototype.initAxis = function () {
        var _this = this;
        this.axisGroup
            .setTitle(this.translate("axis"))
            .toggleGroupExpand(this.isExpandedOnInit)
            .hideEnabledCheckbox(true);
        this.axisColorInput
            .setLabel(this.translate("color"))
            .setLabelWidth("flex")
            .setInputWidth(45)
            .setValue(this.chartOptionsService.getAxisProperty("line.color"))
            .onValueChange(function (newColor) { return _this.chartOptionsService.setAxisProperty("line.color", newColor); });
        var currentValue = this.chartOptionsService.getAxisProperty("line.width");
        this.axisLineWidthSlider
            .setMaxValue(getMaxValue(currentValue, 10))
            .setLabel(this.translate("thickness"))
            .setTextFieldWidth(45)
            .setValue("" + currentValue)
            .onValueChange(function (newValue) { return _this.chartOptionsService.setAxisProperty("line.width", newValue); });
    };
    AxisPanel.prototype.initAxisTicks = function () {
        var axisTicksComp = this.createBean(new AxisTicksPanel(this.chartOptionsService));
        this.axisGroup.addItem(axisTicksComp);
        this.activePanels.push(axisTicksComp);
    };
    AxisPanel.prototype.initAxisLabels = function () {
        var _this = this;
        var initialFont = {
            family: this.chartOptionsService.getAxisProperty("label.fontFamily"),
            style: this.chartOptionsService.getAxisProperty("label.fontStyle"),
            weight: this.chartOptionsService.getAxisProperty("label.fontWeight"),
            size: this.chartOptionsService.getAxisProperty("label.fontSize"),
            color: this.chartOptionsService.getAxisProperty("label.color")
        };
        var setFont = function (font) {
            if (font.family) {
                _this.chartOptionsService.setAxisProperty("label.fontFamily", font.family);
            }
            if (font.weight) {
                _this.chartOptionsService.setAxisProperty("label.fontWeight", font.weight);
            }
            if (font.style) {
                _this.chartOptionsService.setAxisProperty("label.fontStyle", font.style);
            }
            if (font.size) {
                _this.chartOptionsService.setAxisProperty("label.fontSize", font.size);
            }
            if (font.color) {
                _this.chartOptionsService.setAxisProperty("label.color", font.color);
            }
        };
        var params = {
            name: this.translate("labels"),
            enabled: true,
            suppressEnabledCheckbox: true,
            initialFont: initialFont,
            setFont: setFont
        };
        var labelPanelComp = this.createBean(new FontPanel(params));
        this.axisGroup.addItem(labelPanelComp);
        this.activePanels.push(labelPanelComp);
        this.addAdditionalLabelComps(labelPanelComp);
    };
    AxisPanel.prototype.addAdditionalLabelComps = function (labelPanelComp) {
        this.addLabelPadding(labelPanelComp);
        var _a = this.createRotationWidgets(), xRotationComp = _a.xRotationComp, yRotationComp = _a.yRotationComp;
        var autoRotateCb = this.initLabelRotations(xRotationComp, yRotationComp);
        labelPanelComp.addCompToPanel(autoRotateCb);
        labelPanelComp.addCompToPanel(xRotationComp);
        labelPanelComp.addCompToPanel(yRotationComp);
    };
    AxisPanel.prototype.initLabelRotations = function (xRotationComp, yRotationComp) {
        var _this = this;
        var getLabelRotation = function (axisType) {
            return _this.chartOptionsService.getLabelRotation(axisType);
        };
        var setLabelRotation = function (axisType, value) {
            _this.chartOptionsService.setLabelRotation(axisType, value);
        };
        var updateAutoRotate = function (autoRotate) {
            _this.chartOptionsService.setAxisProperty("label.autoRotate", autoRotate);
            if (autoRotate) {
                // store prev rotations before we remove them from the options
                _this.prevXRotation = getLabelRotation("xAxis");
                _this.prevYRotation = getLabelRotation("yAxis");
                // `autoRotate` is only
                setLabelRotation("xAxis", undefined);
                setLabelRotation("yAxis", undefined);
            }
            else {
                // reinstate prev rotations
                setLabelRotation("xAxis", _this.prevXRotation);
                setLabelRotation("yAxis", _this.prevYRotation);
            }
            xRotationComp.setDisabled(autoRotate);
            yRotationComp.setDisabled(autoRotate);
        };
        var getAutoRotateValue = function () {
            var xRotation = getLabelRotation("xAxis");
            var yRotation = getLabelRotation("yAxis");
            if (xRotation == undefined && yRotation == undefined) {
                return _this.chartOptionsService.getAxisProperty("label.autoRotate");
            }
            return false;
        };
        var autoRotate = getAutoRotateValue();
        var autoRotateCheckbox = this.createBean(new AgCheckbox())
            .setLabel(this.translate('autoRotate'))
            .setValue(autoRotate)
            .onValueChange(updateAutoRotate);
        // init rotation comp state
        xRotationComp.setDisabled(autoRotate);
        yRotationComp.setDisabled(autoRotate);
        return autoRotateCheckbox;
    };
    AxisPanel.prototype.createRotationWidgets = function () {
        var _this = this;
        var degreesSymbol = String.fromCharCode(176);
        var createRotationComp = function (labelKey, axisType) {
            var label = _this.chartTranslationService.translate(labelKey) + " " + degreesSymbol;
            var value = _this.chartOptionsService.getLabelRotation(axisType);
            var angleSelect = new AgAngleSelect()
                .setLabel(label)
                .setLabelWidth("flex")
                .setValue(value || 0)
                .onValueChange(function (newValue) { return _this.chartOptionsService.setLabelRotation(axisType, newValue); });
            // the axis label rotation needs to be updated when the default category changes in the data panel
            _this.axisLabelUpdateFuncs.push(function () {
                var value = _this.chartOptionsService.getLabelRotation(axisType);
                angleSelect.setValue(value || 0);
            });
            return _this.createBean(angleSelect);
        };
        return {
            xRotationComp: createRotationComp("xRotation", "xAxis"),
            yRotationComp: createRotationComp("yRotation", "yAxis")
        };
    };
    AxisPanel.prototype.addLabelPadding = function (labelPanelComp) {
        var _this = this;
        var labelPaddingSlider = this.createBean(new AgSlider());
        var currentValue = this.chartOptionsService.getAxisProperty("label.padding");
        labelPaddingSlider.setLabel(this.chartTranslationService.translate("padding"))
            .setMaxValue(getMaxValue(currentValue, 30))
            .setValue("" + currentValue)
            .setTextFieldWidth(45)
            .onValueChange(function (newValue) { return _this.chartOptionsService.setAxisProperty("label.padding", newValue); });
        labelPanelComp.addCompToPanel(labelPaddingSlider);
    };
    AxisPanel.prototype.translate = function (key, defaultText) {
        return this.chartTranslationService.translate(key, defaultText);
    };
    AxisPanel.prototype.destroyActivePanels = function () {
        var _this = this;
        this.activePanels.forEach(function (panel) {
            _.removeFromParent(panel.getGui());
            _this.destroyBean(panel);
        });
    };
    AxisPanel.prototype.destroy = function () {
        this.destroyActivePanels();
        _super.prototype.destroy.call(this);
    };
    AxisPanel.TEMPLATE = "<div>\n            <ag-group-component ref=\"axisGroup\">\n                <ag-color-picker ref=\"axisColorInput\"></ag-color-picker>\n                <ag-slider ref=\"axisLineWidthSlider\"></ag-slider>\n            </ag-group-component>\n        </div>";
    __decorate([
        RefSelector('axisGroup')
    ], AxisPanel.prototype, "axisGroup", void 0);
    __decorate([
        RefSelector('axisColorInput')
    ], AxisPanel.prototype, "axisColorInput", void 0);
    __decorate([
        RefSelector('axisLineWidthSlider')
    ], AxisPanel.prototype, "axisLineWidthSlider", void 0);
    __decorate([
        Autowired('chartTranslationService')
    ], AxisPanel.prototype, "chartTranslationService", void 0);
    __decorate([
        PostConstruct
    ], AxisPanel.prototype, "init", null);
    return AxisPanel;
}(Component));
export { AxisPanel };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXhpc1BhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0cy9jaGFydENvbXAvbWVudS9mb3JtYXQvYXhpcy9heGlzUGFuZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUNILENBQUMsRUFDRCxVQUFVLEVBR1YsUUFBUSxFQUNSLFNBQVMsRUFDVCxTQUFTLEVBQ1QsYUFBYSxFQUNiLFdBQVcsR0FDZCxNQUFNLHlCQUF5QixDQUFDO0FBQ2pDLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUMzRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDbEQsT0FBTyxFQUFRLFNBQVMsRUFBbUIsTUFBTSxjQUFjLENBQUM7QUFHaEUsT0FBTyxFQUFzQixXQUFXLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUVqRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFFckU7SUFBK0IsNkJBQVM7SUEwQnBDLG1CQUFZLEVBQXNGO1lBQXBGLGVBQWUscUJBQUEsRUFBRSxtQkFBbUIseUJBQUEsRUFBRSx3QkFBd0IsRUFBeEIsZ0JBQWdCLG1CQUFHLEtBQUssS0FBQTtRQUE1RSxZQUNJLGlCQUFPLFNBS1Y7UUFaTyxrQkFBWSxHQUFnQixFQUFFLENBQUM7UUFDL0IsMEJBQW9CLEdBQWUsRUFBRSxDQUFDO1FBRXRDLG1CQUFhLEdBQUcsQ0FBQyxDQUFDO1FBQ2xCLG1CQUFhLEdBQUcsQ0FBQyxDQUFDO1FBS3RCLEtBQUksQ0FBQyxlQUFlLEdBQUcsZUFBZSxDQUFDO1FBQ3ZDLEtBQUksQ0FBQyxtQkFBbUIsR0FBRyxtQkFBbUIsQ0FBQztRQUMvQyxLQUFJLENBQUMsZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUM7O0lBQzdDLENBQUM7SUFHTyx3QkFBSSxHQUFaO1FBREEsaUJBY0M7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