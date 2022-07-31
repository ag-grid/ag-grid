var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, Component, PostConstruct } from "@ag-grid-community/core";
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
        const hasTitle = this.hasTitle;
        const setFont = (font) => {
            if (font.family) {
                this.setOption('title.fontFamily', font.family);
            }
            if (font.weight) {
                this.setOption('title.fontWeight', font.weight);
            }
            if (font.style) {
                this.setOption('title.fontStyle', font.style);
            }
            if (font.size) {
                this.setOption('title.fontSize', font.size);
            }
            if (font.color) {
                this.setOption('title.color', font.color);
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
            setFont(initialFont);
        }
        const fontPanelParams = {
            name: this.chartTranslationService.translate('title'),
            enabled: this.hasTitle(),
            suppressEnabledCheckbox: false,
            initialFont,
            setFont,
            setEnabled: (enabled) => {
                this.setOption('title.enabled', enabled);
                const currentTitleText = this.getOption('title.text');
                if (enabled && currentTitleText === 'Title') {
                    this.setOption('title.text', this.titlePlaceholder);
                }
            }
        };
        const fontPanelComp = this.createBean(new FontPanel(fontPanelParams));
        this.getGui().appendChild(fontPanelComp.getGui());
        this.activePanels.push(fontPanelComp);
        // edits to the title can disable it, so keep the checkbox in sync:
        this.addManagedListener(this.eventService, 'chartTitleEdit', () => {
            fontPanelComp.setEnabled(this.hasTitle());
        });
    }
    getOption(expression) {
        return this.chartOptionsService.getChartOption(expression);
    }
    setOption(property, value) {
        this.chartOptionsService.setChartOption(property, value);
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
