import { _, Autowired, Component, PostConstruct } from "@ag-grid-community/core";
import { Font, FontPanel, FontPanelParams } from "../fontPanel";
import { ChartTranslationService } from "../../../services/chartTranslationService";
import { ChartOptionsService } from "../../../services/chartOptionsService";

export default class TitlePanel extends Component {

    public static TEMPLATE = /* html */ `<div></div>`;

    @Autowired('chartTranslationService') private chartTranslationService: ChartTranslationService;

    private activePanels: Component[] = [];
    private titlePlaceholder: string;

    constructor(private readonly chartOptionsService: ChartOptionsService) {
        super(TitlePanel.TEMPLATE);
    }

    @PostConstruct
    private init() {
        this.initFontPanel();
        this.titlePlaceholder = this.chartTranslationService.translate('titlePlaceholder');
    }

    private hasTitle(): boolean {
        const title: any = this.getOption('title');
        const hasTitle = title && title.enabled && title.text && title.text.length > 0;
        return hasTitle ? true : false;
    }

    private initFontPanel(): void {
        const hasTitle = this.hasTitle();

        const setFont = (font: Font, isSilent?: boolean) => {
            if (font.family) { this.setOption('title.fontFamily', font.family, isSilent); }
            if (font.weight) { this.setOption('title.fontWeight', font.weight, isSilent); }
            if (font.style) { this.setOption('title.fontStyle', font.style, isSilent); }
            if (font.size) { this.setOption('title.fontSize', font.size, isSilent); }
            if (font.color) { this.setOption('title.color', font.color, isSilent); }
        };

        const initialFont = {
            family: this.getOption('title.fontFamily'),
            style: this.getOption('title.fontStyle'),
            weight: this.getOption('title.fontWeight'),
            size: this.getOption<number>('title.fontSize'),
            color: this.getOption('title.color')
        };

        if (!hasTitle) {
            setFont(initialFont, true);
        }

        const fontPanelParams: FontPanelParams = {
            name: this.chartTranslationService.translate('title'),
            enabled: hasTitle,
            suppressEnabledCheckbox: false,
            initialFont,
            setFont,
            setEnabled: (enabled) => {
                this.setOption('title.enabled', enabled);
                const currentTitleText = this.getOption('title.text');
                const replaceableTitleText = currentTitleText === 'Title' || currentTitleText?.trim().length === 0;
                if (enabled && replaceableTitleText) {
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

    private getOption<T = string>(expression: string): T {
        return this.chartOptionsService.getChartOption(expression);
    }

    private setOption(property: string, value: any, isSilent?: boolean): void {
        this.chartOptionsService.setChartOption(property, value, isSilent);
    }

    private destroyActivePanels(): void {
        this.activePanels.forEach(panel => {
            _.removeFromParent(panel.getGui());
            this.destroyBean(panel);
        });
    }

    protected destroy(): void {
        this.destroyActivePanels();
        super.destroy();
    }
}
