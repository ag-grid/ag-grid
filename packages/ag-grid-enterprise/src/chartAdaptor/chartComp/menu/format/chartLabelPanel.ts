import {_, AgCheckbox, Component, PostConstruct, RefSelector, AgGroupComponent, AgInputTextField, AgColorPicker} from "ag-grid-community";
import {ChartController} from "../../chartController";
import {Chart} from "../../../../charts/chart/chart";
import {PieSeries} from "../../../../charts/chart/series/pieSeries";
import {BarSeries} from "../../../../charts/chart/series/barSeries";

export class ChartLabelPanel extends Component {

    public static TEMPLATE =
        `<div>                               
            <ag-group-component ref="labelSeriesLabels">
                <ag-checkbox ref="cbSeriesLabelsEnabled"></ag-checkbox>
                <select ref="selectSeriesFont"></select>
                <div class="ag-group-subgroup">
                    <select ref="selectSeriesFontWeight" style="width: 82px"></select>
                    <ag-input-text-field ref="inputSeriesFontSize"></ag-input-text-field>
                </div>
                <ag-color-picker ref="inputSeriesLabelColor"></ag-color-picker>
            </ag-group-component>                        
        </div>`;

    @RefSelector('labelSeriesLabels') private labelSeriesLabels: AgGroupComponent;
    @RefSelector('cbSeriesLabelsEnabled') private cbSeriesLabelsEnabled: AgCheckbox;

    @RefSelector('selectSeriesFont') private selectSeriesFont: HTMLSelectElement;
    @RefSelector('selectSeriesFontWeight') private selectSeriesFontWeight: HTMLSelectElement;
    @RefSelector('inputSeriesFontSize') private inputSeriesFontSize: AgInputTextField;
    @RefSelector('inputSeriesLabelColor') private inputSeriesLabelColor: AgColorPicker;

    private chartController: ChartController;
    private chart: Chart;
    private series: PieSeries[] | BarSeries[];

    constructor(chartController: ChartController) {
        super();

        this.chartController = chartController;

        const chartProxy = this.chartController.getChartProxy();
        this.chart = chartProxy.getChart();

        this.series = this.chart.series as PieSeries[] | BarSeries[];
    }

    @PostConstruct
    private init() {
        this.setTemplate(ChartLabelPanel.TEMPLATE);

        const chartProxy = this.chartController.getChartProxy();
        this.chart = chartProxy.getChart();

        this.initSeriesLabels();
    }

    private initSeriesLabels() {
        this.labelSeriesLabels.setLabel('Labels');

        let enabled = this.series.some((series: BarSeries | PieSeries)  => series.labelEnabled);
        this.cbSeriesLabelsEnabled.setLabel('Enabled');
        this.cbSeriesLabelsEnabled.setSelected(enabled);
        this.addDestroyableEventListener(this.cbSeriesLabelsEnabled, 'change', () => {
            this.series.forEach((series: BarSeries | PieSeries) => {
                series.labelEnabled = this.cbSeriesLabelsEnabled.isSelected();
            });
        });

        const fonts = ['Verdana, sans-serif', 'Arial'];
        fonts.forEach((font: any) => {
            const option = document.createElement('option');
            option.value = font;
            option.text = font;
            this.selectSeriesFont.appendChild(option);
        });

        const fontParts = this.series[0].labelFont.split('px');
        const fontSize = fontParts[0];
        const font = fontParts[1].trim();

        this.selectSeriesFont.selectedIndex = fonts.indexOf(font);

        this.addDestroyableEventListener(this.selectSeriesFont, 'input', () => {
            const font = fonts[this.selectSeriesFont.selectedIndex];
            const fontSize = Number.parseInt(this.inputSeriesFontSize.getValue());
            this.series.forEach((series: BarSeries | PieSeries) => {
                series.labelFont = `${fontSize}px ${font}`;
            });
        });

        const fontWeights = ['normal', 'bold'];
        fontWeights.forEach((font: any) => {
            const option = document.createElement('option');
            option.value = font;
            option.text = font;
            this.selectSeriesFontWeight.appendChild(option);
        });

        // TODO
        // this.selectLegendFontWeight.selectedIndex = fonts.indexOf(font);
        // this.addDestroyableEventListener(this.selectLegendFontWeight, 'input', () => {
        //     const fontSize = Number.parseInt(this.selectLegendFontWeight.value);
        //     const font = fonts[this.selectLegendFontWeight.selectedIndex];
        //     this.chart.legend.labelFont = `bold ${fontSize}px ${font}`;
        //     this.chart.performLayout();
        // });

        this.inputSeriesFontSize
            .setLabel('Size')
            .setValue(fontSize);

        this.addDestroyableEventListener(this.inputSeriesFontSize.getInputElement(), 'input', () => {
            const font = fonts[this.selectSeriesFont.selectedIndex];
            const fontSize = Number.parseInt(this.inputSeriesFontSize.getValue());
            this.series.forEach((series: BarSeries | PieSeries) => {
                series.labelFont = `${fontSize}px ${font}`;
            });
        });

        this.inputSeriesLabelColor.setValue(this.series[0].labelColor);

        this.inputSeriesLabelColor.addDestroyableEventListener(this.inputSeriesLabelColor, 'valueChange', () => {
            this.series.forEach((series: BarSeries | PieSeries) => {
                series.labelColor = this.inputSeriesLabelColor.getValue();
            });
        });
    }
}