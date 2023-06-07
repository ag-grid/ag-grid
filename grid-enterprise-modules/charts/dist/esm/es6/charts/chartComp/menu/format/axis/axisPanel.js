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
export class AxisPanel extends Component {
    constructor({ chartController, chartOptionsService, isExpandedOnInit = false }) {
        super();
        this.activePanels = [];
        this.axisLabelUpdateFuncs = [];
        this.prevXRotation = 0;
        this.prevYRotation = 0;
        this.chartController = chartController;
        this.chartOptionsService = chartOptionsService;
        this.isExpandedOnInit = isExpandedOnInit;
    }
    init() {
        const groupParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical'
        };
        this.setTemplate(AxisPanel.TEMPLATE, { axisGroup: groupParams });
        this.initAxis();
        this.initAxisTicks();
        this.initAxisLabels();
        const updateAxisLabelRotations = () => this.axisLabelUpdateFuncs.forEach(func => func());
        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_UPDATED, updateAxisLabelRotations);
    }
    initAxis() {
        this.axisGroup
            .setTitle(this.translate("axis"))
            .toggleGroupExpand(this.isExpandedOnInit)
            .hideEnabledCheckbox(true);
        this.axisColorInput
            .setLabel(this.translate("color"))
            .setLabelWidth("flex")
            .setInputWidth(45)
            .setValue(this.chartOptionsService.getAxisProperty("line.color"))
            .onValueChange(newColor => this.chartOptionsService.setAxisProperty("line.color", newColor));
        const currentValue = this.chartOptionsService.getAxisProperty("line.width");
        this.axisLineWidthSlider
            .setMaxValue(getMaxValue(currentValue, 10))
            .setLabel(this.translate("thickness"))
            .setTextFieldWidth(45)
            .setValue(`${currentValue}`)
            .onValueChange(newValue => this.chartOptionsService.setAxisProperty("line.width", newValue));
    }
    initAxisTicks() {
        const axisTicksComp = this.createBean(new AxisTicksPanel(this.chartOptionsService));
        this.axisGroup.addItem(axisTicksComp);
        this.activePanels.push(axisTicksComp);
    }
    initAxisLabels() {
        const initialFont = {
            family: this.chartOptionsService.getAxisProperty("label.fontFamily"),
            style: this.chartOptionsService.getAxisProperty("label.fontStyle"),
            weight: this.chartOptionsService.getAxisProperty("label.fontWeight"),
            size: this.chartOptionsService.getAxisProperty("label.fontSize"),
            color: this.chartOptionsService.getAxisProperty("label.color")
        };
        const setFont = (font) => {
            if (font.family) {
                this.chartOptionsService.setAxisProperty("label.fontFamily", font.family);
            }
            if (font.weight) {
                this.chartOptionsService.setAxisProperty("label.fontWeight", font.weight);
            }
            if (font.style) {
                this.chartOptionsService.setAxisProperty("label.fontStyle", font.style);
            }
            if (font.size) {
                this.chartOptionsService.setAxisProperty("label.fontSize", font.size);
            }
            if (font.color) {
                this.chartOptionsService.setAxisProperty("label.color", font.color);
            }
        };
        const params = {
            name: this.translate("labels"),
            enabled: true,
            suppressEnabledCheckbox: true,
            initialFont,
            setFont
        };
        const labelPanelComp = this.createBean(new FontPanel(params));
        this.axisGroup.addItem(labelPanelComp);
        this.activePanels.push(labelPanelComp);
        this.addAdditionalLabelComps(labelPanelComp);
    }
    addAdditionalLabelComps(labelPanelComp) {
        this.addLabelPadding(labelPanelComp);
        const { xRotationComp, yRotationComp } = this.createRotationWidgets();
        const autoRotateCb = this.initLabelRotations(xRotationComp, yRotationComp);
        labelPanelComp.addCompToPanel(autoRotateCb);
        labelPanelComp.addCompToPanel(xRotationComp);
        labelPanelComp.addCompToPanel(yRotationComp);
    }
    initLabelRotations(xRotationComp, yRotationComp) {
        const getLabelRotation = (axisType) => {
            return this.chartOptionsService.getLabelRotation(axisType);
        };
        const setLabelRotation = (axisType, value) => {
            this.chartOptionsService.setLabelRotation(axisType, value);
        };
        const updateAutoRotate = (autoRotate) => {
            this.chartOptionsService.setAxisProperty("label.autoRotate", autoRotate);
            if (autoRotate) {
                // store prev rotations before we remove them from the options
                this.prevXRotation = getLabelRotation("xAxis");
                this.prevYRotation = getLabelRotation("yAxis");
                // `autoRotate` is only
                setLabelRotation("xAxis", undefined);
                setLabelRotation("yAxis", undefined);
            }
            else {
                // reinstate prev rotations
                setLabelRotation("xAxis", this.prevXRotation);
                setLabelRotation("yAxis", this.prevYRotation);
            }
            xRotationComp.setDisabled(autoRotate);
            yRotationComp.setDisabled(autoRotate);
        };
        const getAutoRotateValue = () => {
            const xRotation = getLabelRotation("xAxis");
            const yRotation = getLabelRotation("yAxis");
            if (xRotation == undefined && yRotation == undefined) {
                return this.chartOptionsService.getAxisProperty("label.autoRotate");
            }
            return false;
        };
        const autoRotate = getAutoRotateValue();
        const autoRotateCheckbox = this.createBean(new AgCheckbox())
            .setLabel(this.translate('autoRotate'))
            .setValue(autoRotate)
            .onValueChange(updateAutoRotate);
        // init rotation comp state
        xRotationComp.setDisabled(autoRotate);
        yRotationComp.setDisabled(autoRotate);
        return autoRotateCheckbox;
    }
    createRotationWidgets() {
        const degreesSymbol = String.fromCharCode(176);
        const createRotationComp = (labelKey, axisType) => {
            const label = `${this.chartTranslationService.translate(labelKey)} ${degreesSymbol}`;
            const value = this.chartOptionsService.getLabelRotation(axisType);
            const angleSelect = new AgAngleSelect()
                .setLabel(label)
                .setLabelWidth("flex")
                .setValue(value || 0)
                .onValueChange(newValue => this.chartOptionsService.setLabelRotation(axisType, newValue));
            // the axis label rotation needs to be updated when the default category changes in the data panel
            this.axisLabelUpdateFuncs.push(() => {
                const value = this.chartOptionsService.getLabelRotation(axisType);
                angleSelect.setValue(value || 0);
            });
            return this.createBean(angleSelect);
        };
        return {
            xRotationComp: createRotationComp("xRotation", "xAxis"),
            yRotationComp: createRotationComp("yRotation", "yAxis")
        };
    }
    addLabelPadding(labelPanelComp) {
        const labelPaddingSlider = this.createBean(new AgSlider());
        const currentValue = this.chartOptionsService.getAxisProperty("label.padding");
        labelPaddingSlider.setLabel(this.chartTranslationService.translate("padding"))
            .setMaxValue(getMaxValue(currentValue, 30))
            .setValue(`${currentValue}`)
            .setTextFieldWidth(45)
            .onValueChange(newValue => this.chartOptionsService.setAxisProperty("label.padding", newValue));
        labelPanelComp.addCompToPanel(labelPaddingSlider);
    }
    translate(key, defaultText) {
        return this.chartTranslationService.translate(key, defaultText);
    }
    destroyActivePanels() {
        this.activePanels.forEach(panel => {
            _.removeFromParent(panel.getGui());
            this.destroyBean(panel);
        });
    }
    destroy() {
        this.destroyActivePanels();
        super.destroy();
    }
}
AxisPanel.TEMPLATE = `<div>
            <ag-group-component ref="axisGroup">
                <ag-color-picker ref="axisColorInput"></ag-color-picker>
                <ag-slider ref="axisLineWidthSlider"></ag-slider>
            </ag-group-component>
        </div>`;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXhpc1BhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0cy9jaGFydENvbXAvbWVudS9mb3JtYXQvYXhpcy9heGlzUGFuZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUNILENBQUMsRUFDRCxVQUFVLEVBR1YsUUFBUSxFQUNSLFNBQVMsRUFDVCxTQUFTLEVBQ1QsYUFBYSxFQUNiLFdBQVcsR0FDZCxNQUFNLHlCQUF5QixDQUFDO0FBQ2pDLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUMzRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDbEQsT0FBTyxFQUFRLFNBQVMsRUFBbUIsTUFBTSxjQUFjLENBQUM7QUFHaEUsT0FBTyxFQUFzQixXQUFXLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUVqRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFFckUsTUFBTSxPQUFPLFNBQVUsU0FBUSxTQUFTO0lBMEJwQyxZQUFZLEVBQUUsZUFBZSxFQUFFLG1CQUFtQixFQUFFLGdCQUFnQixHQUFHLEtBQUssRUFBc0I7UUFDOUYsS0FBSyxFQUFFLENBQUM7UUFQSixpQkFBWSxHQUFnQixFQUFFLENBQUM7UUFDL0IseUJBQW9CLEdBQWUsRUFBRSxDQUFDO1FBRXRDLGtCQUFhLEdBQUcsQ0FBQyxDQUFDO1FBQ2xCLGtCQUFhLEdBQUcsQ0FBQyxDQUFDO1FBS3RCLElBQUksQ0FBQyxlQUFlLEdBQUcsZUFBZSxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxtQkFBbUIsQ0FBQztRQUMvQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUM7SUFDN0MsQ0FBQztJQUdPLElBQUk7UUFDUixNQUFNLFdBQVcsR0FBMkI7WUFDeEMsYUFBYSxFQUFFLHlCQUF5QjtZQUN4QyxTQUFT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