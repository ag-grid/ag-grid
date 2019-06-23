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
            <ag-group-component ref="labelLegendGroup">
                <!-- TODO Fix styling -->   
                <div style="padding-left: 12px">
                    <label ref="labelLegendPosition"></label>
                    <select ref="selectLegendPosition" style="width: 70px"></select>
                </div>
                
                <!-- TODO Fix styling -->   
                <ag-input-text-field ref="inputLegendPadding" style="padding-left: 12px"></ag-input-text-field>
                <ag-input-text-field ref="inputMarkerSize" style="padding-left: 12px"></ag-input-text-field>
                <ag-input-text-field ref="inputMarkerStroke" style="padding-left: 12px"></ag-input-text-field>
                <ag-input-text-field ref="inputMarkerPadding" style="padding-left: 12px"></ag-input-text-field>
                <ag-input-text-field ref="inputItemPaddingX" style="padding-left: 12px"></ag-input-text-field>
                <ag-input-text-field ref="inputItemPaddingY" style="padding-left: 12px"></ag-input-text-field>
                
            </ag-group-component>
        </div>`;

    @RefSelector('labelLegendGroup') private labelLegendGroup: AgGroupComponent;
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

        this.initLegendGroup();
        this.initLegendPosition();
        this.initLegendPadding();
        this.initLegendItems();
        this.initLabelPanel();
    }

    private initLegendGroup() {
        this.labelLegendGroup
            .setTitle('Legend')
            .setEnabled(this.chart.legend.enabled)
            .onEnableChange(enabled => this.chart.legend.enabled = enabled);
    }

    private initLegendPosition() {
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
    }

    private initLegendPadding() {
        this.inputLegendPadding
            .setLabel('Padding')
            .setLabelWidth(95)
            .setWidth(130)
            .setValue(`${this.chart.legendPadding}`)
            .onInputChange(newValue => this.chart.legendPadding = newValue);
    }

    private initLegendItems() {
        type LegendOptions = 'markerSize' | 'markerStrokeWidth' | 'markerPadding' | 'itemPaddingX' | 'itemPaddingY';

        const initInput = (property: LegendOptions, input: AgInputTextField, label: string, initialValue: string) => {
            input.setLabel(label)
                .setLabelWidth(95)
                .setWidth(130)
                .setValue(initialValue)
                .onInputChange(newValue => this.chart.legend[property] = newValue)
        };

        const initialMarkerSize = `${this.chart.legend.markerSize}`;
        initInput('markerSize', this.inputMarkerSize, 'Marker Size', initialMarkerSize);

        const initialMarkerStroke = `${this.chart.legend.markerStrokeWidth}`;
        initInput('markerStrokeWidth', this.inputMarkerStroke, 'Marker Stroke', initialMarkerStroke);

        const initialMarkerPadding = `${this.chart.legend.markerPadding}`;
        initInput('markerPadding', this.inputMarkerPadding, 'Marker Padding', initialMarkerPadding);

        const initialItemPaddingX = `${this.chart.legend.itemPaddingX}`;
        initInput('itemPaddingX', this.inputItemPaddingX, 'Item Padding X', initialItemPaddingX);

        const initialItemPaddingY = `${this.chart.legend.itemPaddingY}`;
        initInput('itemPaddingY', this.inputItemPaddingY, 'Item Padding Y', initialItemPaddingY);
    }

    private initLabelPanel() {
        const params: ChartLabelPanelParams = {
            chartController: this.chartController,
            enabled: true,
            suppressEnabledCheckbox: true,
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
        this.labelLegendGroup.addItem(labelPanelComp);
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