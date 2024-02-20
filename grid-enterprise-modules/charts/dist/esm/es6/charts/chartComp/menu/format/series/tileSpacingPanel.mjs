var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Component, PostConstruct, RefSelector, } from "@ag-grid-community/core";
export class TileSpacingPanel extends Component {
    constructor(chartOptionsService, getSelectedSeries) {
        super();
        this.chartOptionsService = chartOptionsService;
        this.getSelectedSeries = getSelectedSeries;
    }
    init() {
        const groupParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            enabled: true,
            suppressOpenCloseIcons: true,
            suppressEnabledCheckbox: true,
        };
        this.setTemplate(TileSpacingPanel.TEMPLATE, {
            groupSpacing: Object.assign(Object.assign({}, groupParams), { title: this.chartTranslationService.translate("group") }),
            tileSpacing: Object.assign(Object.assign({}, groupParams), { title: this.chartTranslationService.translate("tile") }),
        });
        this.initControls();
    }
    initControls() {
        const optionGroups = [
            {
                optionNamespace: "group",
                components: {
                    paddingSlider: this.groupPaddingSlider,
                    spacingSlider: this.groupSpacingSlider,
                },
            },
            {
                optionNamespace: "tile",
                components: {
                    paddingSlider: this.tilePaddingSlider,
                    spacingSlider: this.tileSpacingSlider,
                },
            },
        ];
        for (const group of optionGroups) {
            const { optionNamespace, components } = group;
            const { paddingSlider, spacingSlider } = components;
            const paddingValue = this.chartOptionsService.getSeriesOption(`${optionNamespace}.padding`, this.getSelectedSeries());
            paddingSlider
                .setLabel(this.chartTranslationService.translate("padding"))
                .setMinValue(0)
                .setMaxValue(10)
                .setTextFieldWidth(45)
                .setValue(`${paddingValue}`)
                .onValueChange(newValue => this.chartOptionsService.setSeriesOption(`${optionNamespace}.padding`, newValue, this.getSelectedSeries()));
            const spacingValue = this.chartOptionsService.getSeriesOption(`${optionNamespace}.gap`, this.getSelectedSeries());
            spacingSlider
                .setLabel(this.chartTranslationService.translate("spacing"))
                .setMinValue(0)
                .setMaxValue(10)
                .setTextFieldWidth(45)
                .setValue(`${spacingValue}`)
                .onValueChange(newValue => this.chartOptionsService.setSeriesOption(`${optionNamespace}.gap`, newValue, this.getSelectedSeries()));
        }
    }
}
TileSpacingPanel.TEMPLATE = `<div>
            <ag-group-component ref="groupSpacing">
                <ag-slider ref="groupPaddingSlider"></ag-slider>
                <ag-slider ref="groupSpacingSlider"></ag-slider>
            </ag-group-component>
            <ag-group-component ref="tileSpacing">
                <ag-slider ref="tilePaddingSlider"></ag-slider>
                <ag-slider ref="tileSpacingSlider"></ag-slider>
            </ag-group-component>
        </div>`;
__decorate([
    RefSelector('groupSpacing')
], TileSpacingPanel.prototype, "groupSpacing", void 0);
__decorate([
    RefSelector('groupPaddingSlider')
], TileSpacingPanel.prototype, "groupPaddingSlider", void 0);
__decorate([
    RefSelector('groupSpacingSlider')
], TileSpacingPanel.prototype, "groupSpacingSlider", void 0);
__decorate([
    RefSelector('tilePaddingSlider')
], TileSpacingPanel.prototype, "tilePaddingSlider", void 0);
__decorate([
    RefSelector('tileSpacingSlider')
], TileSpacingPanel.prototype, "tileSpacingSlider", void 0);
__decorate([
    Autowired('chartTranslationService')
], TileSpacingPanel.prototype, "chartTranslationService", void 0);
__decorate([
    PostConstruct
], TileSpacingPanel.prototype, "init", null);
