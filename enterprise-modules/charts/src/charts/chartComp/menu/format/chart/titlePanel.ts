import { _, Autowired, Component, FontStyle, FontWeight, PostConstruct } from "@ag-grid-community/core";
import { ChartController } from "../../../chartController";
import { Font, FontPanel, FontPanelParams } from "../fontPanel";
import { ChartTranslator } from "../../../chartTranslator";

export default class TitlePanel extends Component {

    public static TEMPLATE = /* html */ `<div></div>`;

    @Autowired('chartTranslator') private chartTranslator: ChartTranslator;

    private activePanels: Component[] = [];
    private readonly chartController: ChartController;

    // When the title is disabled, and then re-enabled, we want the same title to be
    // present in the chart. It is kept here so it can later be restored.
    private disabledTitle: string;

    constructor(chartController: ChartController) {
        super(TitlePanel.TEMPLATE);
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        this.initFontPanel();
    }

    private hasTitle(): boolean {
        const chartProxy = this.chartController.getChartProxy();
        const title: any = chartProxy.getChartOption('title');

        return title && title.enabled && title.text && title.text.length > 0;
    }

    private initFontPanel(): void {
        const chartProxy = this.chartController.getChartProxy();
        const hasTitle = this.hasTitle;

        const setFont = (font: Font) => {
            const proxy = this.chartController.getChartProxy();

            if (font.family) { proxy.setTitleOption('fontFamily', font.family); }
            if (font.weight) { proxy.setTitleOption('fontWeight', font.weight); }
            if (font.style) { proxy.setTitleOption('fontStyle', font.style); }
            if (font.size) { proxy.setTitleOption('fontSize', font.size); }
            if (font.color) { proxy.setTitleOption('color', font.color); }
        };

        const initialFont = {
            family: chartProxy.getChartOption('title.fontFamily'),
            style: chartProxy.getChartOption<FontStyle>('title.fontStyle'),
            weight: chartProxy.getChartOption<FontWeight>('title.fontWeight'),
            size: chartProxy.getChartOption<number>('title.fontSize'),
            color: chartProxy.getChartOption('title.color')
        };

        if (!hasTitle) {
            setFont(initialFont);
        }

        const fontPanelParams: FontPanelParams = {
            name: this.chartTranslator.translate('title'),
            enabled: this.hasTitle(),
            suppressEnabledCheckbox: false,
            initialFont,
            setFont,
            setEnabled: (enabled) => {
                const proxy = this.chartController.getChartProxy();

                if (enabled) {
                    const newTitle = this.disabledTitle || this.chartTranslator.translate('titlePlaceholder');
                    proxy.setTitleOption('text', newTitle);
                    this.disabledTitle = '';
                } else {
                    this.disabledTitle = proxy.getTitleOption('text');
                    proxy.setTitleOption('text', '');
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
