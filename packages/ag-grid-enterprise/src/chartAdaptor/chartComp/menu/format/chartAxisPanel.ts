import {AgGroupComponent, Component, PostConstruct, RefSelector, AgInputTextField, AgColorPicker} from "ag-grid-community";
import {ChartController} from "../../chartController";
import {Chart} from "../../../../charts/chart/chart";
import {CartesianChart} from "../../../../charts/chart/cartesianChart";

export class ChartAxisPanel extends Component {

    public static TEMPLATE =
        `<div>
            <ag-group-component ref="labelAxis">
                <ag-input-text-field ref="inputAxisLineWidth"></ag-input-text-field>
                <ag-color-picker ref="inputAxisColor"></ag-color-picker>
    
                <!-- AXIS TICKS -->
    
                <ag-group-component ref="labelAxisTicks">
                    <ag-input-text-field ref="inputAxisTicksWidth"></ag-input-text-field>
                    <ag-input-text-field ref="inputAxisTicksSize"></ag-input-text-field>
                    <ag-input-text-field ref="inputAxisTicksPadding"></ag-input-text-field>
                    <ag-color-picker ref="inputAxisTicksColor"></ag-color-picker>
                </ag-group-component>
    
                <!-- AXIS LABELS -->

                <ag-group-component ref="labelAxisLabels">
                    <select ref="selectAxisFont" style="width: 155px"></select>
                    <div class="ag-group-subgroup">
                        <select ref="selectAxisFontWeight" style="width: 82px"></select>
                        <ag-input-text-field ref="inputAxisFontSize"></ag-input-text-field>
                    </div>
                    <ag-color-picker ref="inputAxisLabelColor"></ag-color-picker>
                    <ag-group-component ref="labelAxisLabelRotation">
                        <ag-input-text-field ref="inputXAxisLabelRotation"></ag-input-text-field>
                        <ag-input-text-field ref="inputYAxisLabelRotation"></ag-input-text-field>
                    </ag-group-component>
                </ag-group-component>              
        </div>`;

    @RefSelector('labelAxis') private labelAxis: AgGroupComponent;
    @RefSelector('inputAxisLineWidth') private inputAxisLineWidth: AgInputTextField;
    @RefSelector('inputAxisColor') private inputAxisColor: AgColorPicker;

    @RefSelector('labelAxisTicks') private labelAxisTicks: AgGroupComponent;
    @RefSelector('inputAxisTicksWidth') private inputAxisTicksWidth: AgInputTextField;
    @RefSelector('inputAxisTicksSize') private inputAxisTicksSize: AgInputTextField;
    @RefSelector('inputAxisTicksPadding') private inputAxisTicksPadding: AgInputTextField;
    @RefSelector('inputAxisTicksColor') private inputAxisTicksColor: AgColorPicker;

    @RefSelector('labelAxisLabels') private labelAxisLabels: AgGroupComponent;
    @RefSelector('selectAxisFont') private selectAxisFont: HTMLSelectElement;
    @RefSelector('selectAxisFontWeight') private selectAxisFontWeight: HTMLSelectElement;
    @RefSelector('inputAxisFontSize') private inputAxisFontSize: AgInputTextField;
    @RefSelector('inputAxisLabelColor') private inputAxisLabelColor: AgColorPicker;
    @RefSelector('labelAxisLabelRotation') private labelAxisLabelRotation: AgGroupComponent;
    @RefSelector('inputXAxisLabelRotation') private inputXAxisLabelRotation: AgInputTextField;
    @RefSelector('inputYAxisLabelRotation') private inputYAxisLabelRotation: AgInputTextField;

    private readonly chartController: ChartController;
    private chart: Chart;

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        this.setTemplate(ChartAxisPanel.TEMPLATE);

        const chartProxy = this.chartController.getChartProxy();
        this.chart = chartProxy.getChart();

