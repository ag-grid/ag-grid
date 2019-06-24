import {
    _,
    AgCheckbox,
    AgGroupComponent,
    AgSlider,
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
                <ag-checkbox ref="cbLegendEnabled"></ag-checkbox>
                <div>
                    <label ref="legendPositionLabel" style="margin-right: 5px;"></label>
                    <select ref="legendPositionSelect" style="flex: 1 1 auto"></select>
                </div>
                
                <ag-slider ref="legendPaddingSlider"></ag-slider>
                <ag-slider ref="markerSizeSlider"></ag-slider>
                <ag-slider ref="markerStrokeSlider"></ag-slider>
                <ag-slider ref="markerPaddingSlider"></ag-slider>
                <ag-slider ref="itemPaddingXSlider"></ag-slider>
                <ag-slider ref="itemPaddingYSlider"></ag-slider>
                
            </ag-group-component>
        </div>`;

    @RefSelector('legendGroup') private legendGroup: AgGroupComponent;
    @RefSelector('cbLegendEnabled') private cbLegendEnabled: AgCheckbox;

    @RefSelector('legendPositionLabel') private legendPositionLabel: HTMLElement;
    @RefSelector('legendPositionSelect') private legendPositionSelect: HTMLSelectElement;

    @RefSelector('legendPaddingSlider') private legendPaddingSlider: AgSlider;
    @RefSelector('markerSizeSlider') private markerSizeSlider: AgSlider;
    @RefSelector('markerStrokeSlider') private markerStrokeSlider: AgSlider;
    @RefSelector('markerPaddingSlider') private markerPaddingSlider: AgSlider;
    @RefSelector('itemPaddingXSlider') private itemPaddingXSlider: AgSlider;
    @RefSelector('itemPaddingYSlider') private itemPaddingYSlider: AgSlider;

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
            .hideEnabledCheckbox(true);

        this.cbLegendEnabled
            .setLabel('Enabled')
            .setSelected(this.chart.legend.enabled)
            .onSelectionChange(newSelection => {
                this.chart.legend.enabled = newSelection;
            });
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

        this.legendPaddingSlider
            .setLabel('Padding')
            .setValue(`${this.chart.legendPadding}`)
            .onInputChange(newValue => this.chart.legendPadding = newValue);
    }

    private initLegendItems() {
        type LegendOptions = 'markerSize' | 'markerStrokeWidth' | 'markerPadding' | 'itemPaddingX' | 'itemPaddingY';

        const initInput = (property: LegendOptions, labelText: string,  input: AgSlider, initialValue: string) => {
            input.setLabel(labelText)
                 .setValue(initialValue)
                 .onInputChange(newValue => this.chart.legend[property] = newValue)
        };

        const initialMarkerSize = `${this.chart.legend.markerSize}`;
        initInput('markerSize','Marker Size', this.markerSizeSlider, initialMarkerSize);

        const initialMarkerStroke = `${this.chart.legend.markerStrokeWidth}`;
        initInput('markerStrokeWidth', 'Marker Stroke',this.markerStrokeSlider,  initialMarkerStroke);

        const initialMarkerPadding = `${this.chart.legend.markerPadding}`;
        initInput('markerPadding',  'Marker Padding', this.markerPaddingSlider, initialMarkerPadding);

        const initialItemPaddingX = `${this.chart.legend.itemPaddingX}`;
        initInput('itemPaddingX', 'Item Padding X', this.itemPaddingXSlider,  initialItemPaddingX);

        const initialItemPaddingY = `${this.chart.legend.itemPaddingY}`;
        initInput('itemPaddingY', 'Item Padding Y', this.itemPaddingYSlider,  initialItemPaddingY);
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