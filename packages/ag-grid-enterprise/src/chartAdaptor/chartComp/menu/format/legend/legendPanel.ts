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
import {Chart, LegendPosition} from "../../../../../charts/chart/chart";
import {ChartLabelPanelParams, LabelPanel} from "../label/labelPanel";

export class LegendPanel extends Component {

    public static TEMPLATE =
        `<div>  
            <ag-group-component ref="legendGroup">
                <div>
                    <label ref="legendPositionLabel" style="margin-right: 5px;"></label>
                    <select ref="legendPositionSelect" style="flex: 1 1 auto"></select>
                </div>
                <ag-input-text-field ref="legendPaddingInput"></ag-input-text-field>
                <ag-input-text-field ref="markerSizeInput"></ag-input-text-field>
                <ag-input-text-field ref="markerStrokeInput"></ag-input-text-field>
                <ag-input-text-field ref="markerPaddingInput"></ag-input-text-field>
                <ag-input-text-field ref="itemPaddingXInput"></ag-input-text-field>
                <ag-input-text-field ref="itemPaddingYInput"></ag-input-text-field>
                
            </ag-group-component>
        </div>`;

    @RefSelector('legendGroup') private legendGroup: AgGroupComponent;
    @RefSelector('cbLegendEnabled') private cbLegendEnabled: AgCheckbox;

    @RefSelector('legendPositionSelect') private legendPositionSelect: HTMLSelectElement;
    @RefSelector('legendPositionLabel') private legendPositionLabel: HTMLElement;

    @RefSelector('legendPaddingInput') private legendPaddingInput: AgInputTextField;
    @RefSelector('markerSizeInput') private markerSizeInput: AgInputTextField;
    @RefSelector('markerStrokeInput') private markerStrokeInput: AgInputTextField;
    @RefSelector('markerPaddingInput') private markerPaddingInput: AgInputTextField;
    @RefSelector('itemPaddingXInput') private itemPaddingXInput: AgInputTextField;
    @RefSelector('itemPaddingYInput') private itemPaddingYInput: AgInputTextField;

    private readonly chartController: ChartController;
    private chart: Chart;
    private activePanels: Component[] = [];

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        this.setTemplate(LegendPanel.TEMPLATE);

        const chartProxy = this.chartController.getChartProxy();
        this.chart = chartProxy.getChart();

        this.initLegendGroup();
        this.initLegendPosition();
        this.initLegendPadding();
        this.initLegendItems();
        this.initLabelPanel();
    }

    private initLegendGroup() {
        this.legendGroup
            .setTitle('Legend')
            .setEnabled(this.chart.legend.enabled)
            .onEnableChange(enabled => this.chart.legend.enabled = enabled);
    }

    private initLegendPosition() {
        this.legendPositionLabel.innerHTML = 'Position:';

        const positions: LegendPosition[] = ['top', 'right', 'bottom', 'left'];

        positions.forEach((position: any) => {
            const option = document.createElement('option');
            option.value = position;
            option.text = position.charAt(0).toUpperCase() + position.slice(1);
            this.legendPositionSelect.appendChild(option);
        });

        this.legendPositionSelect.selectedIndex = positions.indexOf(this.chart.legendPosition);
        this.addDestroyableEventListener(this.legendPositionSelect, 'input', () => {
            this.chart.legendPosition = positions[this.legendPositionSelect.selectedIndex];
        });
    }

    private initLegendPadding() {
        this.legendPaddingInput
            .setLabel('Padding')
            .setLabelWidth('flex')
            .setInputWidth(30)
            .setValue(`${this.chart.legendPadding}`)
            .onInputChange(newValue => this.chart.legendPadding = newValue);
    }

    private initLegendItems() {
        type LegendOptions = 'markerSize' | 'markerStrokeWidth' | 'markerPadding' | 'itemPaddingX' | 'itemPaddingY';

        const initInput = (property: LegendOptions, input: AgInputTextField, label: string, initialValue: string) => {
            input.setLabel(label)
                .setLabelWidth('flex')
                .setInputWidth(30)
                .setValue(initialValue)
                .onInputChange(newValue => this.chart.legend[property] = newValue)
        };

        const initialMarkerSize = `${this.chart.legend.markerSize}`;
        initInput('markerSize', this.markerSizeInput, 'Marker Size', initialMarkerSize);

        const initialMarkerStroke = `${this.chart.legend.markerStrokeWidth}`;
        initInput('markerStrokeWidth', this.markerStrokeInput, 'Marker Stroke', initialMarkerStroke);

        const initialMarkerPadding = `${this.chart.legend.markerPadding}`;
        initInput('markerPadding', this.markerPaddingInput, 'Marker Padding', initialMarkerPadding);

        const initialItemPaddingX = `${this.chart.legend.itemPaddingX}`;
        initInput('itemPaddingX', this.itemPaddingXInput, 'Item Padding X', initialItemPaddingX);

        const initialItemPaddingY = `${this.chart.legend.itemPaddingY}`;
        initInput('itemPaddingY', this.itemPaddingYInput, 'Item Padding Y', initialItemPaddingY);
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

        const labelPanelComp = new LabelPanel(params);
        this.getContext().wireBean(labelPanelComp);
        this.legendGroup.addItem(labelPanelComp);
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