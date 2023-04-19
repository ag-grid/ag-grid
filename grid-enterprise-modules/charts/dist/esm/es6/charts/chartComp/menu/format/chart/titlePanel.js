var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, Component, PostConstruct, AgSlider } from "@ag-grid-community/core";
import { FontPanel } from "../fontPanel";
export default class TitlePanel extends Component {
    constructor(chartOptionsService) {
        super(TitlePanel.TEMPLATE);
        this.chartOptionsService = chartOptionsService;
        this.activePanels = [];
    }
    init() {
        this.initFontPanel();
        this.titlePlaceholder = this.chartTranslationService.translate('titlePlaceholder');
    }
    hasTitle() {
        const title = this.getOption('title');
        return title && title.enabled && title.text && title.text.length > 0;
    }
    initFontPanel() {
        const hasTitle = this.hasTitle();
        const setFont = (font, isSilent) => {
            if (font.family) {
                this.setOption('title.fontFamily', font.family, isSilent);
            }
            if (font.weight) {
                this.setOption('title.fontWeight', font.weight, isSilent);
            }
            if (font.style) {
                this.setOption('title.fontStyle', font.style, isSilent);
            }
            if (font.size) {
                this.setOption('title.fontSize', font.size, isSilent);
            }
            if (font.color) {
                this.setOption('title.color', font.color, isSilent);
            }
        };
        const initialFont = {
            family: this.getOption('title.fontFamily'),
            style: this.getOption('title.fontStyle'),
            weight: this.getOption('title.fontWeight'),
            size: this.getOption('title.fontSize'),
            color: this.getOption('title.color')
        };
        if (!hasTitle) {
            setFont(initialFont, true);
        }
        const fontPanelParams = {
            name: this.chartTranslationService.translate('title'),
            enabled: hasTitle,
            suppressEnabledCheckbox: false,
            initialFont,
            setFont,
            setEnabled: (enabled) => {
                if (this.toolbarExists()) {
                    // extra padding is only included when the toolbar is present
                    const topPadding = this.getOption('padding.top');
                    this.setOption('padding.top', enabled ? topPadding - 20 : topPadding + 20);
                }
                this.setOption('title.enabled', enabled);
                const currentTitleText = this.getOption('title.text');
                const replaceableTitleText = currentTitleText === 'Title' || (currentTitleText === null || currentTitleText === void 0 ? void 0 : currentTitleText.trim().length) === 0;
                if (enabled && replaceableTitleText) {
                    this.setOption('title.text', this.titlePlaceholder);
                }
            }
        };
        const fontPanelComp = this.createBean(new FontPanel(fontPanelParams));
        // add the title spacing slider to font panel
        fontPanelComp.addItemToPanel(this.createSpacingSlicer());
        this.getGui().appendChild(fontPanelComp.getGui());
        this.activePanels.push(fontPanelComp);
        // edits to the title can disable it, so keep the checkbox in sync:
        this.addManagedListener(this.eventService, 'chartTitleEdit', () => {
            fontPanelComp.setEnabled(this.hasTitle());
        });
    }
    createSpacingSlicer() {
        const spacingSlider = this.createBean(new AgSlider());
        const currentValue = this.chartOptionsService.getChartOption('title.spacing');
        spacingSlider.setLabel(this.chartTranslationService.translate('spacing'))
            .setMaxValue(Math.max(currentValue, 100))
            .setValue(`${currentValue}`)
            .setTextFieldWidth(45)
            .onValueChange(newValue => this.chartOptionsService.setChartOption('title.spacing', newValue));
        return spacingSlider;
    }
    toolbarExists() {
        const toolbarItemsFunc = this.gridOptionsService.getCallback('getChartToolbarItems');
        if (!toolbarItemsFunc) {
            return true;
        }
        const params = {
            defaultItems: ['chartUnlink', 'chartDownload']
        };
        const topItems = ['chartLink', 'chartUnlink', 'chartDownload'];
        return topItems.some(v => { var _a; return (_a = (toolbarItemsFunc && toolbarItemsFunc(params))) === null || _a === void 0 ? void 0 : _a.includes(v); });
    }
    getOption(expression) {
        return this.chartOptionsService.getChartOption(expression);
    }
    setOption(property, value, isSilent) {
        this.chartOptionsService.setChartOption(property, value, isSilent);
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
TitlePanel.TEMPLATE = `<div></div>`;
__decorate([
    Autowired('chartTranslationService')
], TitlePanel.prototype, "chartTranslationService", void 0);
__decorate([
    PostConstruct
], TitlePanel.prototype, "init", null);
