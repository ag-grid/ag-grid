var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, AgSlider, Autowired, Component, PostConstruct } from "@ag-grid-community/core";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGl0bGVQYW5lbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydHMvY2hhcnRDb21wL21lbnUvZm9ybWF0L2NoYXJ0L3RpdGxlUGFuZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUNILENBQUMsRUFDRCxRQUFRLEVBQ1IsU0FBUyxFQUVULFNBQVMsRUFFVCxhQUFhLEVBRWhCLE1BQU0seUJBQXlCLENBQUM7QUFDakMsT0FBTyxFQUFRLFNBQVMsRUFBbUIsTUFBTSxjQUFjLENBQUM7QUFJaEUsTUFBTSxDQUFDLE9BQU8sT0FBTyxVQUFXLFNBQVEsU0FBUztJQVM3QyxZQUE2QixtQkFBd0M7UUFDakUsS0FBSyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQURGLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBcUI7UUFIN0QsaUJBQVksR0FBZ0IsRUFBRSxDQUFDO0lBS3ZDLENBQUM7SUFHTyxJQUFJO1FBQ1IsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDdkYsQ0FBQztJQUVPLFFBQVE7UUFDWixNQUFNLEtBQUssR0FBUSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzNDLE9BQU8sS0FBSyxJQUFJLEtBQUssQ0FBQyxPQUFPLElBQUksS0FBSyxDQUFDLElBQUksSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7SUFDekUsQ0FBQztJQUVPLGFBQWE7UUFDakIsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBRWpDLE1BQU0sT0FBTyxHQUFHLENBQUMsSUFBVSxFQUFFLFFBQWtCLEVBQUUsRUFBRTtZQUMvQyxJQUFJLElBQUksQ0FB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