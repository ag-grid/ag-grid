import {
    _,
    AgCheckbox,
    AgGroupComponent,
    AgInputTextField,
    Component,
    PostConstruct,
    RefSelector
} from "ag-grid-community";
import {ChartController} from "../../../chartController";
import {PieSeries} from "../../../../../charts/chart/series/pieSeries";
import {ShadowPanel} from "./shadowPanel";
import {ChartLabelPanelParams, LabelPanel} from "../label/labelPanel";

export class PieSeriesPanel extends Component {

    public static TEMPLATE =
        `<div>   
            <ag-group-component ref="seriesGroup">
                <ag-checkbox ref="seriesTooltipsCheckbox"></ag-checkbox>
                <ag-input-text-field ref="seriesStrokeWidthInput"></ag-input-text-field>
                <ag-group-component ref="seriesCalloutLabel">
                    <ag-input-text-field ref="seriesCalloutLengthInput"></ag-input-text-field>
                    <ag-input-text-field ref="seriesCalloutStrokeWidthInput"></ag-input-text-field>
                    <ag-input-text-field ref="seriesLabelOffsetInput"></ag-input-text-field>
                </ag-group-component>
            </ag-group-component>
        </div>`;

    @RefSelector('seriesGroup') private seriesGroup: AgGroupComponent;
    @RefSelector('seriesTooltipsCheckbox') private seriesTooltipsCheckbox: AgCheckbox;
    @RefSelector('seriesStrokeWidthInput') private seriesStrokeWidthInput: AgInputTextField;

    @RefSelector('seriesCalloutLabel') private seriesCalloutLabel: AgGroupComponent;
    @RefSelector('seriesCalloutLengthInput') private seriesCalloutLengthInput: AgInputTextField;
    @RefSelector('seriesCalloutStrokeWidthInput') private seriesCalloutStrokeWidthInput: AgInputTextField;
    @RefSelector('seriesLabelOffsetInput') private seriesLabelOffsetInput: AgInputTextField;

    private readonly chartController: ChartController;

    private activePanels: Component[] = [];
    private series: PieSeries[];

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        this.setTemplate(PieSeriesPanel.TEMPLATE);

        const chartProxy = this.chartController.getChartProxy();
        this.series = chartProxy.getChart().series as PieSeries[];

        this.seriesGroup
            .setTitle('Series')
            .hideEnabledCheckbox(true);

        this.initSeriesTooltips();
        this.initSeriesStrokeWidth();
        this.initLabelPanel();

        this.initCalloutOptions();

        // init shadow panel
        const shadowPanelComp = new ShadowPanel(this.chartController);
        this.getContext().wireBean(shadowPanelComp);
        this.seriesGroup.getGui().appendChild(shadowPanelComp.getGui());
        this.activePanels.push(shadowPanelComp);
    }

    private initSeriesTooltips() {
        const selected = this.series.some(s => s.tooltipEnabled);

        this.seriesTooltipsCheckbox
            .setLabel('Tooltips')
            .setSelected(selected)
            .onSelectionChange(newSelection => {
                this.series.forEach(s => s.tooltipEnabled = newSelection);
            });
    }

    private initSeriesStrokeWidth() {
        this.seriesStrokeWidthInput
            .setLabel('Stroke Width')
            .setValue(`${this.series[0].strokeWidth}`)
            .onInputChange(newValue => this.series.forEach(s => s.strokeWidth = newValue));
    }

    private initLabelPanel() {
        const params: ChartLabelPanelParams = {
            chartController: this.chartController,
            enabled: this.series.some(s => s.labelEnabled),
            setEnabled: (enabled: boolean) => {
                this.series.forEach(s => s.labelEnabled = enabled);
            },
            getFont: () =>  this.series[0].labelFont,
            setFont: (font: string) => {
                this.series.forEach(s => s.labelFont = font);
            },
            getColor: () => this.series[0].labelColor,
            setColor: (color: string) => {
                this.series.forEach(s => s.labelColor = color);
            }
        };

        const labelPanelComp = new LabelPanel(params);
        this.getContext().wireBean(labelPanelComp);
        this.seriesGroup.getGui().appendChild(labelPanelComp.getGui());
        this.activePanels.push(labelPanelComp);
    }

    private initCalloutOptions() {
        this.seriesCalloutLabel.setTitle('Callout');

        type CalloutProperty = 'calloutLength' | 'calloutStrokeWidth' | 'labelOffset';

        const initInput = (property: CalloutProperty, input: AgInputTextField, label: string, initialValue: string) => {
            input.setLabel(label)
                .setLabelWidth(80)
                .setWidth(115)
                .setValue(initialValue)
                .onInputChange(newValue => this.series.forEach(s => s[property] = newValue));
        };

        const initialLength = `${this.series[0].calloutLength}`;
        initInput('calloutLength', this.seriesCalloutLengthInput, 'Length', initialLength);

        const initialStrokeWidth = `${this.series[0].calloutStrokeWidth}`;
        initInput('calloutStrokeWidth', this.seriesCalloutStrokeWidthInput, 'Stroke Width', initialStrokeWidth);

        const initialOffset = `${this.series[0].labelOffset}`;
        initInput('labelOffset', this.seriesLabelOffsetInput, 'Offset', initialOffset);
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