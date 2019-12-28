import {
    _,
    AgGroupComponent,
    AgInputTextArea,
    Autowired,
    Component,
    PostConstruct,
    RefSelector,
    FontStyle,
    FontWeight
} from "@ag-grid-community/core";
import { ChartController } from "../../../chartController";
import { PaddingPanel } from "./paddingPanel";
import { Font, FontPanel, FontPanelParams } from "../fontPanel";
import { ChartTranslator } from "../../../chartTranslator";
import { CaptionOptions } from "../../../../../charts/chartOptions";
import { BackgroundPanel } from "./backgroundPanel";

export class ChartPanel extends Component {

    public static TEMPLATE =
        `<div>
            <ag-group-component ref="chartGroup">
                <ag-input-text-area ref="titleInput"></ag-input-text-area>
            </ag-group-component>
        <div>`;

    @RefSelector('chartGroup') private chartGroup: AgGroupComponent;
    @RefSelector('titleInput') private titleInput: AgInputTextArea;

    @Autowired('chartTranslator') private chartTranslator: ChartTranslator;

    private activePanels: Component[] = [];
    private readonly chartController: ChartController;

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        this.setTemplate(ChartPanel.TEMPLATE);

        this.initGroup();
        this.initTitles();
        this.initPaddingPanel();
        this.initBackgroundPanel();
    }

    private initGroup(): void {
        this.chartGroup
            .setTitle(this.chartTranslator.translate('chart'))
            .toggleGroupExpand(false)
            .hideEnabledCheckbox(true);
    }

    private initTitles(): void {
        const chartProxy = this.chartController.getChartProxy();
        const title = chartProxy.getChartOption<CaptionOptions>('title');
        const text = title && title.text ? title.text : '';

        const setFont = (font: Font) => {
            const chartProxy = this.chartController.getChartProxy();

            if (font.family) { chartProxy.setTitleOption('fontFamily', font.family); }
            if (font.weight) { chartProxy.setTitleOption('fontWeight', font.weight); }
            if (font.style) { chartProxy.setTitleOption('fontStyle', font.style); }
            if (font.size) { chartProxy.setTitleOption('fontSize', font.size); }
            if (font.color) { chartProxy.setTitleOption('color', font.color); }
        };

        const initialFont = {
            family: title ? chartProxy.getChartOption('title.fontFamily') : 'Verdana, sans-serif',
            style: title ? chartProxy.getChartOption<FontStyle>('title.fontStyle') : undefined,
            weight: title ? chartProxy.getChartOption<FontWeight>('title.fontWeight') : undefined,
            size: title ? chartProxy.getChartOption<number>('title.fontSize') : 22,
            color: title ? chartProxy.getChartOption('title.color') : 'black'
        };

        if (!title) {
            setFont(initialFont);
        }

        this.titleInput
            .setLabel(this.chartTranslator.translate('title'))
            .setLabelAlignment('top')
            .setLabelWidth('flex')
            .setValue(text)
            .onValueChange(value => {
                this.chartController.getChartProxy().setTitleOption('text', value);

                // only show font panel when title exists
                fontPanelComp.setEnabled(_.exists(value));
            });

        const params: FontPanelParams = {
            name: this.chartTranslator.translate('font'),
            enabled: true,
            suppressEnabledCheckbox: true,
            initialFont,
            setFont,
        };

        const fontPanelComp = this.wireBean(new FontPanel(params));
        this.chartGroup.addItem(fontPanelComp);
        this.activePanels.push(fontPanelComp);

        fontPanelComp.setEnabled(_.exists(text));
    }

    private initPaddingPanel(): void {
        const paddingPanelComp = this.wireBean(new PaddingPanel(this.chartController));
        this.chartGroup.addItem(paddingPanelComp);
        this.activePanels.push(paddingPanelComp);
    }

    private initBackgroundPanel(): void {
        const backgroundPanelComp = this.wireBean(new BackgroundPanel(this.chartController));
        this.chartGroup.addItem(backgroundPanelComp);
        this.activePanels.push(backgroundPanelComp);
    }

    private destroyActivePanels(): void {
        this.activePanels.forEach(panel => {
            _.removeFromParent(panel.getGui());
            panel.destroy();
        });
    }

    public destroy(): void {
        this.destroyActivePanels();
        super.destroy();
    }
}
