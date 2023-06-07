var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, Component, PostConstruct, RefSelector, } from "@ag-grid-community/core";
import { FontPanel } from "../fontPanel";
import { getMaxValue } from "../formatPanel";
export class LegendPanel extends Component {
    constructor({ chartOptionsService, isExpandedOnInit = false }) {
        super();
        this.activePanels = [];
        this.chartOptionsService = chartOptionsService;
        this.isExpandedOnInit = isExpandedOnInit;
    }
    init() {
        const groupParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical'
        };
        this.setTemplate(LegendPanel.TEMPLATE, { legendGroup: groupParams });
        this.initLegendGroup();
        this.initLegendPosition();
        this.initLegendPadding();
        this.initLegendItems();
        this.initLabelPanel();
    }
    initLegendGroup() {
        this.legendGroup
            .setTitle(this.chartTranslationService.translate("legend"))
            .hideEnabledCheckbox(false)
            .setEnabled(this.chartOptionsService.getChartOption("legend.enabled") || false)
            .toggleGroupExpand(this.isExpandedOnInit)
            .onEnableChange(enabled => {
            this.chartOptionsService.setChartOption("legend.enabled", enabled);
            this.legendGroup.toggleGroupExpand(true);
        });
    }
    initLegendPosition() {
        const positions = ['top', 'right', 'bottom', 'left'];
        this.legendPositionSelect
            .setLabel(this.chartTranslationService.translate("position"))
            .setLabelWidth("flex")
            .setInputWidth(80)
            .addOptions(positions.map(position => ({
            value: position,
            text: this.chartTranslationService.translate(position)
        })))
            .setValue(this.chartOptionsService.getChartOption("legend.position"))
            .onValueChange(newValue => this.chartOptionsService.setChartOption("legend.position", newValue));
    }
    initLegendPadding() {
        const currentValue = this.chartOptionsService.getChartOption("legend.spacing");
        this.legendPaddingSlider
            .setLabel(this.chartTranslationService.translate("spacing"))
            .setMaxValue(getMaxValue(currentValue, 200))
            .setValue(`${currentValue}`)
            .setTextFieldWidth(45)
            .onValueChange(newValue => this.chartOptionsService.setChartOption("legend.spacing", newValue));
    }
    initLegendItems() {
        const initSlider = (expression, labelKey, input, defaultMaxValue) => {
            const currentValue = this.chartOptionsService.getChartOption(`legend.${expression}`);
            input.setLabel(this.chartTranslationService.translate(labelKey))
                .setMaxValue(getMaxValue(currentValue, defaultMaxValue))
                .setValue(`${currentValue}`)
                .setTextFieldWidth(45)
                .onValueChange(newValue => {
                this.chartOptionsService.setChartOption(`legend.${expression}`, newValue);
            });
        };
        initSlider("item.marker.size", "markerSize", this.markerSizeSlider, 40);
        initSlider("item.marker.strokeWidth", "markerStroke", this.markerStrokeSlider, 10);
        initSlider("item.marker.padding", "itemSpacing", this.markerPaddingSlider, 20);
        initSlider("item.paddingX", "layoutHorizontalSpacing", this.itemPaddingXSlider, 50);
        initSlider("item.paddingY", "layoutVerticalSpacing", this.itemPaddingYSlider, 50);
    }
    initLabelPanel() {
        const chartProxy = this.chartOptionsService;
        const initialFont = {
            family: chartProxy.getChartOption("legend.item.label.fontFamily"),
            style: chartProxy.getChartOption("legend.item.label.fontStyle"),
            weight: chartProxy.getChartOption("legend.item.label.fontWeight"),
            size: chartProxy.getChartOption("legend.item.label.fontSize"),
            color: chartProxy.getChartOption("legend.item.label.color")
        };
        const setFont = (font) => {
            const proxy = this.chartOptionsService;
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
        const params = {
            enabled: true,
            suppressEnabledCheckbox: true,
            initialFont: initialFont,
            setFont: setFont
        };
        const fontPanelComp = this.createBean(new FontPanel(params));
        this.legendGroup.addItem(fontPanelComp);
        this.activePanels.push(fontPanelComp);
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
LegendPanel.TEMPLATE = `<div>
            <ag-group-component ref="legendGroup">
                <ag-select ref="legendPositionSelect"></ag-select>
                <ag-slider ref="legendPaddingSlider"></ag-slider>
                <ag-slider ref="markerSizeSlider"></ag-slider>
                <ag-slider ref="markerStrokeSlider"></ag-slider>
                <ag-slider ref="markerPaddingSlider"></ag-slider>
                <ag-slider ref="itemPaddingXSlider"></ag-slider>
                <ag-slider ref="itemPaddingYSlider"></ag-slider>
            </ag-group-component>
        </div>`;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGVnZW5kUGFuZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2hhcnRzL2NoYXJ0Q29tcC9tZW51L2Zvcm1hdC9sZWdlbmQvbGVnZW5kUGFuZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUNILENBQUMsRUFLRCxTQUFTLEVBQ1QsU0FBUyxFQUNULGFBQWEsRUFDYixXQUFXLEdBQ2QsTUFBTSx5QkFBeUIsQ0FBQztBQUVqQyxPQUFPLEVBQVEsU0FBUyxFQUFtQixNQUFNLGNBQWMsQ0FBQztBQUdoRSxPQUFPLEVBQXNCLFdBQVcsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRWpFLE1BQU0sT0FBTyxXQUFZLFNBQVEsU0FBUztJQStCdEMsWUFBWSxFQUFFLG1CQUFtQixFQUFFLGdCQUFnQixHQUFHLEtBQUssRUFBc0I7UUFDN0UsS0FBSyxFQUFFLENBQUM7UUFISixpQkFBWSxHQUFnQixFQUFFLENBQUM7UUFLbkMsSUFBSSxDQUFDLG1CQUFtQixHQUFHLG1CQUFtQixDQUFDO1FBQy9DLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQztJQUM3QyxDQUFDO0lBR08sSUFBSTtRQUNSLE1BQU0sV0FBVyxHQUEyQjtZQUN4QyxhQUFhLEVBQUUseUJBQXlCO1lBQ3hDLFNBQVMsRUFBRSxVQUFVO1NBQ3hCLENBQUM7UUFDRixJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsRUFBQyxXQUFXLEVBQUUsV0FBVyxFQUFDLENBQUMsQ0FBQztRQUVuRSxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDMUIsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDekIsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUMxQixDQUFD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