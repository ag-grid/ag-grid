"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TileSpacingPanel = void 0;
const core_1 = require("@ag-grid-community/core");
class TileSpacingPanel extends core_1.Component {
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
    (0, core_1.RefSelector)('groupSpacing')
], TileSpacingPanel.prototype, "groupSpacing", void 0);
__decorate([
    (0, core_1.RefSelector)('groupPaddingSlider')
], TileSpacingPanel.prototype, "groupPaddingSlider", void 0);
__decorate([
    (0, core_1.RefSelector)('groupSpacingSlider')
], TileSpacingPanel.prototype, "groupSpacingSlider", void 0);
__decorate([
    (0, core_1.RefSelector)('tilePaddingSlider')
], TileSpacingPanel.prototype, "tilePaddingSlider", void 0);
__decorate([
    (0, core_1.RefSelector)('tileSpacingSlider')
], TileSpacingPanel.prototype, "tileSpacingSlider", void 0);
__decorate([
    (0, core_1.Autowired)('chartTranslationService')
], TileSpacingPanel.prototype, "chartTranslationService", void 0);
__decorate([
    core_1.PostConstruct
], TileSpacingPanel.prototype, "init", null);
exports.TileSpacingPanel = TileSpacingPanel;
