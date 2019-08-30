import {
    _,
    AgGroupComponent,
    AgInputTextArea,
    Autowired,
    Component,
    PostConstruct,
    RefSelector
} from "ag-grid-community";
import {ChartController} from "../../../chartController";
import {Chart} from "../../../../../charts/chart/chart";
import {PaddingPanel} from "./paddingPanel";
import {LabelFont, LabelPanel, LabelPanelParams} from "../label/labelPanel";
import {Caption} from "../../../../../charts/caption";
import {ChartTranslator} from "../../../chartTranslator";
import {ChartProxy} from "../../../chartProxies/chartProxy";

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

    private chart: Chart;
    private chartProxy: ChartProxy<any>;
    private activePanels: Component[] = [];
    private readonly chartController: ChartController;

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
        this.chartProxy = this.chartController.getChartProxy();
        this.chart = this.chartProxy.getChart();
    }

    @PostConstruct
    private init() {
        this.setTemplate(ChartPanel.TEMPLATE);

        this.initGroup();
        this.initTitles();
        this.initPaddingPanel();
    }

    private initGroup(): void {
        this.chartGroup
            .setTitle(this.chartTranslator.translate('chart'))
            .toggleGroupExpand(false)
            .hideEnabledCheckbox(true);
    }

    private initTitles(): void {
        const title = this.chart.title ? this.chart.title.text : '';

        const initialFont = {
            family: this.chart.title ? this.chartProxy.getTitleProperty('fontFamily') : 'Verdana, sans-serif',
            style: this.chart.title ? this.chartProxy.getTitleProperty('fontStyle') : '',
            weight: this.chart.title ? this.chartProxy.getTitleProperty('fontWeight') : 'Normal',
            size: this.chart.title ? parseInt(this.chartProxy.getTitleProperty('fontSize')) : 22,
            color: this.chart.title ? this.chartProxy.getTitleProperty('color') : 'black'
        };

        // note we don't set the font style via chart title panel
        const setFont = (font: LabelFont) => {
            if (font.family) { this.chartProxy.setTitleProperty('fontFamily', font.family); }
            if (font.weight) { this.chartProxy.setTitleProperty('fontWeight', font.weight); }
            if (font.size) { this.chartProxy.setTitleProperty('fontSize', font.size); }
            if (font.color) { this.chartProxy.setTitleProperty('color', font.color); }
        };

        this.titleInput
            .setLabel(this.chartTranslator.translate('title'))
            .setLabelAlignment('top')
            .setLabelWidth('flex')
            .setValue(title)
            .onValueChange(newValue => {
                if (!this.chart.title) {
                    this.chart.title = Caption.create({text: title});
                    setFont(initialFont);
                }

                const currentCaption = this.chart.title as Caption;
                currentCaption.text = newValue;
                this.chart.title = currentCaption;

                // only show font panel when title exists
                labelPanelComp.setEnabled(_.exists(this.chart.title.text));
            });

        const params: LabelPanelParams = {
            name: this.chartTranslator.translate('font'),
            enabled: true,
            suppressEnabledCheckbox: true,
            initialFont: initialFont,
            setFont: setFont
        };

        const labelPanelComp = new LabelPanel(params);
        this.getContext().wireBean(labelPanelComp);
        this.chartGroup.addItem(labelPanelComp);
        this.activePanels.push(labelPanelComp);

        labelPanelComp.setEnabled(_.exists(title));
    }

    private initPaddingPanel(): void {
        const paddingPanelComp = new PaddingPanel(this.chartController);
        this.getContext().wireBean(paddingPanelComp);
        this.chartGroup.addItem(paddingPanelComp);
        this.activePanels.push(paddingPanelComp);
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