        this.initAxis();
        this.initAxisTicks();
        this.initAxisLabels();
    }

    private initAxis() {
        this.labelAxis.setLabel('Axis');

        const chart = this.chart as CartesianChart;
        this.inputAxisLineWidth
            .setLabel('Line Width')
            .setValue(`${chart.xAxis.lineWidth}`);

        this.addDestroyableEventListener(this.inputAxisLineWidth.getInputElement(), 'input', () => {
            const val = parseInt(this.inputAxisLineWidth.getValue(), 10);
            chart.xAxis.lineWidth = val;
            chart.yAxis.lineWidth = val;
            this.chart.performLayout();
        });

        // TODO replace with Color Picker
        this.inputAxisColor.setValue(`${chart.xAxis.lineColor}`);
        this.inputAxisColor.addDestroyableEventListener(this.inputAxisColor, 'valueChange', () => {
            const val = this.inputAxisColor.getValue();
            chart.xAxis.lineColor = val;
            chart.yAxis.lineColor = val;
            this.chart.performLayout();
        });
    }

    private initAxisTicks() {
        this.labelAxisTicks.setLabel('Ticks');

        const chart = this.chart as CartesianChart;

        this.inputAxisTicksWidth
            .setLabel('Width')
            .setValue(`${chart.xAxis.lineWidth}`);
        this.addDestroyableEventListener(this.inputAxisTicksWidth.getInputElement(), 'input', () => {
            const val = parseInt(this.inputAxisTicksWidth.getValue(), 10);
            chart.xAxis.tickWidth = val;
            chart.yAxis.tickWidth = val;
            chart.performLayout();
        });

        this.inputAxisTicksSize
            .setLabel('Size')
            .setValue(`${chart.xAxis.tickSize}`);
        this.addDestroyableEventListener(this.inputAxisTicksSize.getInputElement(), 'input', () => {
            const val = parseInt(this.inputAxisTicksSize.getValue(), 10)
            chart.xAxis.tickSize = val;
            chart.yAxis.tickSize = val;
            chart.performLayout();
        });

        this.inputAxisTicksPadding
            .setLabel('Padding')
            .setValue(`${chart.xAxis.tickPadding}`);

        this.addDestroyableEventListener(this.inputAxisTicksPadding.getInputElement(), 'input', () => {
            const val = parseInt(this.inputAxisTicksPadding.getValue(), 10);
            chart.xAxis.tickPadding = val;
            chart.yAxis.tickPadding = val;
            chart.performLayout();
        });

        // TODO replace with Color Picker
        this.inputAxisTicksColor.setValue(`${chart.xAxis.lineColor}`);

        this.inputAxisTicksColor.addDestroyableEventListener(this.inputAxisTicksColor, 'valueChange', () => {
            const val = this.inputAxisTicksColor.getValue();
            chart.xAxis.tickColor = val;
            chart.yAxis.tickColor = val;
            chart.performLayout();
        });
    }

    private initAxisLabels() {
        const chart = this.chart as CartesianChart;

        this.labelAxisLabels.setLabel('Labels');

        const fonts = ['Verdana, sans-serif', 'Arial'];
        fonts.forEach((font: any) => {
            const option = document.createElement('option');
            option.value = font;
            option.text = font;
            this.selectAxisFont.appendChild(option);
        });

        const fontParts = chart.xAxis.labelFont.split('px');
        const fontSize = fontParts[0];
        const font = fontParts[1].trim();

        this.selectAxisFont.selectedIndex = fonts.indexOf(font);

        this.addDestroyableEventListener(this.selectAxisFont, 'input', () => {
            const font = fonts[this.selectAxisFont.selectedIndex];
            const fontSize = Number.parseInt(this.inputAxisFontSize.getValue());

            chart.xAxis.labelFont = `${fontSize}px ${font}`;
            chart.yAxis.labelFont = `${fontSize}px ${font}`;

            chart.performLayout();
        });

        const fontWeights = ['normal', 'bold'];
        fontWeights.forEach((font: any) => {
            const option = document.createElement('option');
            option.value = font;
            option.text = font;
            this.selectAxisFontWeight.appendChild(option);
        });

        // TODO
        // this.selectLegendFontWeight.selectedIndex = fonts.indexOf(font);
        // this.addDestroyableEventListener(this.selectLegendFontWeight, 'input', () => {
        //     const fontSize = Number.parseInt(this.selectLegendFontWeight.value);
        //     const font = fonts[this.selectLegendFontWeight.selectedIndex];
        //     this.chart.legend.labelFont = `bold ${fontSize}px ${font}`;
        //     this.chart.performLayout();
        // });

        this.inputAxisFontSize
            .setLabel('Size')
            .setValue(fontSize);

        this.addDestroyableEventListener(this.inputAxisFontSize.getInputElement(), 'input', () => {
            const font = fonts[this.selectAxisFont.selectedIndex];
            const fontSize = Number.parseInt(this.inputAxisFontSize.getValue());

            chart.xAxis.labelFont = `${fontSize}px ${font}`;
            chart.yAxis.labelFont = `${fontSize}px ${font}`;

            chart.performLayout();
        });

        // TODO replace with Color Picker
        this.inputAxisLabelColor.setValue(`${chart.xAxis.labelColor}`);

        this.inputAxisLabelColor.addDestroyableEventListener(this.inputAxisLabelColor, 'valueChange', () => {
            const val = this.inputAxisLabelColor.getValue();
            chart.xAxis.labelColor = val;
            chart.yAxis.labelColor = val;

            chart.performLayout();
        });

        this.labelAxisLabelRotation.setLabel('Rotation (degrees)');

        this.inputXAxisLabelRotation
            .setLabel('x-axis')
            .setValue(`${chart.xAxis.labelRotation}`);
        this.addDestroyableEventListener(this.inputXAxisLabelRotation.getInputElement(), 'input', () => {
            chart.xAxis.labelRotation = Number.parseInt(this.inputXAxisLabelRotation.getValue());
            chart.performLayout();
        });

        this.inputYAxisLabelRotation
            .setLabel('y-axis')
            .setValue(`${chart.yAxis.labelRotation}`);
        this.addDestroyableEventListener(this.inputYAxisLabelRotation.getInputElement(), 'input', () => {
            chart.yAxis.labelRotation = Number.parseInt(this.inputYAxisLabelRotation.getValue());
            chart.performLayout();
        });
    }

}