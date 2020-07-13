import {
    _,
    Autowired,
    Component,
    EventService,
    FontStyle,
    FontWeight,
    PostConstruct
} from "@ag-grid-community/core";
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
        const title: any = chartProxy.getChartOption('title'); // TODO: fix this
        const text = title && title.text ? title.text : '';

        return _.exists(text);
    }

    private initFontPanel(): void {
        const chartProxy = this.chartController.getChartProxy();
        const hasTitle = this.hasTitle;

        const setFont = (font: Font) => {
            const chartProxy = this.chartController.getChartProxy();

            if (font.family) { chartProxy.setTitleOption('fontFamily', font.family); }
            if (font.weight) { chartProxy.setTitleOption('fontWeight', font.weight); }
            if (font.style) { chartProxy.setTitleOption('fontStyle', font.style); }
            if (font.size) { chartProxy.setTitleOption('fontSize', font.size); }
            if (font.color) { chartProxy.setTitleOption('color', font.color); }
        };

        const initialFont = {
            family: hasTitle ? chartProxy.getChartOption('title.fontFamily') : 'Verdana, sans-serif',
            style: hasTitle ? chartProxy.getChartOption<FontStyle>('title.fontStyle') : undefined,
            weight: hasTitle ? chartProxy.getChartOption<FontWeight>('title.fontWeight') : undefined,
            size: hasTitle ? chartProxy.getChartOption<number>('title.fontSize') : 22,
            color: hasTitle ? chartProxy.getChartOption('title.color') : 'black'
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
                const chartProxy = this.chartController.getChartProxy();

                if (enabled) {
                    const newTitle = this.disabledTitle || this.chartTranslator.translate('titlePlaceholder');
                    chartProxy.setTitleOption('text', newTitle);
                    this.disabledTitle = '';
                } else {
                    this.disabledTitle = this.chartController.getChartProxy().getTitleOption('text');
                    chartProxy.setTitleOption('text', '');
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
