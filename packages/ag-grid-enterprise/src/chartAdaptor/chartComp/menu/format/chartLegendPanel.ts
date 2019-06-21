import {_, AgCheckbox, AgGroupComponent, Component, PostConstruct, RefSelector, AgInputTextField, AgColorPicker} from "ag-grid-community";
import {ChartController} from "../../chartController";
import {Chart, LegendPosition} from "../../../../charts/chart/chart";

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
    

                <ag-group-component ref="labelLegendLabels">
                    <select ref="selectLegendFont"></select>
                    <div class="ag-group-subgroup">
                        <select ref="selectLegendFontWeight"></select>
                        <ag-input-text-field ref="inputLegendFontSize"></ag-input-text-field>
                    </div>
                    <ag-color-picker ref="inputLegendLabelColor"></ag-color-picker>
                </ag-group-component>
    
                <!-- LEGEND LABELS -->
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

    @RefSelector('labelLegendLabels') private labelLegendLabels: AgGroupComponent;
    @RefSelector('selectLegendFont') private selectLegendFont: HTMLSelectElement;
    @RefSelector('selectLegendFontWeight') private selectLegendFontWeight: HTMLSelectElement;
    @RefSelector('inputLegendFontSize') private inputLegendFontSize: AgInputTextField;
    @RefSelector('inputLegendLabelColor') private inputLegendLabelColor: AgColorPicker;

    private readonly chartController: ChartController;
    private chart: Chart;

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
        this.initLegendLabels();
    }

    private initLegendItems() {
        this.labelLegend.setLabel('Legend');

        // TODO update code below when this.chart.showLegend is available
        let enabled = _.every(this.chart.series, (series) => series.showInLegend && series.visible);
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
        }

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

    private initLegendLabels() {
        this.labelLegendLabels.setLabel('Labels');

        const fonts = ['Verdana, sans-serif', 'Arial'];
        fonts.forEach((font: any) => {
            const option = document.createElement('option');
            option.value = font;
            option.text = font;
            this.selectLegendFont.appendChild(option);
        });

        const fontParts = this.chart.legend.labelFont.split('px');
        const fontSize = fontParts[0];
        const font = fontParts[1].trim();

        this.selectLegendFont.selectedIndex = fonts.indexOf(font);

        this.addDestroyableEventListener(this.selectLegendFont, 'input', () => {
            const fontSize = parseInt(this.inputLegendFontSize.getValue(), 10);
            const font = fonts[this.selectLegendFont.selectedIndex];
            this.chart.legend.labelFont = `${fontSize}px ${font}`;
            this.chart.performLayout();
        });

        const fontWeights = ['normal', 'bold'];
        fontWeights.forEach((font: any) => {
            const option = document.createElement('option');
            option.value = font;
            option.text = font;
            this.selectLegendFontWeight.appendChild(option);
        });

        // TODO
        // this.selectLegendFontWeight.selectedIndex = fonts.indexOf(font);
        // this.addDestroyableEventListener(this.selectLegendFontWeight, 'input', () => {
        //     const fontSize = Number.parseInt(this.selectLegendFontWeight.value);
        //     const font = fonts[this.selectLegendFontWeight.selectedIndex];
        //     this.chart.legend.labelFont = `bold ${fontSize}px ${font}`;
        //     this.chart.performLayout();
        // });


        this.inputLegendFontSize
            .setLabel('Size')
            .setWidth(70)
            .setValue(fontSize);
        this.addDestroyableEventListener(this.inputLegendFontSize.getInputElement(), 'input', () => {
            const fontSize = Number.parseInt(this.inputLegendFontSize.getValue());
            const font = fonts[this.selectLegendFont.selectedIndex];
            this.chart.legend.labelFont = `${fontSize}px ${font}`;
            this.chart.performLayout();
        });

        // TODO replace with Color Picker
        this.inputLegendLabelColor.setValue(this.chart.legend.labelColor);
        this.inputLegendLabelColor.addDestroyableEventListener(this.inputLegendLabelColor, 'valueChange', () => {
            this.chart.legend.labelColor = this.inputLegendLabelColor.getValue();
            this.chart.performLayout();
        });
    }

}
