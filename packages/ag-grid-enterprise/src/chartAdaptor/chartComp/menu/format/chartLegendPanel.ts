import {
    _,
    AgCheckbox,
    AgGroupComponent,
    AgInputTextField,
    Component,
    PostConstruct,
    RefSelector
} from "ag-grid-community";
import {ChartController} from "../../chartController";
import {Chart, LegendPosition} from "../../../../charts/chart/chart";
import {ChartLabelPanel, ChartLabelPanelParams} from "./chartLabelPanel";

export class ChartLegendPanel extends Component {

    public static TEMPLATE =
        `<div>  
            <ag-group-component ref="labelLegend">
                <ag-checkbox ref="cbLegendEnabled"></ag-checkbox>
    
                <div>
                    <label ref="labelLegendPosition" style="margin-right: 5px;"></label>
                    <select ref="selectLegendPosition" style="width: 80px"></select>
                </div>

                <ag-input-text-field ref="inputLegendPadding"></ag-input-text-field>
                <ag-input-text-field ref="inputMarkerSize"></ag-input-text-field>
                <ag-input-text-field ref="inputMarkerStroke"></ag-input-text-field>
                <ag-input-text-field ref="inputMarkerPadding"></ag-input-text-field>
                <ag-input-text-field ref="inputItemPaddingX"></ag-input-text-field>
                <ag-input-text-field ref="inputItemPaddingY"></ag-input-text-field>
            </ag-group-component>
        </div>`;

    @RefSelector('labelLegend') private labelLegend: AgGroupComponent;
    @RefSelector('cbLegendEnabled') private cbLegendEnabled: AgCheckbox;

    @RefSelector('selectLegendPosition') private selectLegendPosition: HTMLSelectElement;
    @RefSelector('labelLegendPosition') private labelLegendPosition: HTMLElement;

    @RefSelector('inputLegendPadding') private inputLegendPadding: AgInputTextField;
    @RefSelector('inputMarkerSize') private inputMarkerSize: AgInputTextField;
    @RefSelector('inputMarkerStroke') private inputMarkerStroke: AgInputTextField;
    @RefSelector('inputMarkerPadding') private inputMarkerPadding: AgInputTextField;
    @RefSelector('inputItemPaddingX') private inputItemPaddingX: AgInputTextField;
    @RefSelector('inputItemPaddingY') private inputItemPaddingY: AgInputTextField;

    private readonly chartController: ChartController;
    private chart: Chart;
    private activePanels: Component[] = [];

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        this.setTemplate(ChartLegendPanel.TEMPLATE);

        const chartProxy = this.chartController.getChartProxy();
        this.chart = chartProxy.getChart();

        this.initLegendItems();
        this.initLabelPanel();
    }

    private initLegendItems() {
        this.labelLegend.setLabel('Legend');

        // TODO update code below when this.chart.showLegend is available
        const enabled = _.every(this.chart.series, (series) => series.showInLegend && series.visible);
        this.cbLegendEnabled.setSelected(enabled);
        this.cbLegendEnabled.setLabel('Enabled');
        this.addDestroyableEventListener(this.cbLegendEnabled, 'change', () => {
            this.chart.legend.enabled = this.cbLegendEnabled.isSelected();
        });

        this.labelLegendPosition.innerHTML = 'Position:';

        const positions: LegendPosition[] = ['top', 'right', 'bottom', 'left'];

        positions.forEach((position: any) => {
            const option = document.createElement('option');
            option.value = position;
            option.text = position.charAt(0).toUpperCase() + position.slice(1);
            this.selectLegendPosition.appendChild(option);
        });

        this.selectLegendPosition.selectedIndex = positions.indexOf(this.chart.legendPosition);
        this.addDestroyableEventListener(this.selectLegendPosition, 'input', () => {
            this.chart.legendPosition = positions[this.selectLegendPosition.selectedIndex];
        });

        this.inputLegendPadding
            .setLabel('Padding')
            .setLabelWidth(95)
            .setWidth(130)
            .setValue(`${this.chart.legendPadding}`);

        this.addDestroyableEventListener(this.inputLegendPadding.getInputElement(), 'input', () => {
            this.chart.legendPadding = Number.parseInt(this.inputLegendPadding.getValue());
        });

        type LegendOptions = 'markerSize' | 'markerStrokeWidth' | 'markerPadding' | 'itemPaddingX' | 'itemPaddingY';
        type LegendConfig = {
            [key in LegendOptions] : [string, string, AgInputTextField];
        }

        const configs: LegendConfig = {
            markerSize: ['Marker Size', `${this.chart.legend.markerSize}`, this.inputMarkerSize],
            markerStrokeWidth: ['Marker Stroke', `${this.chart.legend.markerStrokeWidth}`, this.inputMarkerStroke],
            markerPadding: ['Marker Padding', `${this.chart.legend.markerPadding}`, this.inputMarkerPadding],
            itemPaddingX: ['Item Padding X', `${this.chart.legend.itemPaddingX}`, this.inputItemPaddingX],
            itemPaddingY: ['Item Padding Y', `${this.chart.legend.itemPaddingX}`, this.inputItemPaddingY]
        };

        Object.keys(configs).forEach(config => {
            const [ label, value, field ] = configs[config as LegendOptions];

            field.setLabel(label)
                .setLabelWidth(95)
                .setWidth(130)
                .setValue(value);
            this.addDestroyableEventListener(field.getInputElement(), 'input', () => {
                this.chart.legend[config as LegendOptions] = parseInt(field.getValue(), 10);
            });
        });
    }

    private initLabelPanel() {
        const params: ChartLabelPanelParams = {
            chartController: this.chartController,
            getFont: () => this.chart.legend.labelFont,
            setFont: (font: string) => {
                this.chart.legend.labelFont = font;
                this.chart.performLayout();
            },
            getColor: () => this.chart.legend.labelColor,
            setColor: (color: string) => {
                this.chart.legend.labelColor = color;
                this.chart.performLayout();
            }
        };

        const labelPanelComp = new ChartLabelPanel(params);
        this.getContext().wireBean(labelPanelComp);
        this.labelLegend.getGui().appendChild(labelPanelComp.getGui());
        this.activePanels.push(labelPanelComp);
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