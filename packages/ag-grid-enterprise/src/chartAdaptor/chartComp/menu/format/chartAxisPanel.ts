import {AgGroupComponent, Component, PostConstruct, RefSelector} from "ag-grid-community";
import {ChartController} from "../../chartController";
import {Chart} from "../../../../charts/chart/chart";
import {CartesianChart} from "../../../../charts/chart/cartesianChart";

export class ChartAxisPanel extends Component {

    public static TEMPLATE =
        `<div>    
            
            <ag-group-component ref="labelAxis">     
                <div style="padding-top: 10px;">
                    <span ref="labelAxisLineWidth" style="padding-left: 15px; padding-right: 10px"></span>
                    <input style="width: 38px" ref="inputAxisLineWidth" type="text">
                </div>
    
                <div style="padding-top: 10px">
                    <span ref="labelAxisColor" style="padding-left: 15px; padding-right: 10px"></span>
                    <input ref="inputAxisColor" type="text" style="width: 110px">
                </div>
    
                <!-- AXIS TICKS -->
    
                <div style="padding-top: 10px; padding-bottom: 3px; padding-left: 15px">
                    <span ref="labelAxisTicks"></span>
                </div>
    
                <div style="width:176px; padding: 5%; margin: auto; border: 1px solid rgba(0, 0, 0, 0.1);">
                    <div>
                        <span ref="labelAxisTicksWidth" style="padding-right: 24px"></span>
                        <input style="width: 25px" ref="inputAxisTicksWidth" type="text">
                    </div>
                    <div style="padding-top: 5px">
                        <span ref="labelAxisTicksSize" style="padding-right: 34px"></span>
                        <input style="width: 25px" ref="inputAxisTicksSize" type="text">
                    </div>
                    <div style="padding-top: 5px">
                        <span ref="labelAxisTicksPadding" style="padding-right: 12px"></span>
                        <input style="width: 25px" ref="inputAxisTicksPadding" type="text">
                    </div>
                    <div style="padding-top: 5px">
                        <span ref="labelAxisTicksColor" style="padding-right: 10px"></span>
                        <input ref="inputAxisTicksColor" type="text" style="width: 110px">
                    </div>
                </div>
    
                <!-- AXIS LABELS -->
    
                <div style="padding-top: 10px; padding-bottom: 3px; padding-left: 15px">
                    <span ref="labelAxisLabels"></span>
                </div>
    
                <div style="width:176px; padding: 5%; margin: auto; border: 1px solid rgba(0, 0, 0, 0.1);">
                    <select ref="selectAxisFont" style="width: 155px"></select>
                    <div style="padding-top: 10px">
                        <select ref="selectAxisFontWeight" style="width: 82px"></select>
                         <span ref="labelAxisFontSize" style="padding-left: 16px"></span>
                        <input ref="inputAxisFontSize" type="text" style="width: 25px">
                    </div>
                    <div style="padding-top: 10px">
                        <span ref="labelAxisLabelColor" style="padding-right: 5px"></span>
                        <input ref="inputAxisLabelColor" type="text" style="width: 115px">
                    </div>
    
                    <div style="padding-top: 10px">
                        <span ref="labelAxisLabelRotation"></span>
                    </div>
                    <div style="padding-top: 5px">
                        <span ref="labelXAxisLabelRotation" style="padding-right: 5px"></span>
                        <input style="width: 25px" ref="inputXAxisLabelRotation" type="text">
                        <span ref="labelYAxisLabelRotation" style="padding-left: 15px; padding-right: 5px"></span>
                        <input style="width: 25px" ref="inputYAxisLabelRotation" type="text">
                    </div>
                </div>
                                           
            </ag-group-component>            
                      
        </div>`;

    @RefSelector('labelAxis') private labelAxis: AgGroupComponent;
    @RefSelector('labelAxisLineWidth') private labelAxisLineWidth: HTMLElement;
    @RefSelector('inputAxisLineWidth') private inputAxisLineWidth: HTMLInputElement;
    @RefSelector('labelAxisColor') private labelAxisColor: HTMLElement;
    @RefSelector('inputAxisColor') private inputAxisColor: HTMLInputElement;

    @RefSelector('labelAxisTicks') private labelAxisTicks: HTMLElement;
    @RefSelector('labelAxisTicksWidth') private labelAxisTicksWidth: HTMLElement;
    @RefSelector('inputAxisTicksWidth') private inputAxisTicksWidth: HTMLInputElement;
    @RefSelector('labelAxisTicksSize') private labelAxisTicksSize: HTMLElement;
    @RefSelector('inputAxisTicksSize') private inputAxisTicksSize: HTMLInputElement;
    @RefSelector('labelAxisTicksPadding') private labelAxisTicksPadding: HTMLElement;
    @RefSelector('inputAxisTicksPadding') private inputAxisTicksPadding: HTMLInputElement;
    @RefSelector('labelAxisTicksColor') private labelAxisTicksColor: HTMLElement;
    @RefSelector('inputAxisTicksColor') private inputAxisTicksColor: HTMLInputElement;

    @RefSelector('labelAxisLabels') private labelAxisLabels: HTMLElement;
    @RefSelector('selectAxisFont') private selectAxisFont: HTMLSelectElement;
    @RefSelector('selectAxisFontWeight') private selectAxisFontWeight: HTMLSelectElement;
    @RefSelector('labelAxisFontSize') private labelAxisFontSize: HTMLElement;
    @RefSelector('inputAxisFontSize') private inputAxisFontSize: HTMLInputElement;
    @RefSelector('labelAxisLabelColor') private labelAxisLabelColor: HTMLElement;
    @RefSelector('inputAxisLabelColor') private inputAxisLabelColor: HTMLInputElement;
    @RefSelector('labelAxisLabelRotation') private labelAxisLabelRotation: HTMLElement;
    @RefSelector('labelXAxisLabelRotation') private labelXAxisLabelRotation: HTMLElement;
    @RefSelector('inputXAxisLabelRotation') private inputXAxisLabelRotation: HTMLInputElement;
    @RefSelector('labelYAxisLabelRotation') private labelYAxisLabelRotation: HTMLElement;
    @RefSelector('inputYAxisLabelRotation') private inputYAxisLabelRotation: HTMLInputElement;

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
        this.labelAxisLineWidth.innerHTML = 'Line Width';
        this.inputAxisLineWidth.value = `${chart.xAxis.lineWidth}`;
        this.addDestroyableEventListener(this.inputAxisLineWidth, 'input', () => {
            chart.xAxis.lineWidth = Number.parseInt(this.inputAxisLineWidth.value);
            chart.yAxis.lineWidth = Number.parseInt(this.inputAxisLineWidth.value);
            this.chart.performLayout();
        });

        // TODO replace with Color Picker
        this.labelAxisColor.innerHTML = 'Color';
        this.inputAxisColor.value = `${chart.xAxis.lineColor}`;
        this.addDestroyableEventListener(this.inputAxisColor, 'input', () => {
            chart.xAxis.lineColor = this.inputAxisColor.value;
            chart.yAxis.lineColor = this.inputAxisColor.value;
            this.chart.performLayout();
        });
    }

    private initAxisTicks() {
        this.labelAxisTicks.innerHTML = 'Ticks';

        const chart = this.chart as CartesianChart;

        this.labelAxisTicksWidth.innerHTML = 'Width';
        this.inputAxisTicksWidth.value = `${chart.xAxis.lineWidth}`;
        this.addDestroyableEventListener(this.inputAxisTicksWidth, 'input', () => {
            chart.xAxis.tickWidth = Number.parseInt(this.inputAxisTicksWidth.value);
            chart.yAxis.tickWidth = Number.parseInt(this.inputAxisTicksWidth.value);
            chart.performLayout();
        });

        this.labelAxisTicksSize.innerHTML = 'Size';
        this.inputAxisTicksSize.value = `${chart.xAxis.tickSize}`;
        this.addDestroyableEventListener(this.inputAxisTicksSize, 'input', () => {
            chart.xAxis.tickSize = Number.parseInt(this.inputAxisTicksSize.value);
            chart.yAxis.tickSize = Number.parseInt(this.inputAxisTicksSize.value);
            chart.performLayout();
        });

        this.labelAxisTicksPadding.innerHTML = 'Padding';
        this.inputAxisTicksPadding.value = `${chart.xAxis.tickPadding}`;
        this.addDestroyableEventListener(this.inputAxisTicksPadding, 'input', () => {
            chart.xAxis.tickPadding = Number.parseInt(this.inputAxisTicksPadding.value);
            chart.yAxis.tickPadding = Number.parseInt(this.inputAxisTicksPadding.value);
            chart.performLayout();
        });

        // TODO replace with Color Picker
        this.labelAxisTicksColor.innerHTML = 'Color';
        this.inputAxisTicksColor.value = `${chart.xAxis.lineColor}`;
        this.addDestroyableEventListener(this.inputAxisTicksColor, 'input', () => {
            chart.xAxis.tickColor = this.inputAxisTicksColor.value;
            chart.yAxis.tickColor = this.inputAxisTicksColor.value;
            chart.performLayout();
        });
    }

    private initAxisLabels() {
        const chart = this.chart as CartesianChart;

        this.labelAxisLabels.innerHTML = 'Labels';

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
            const fontSize = Number.parseInt(this.inputAxisFontSize.value);

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

        this.labelAxisFontSize.innerHTML = 'Size';
        this.inputAxisFontSize.value = fontSize;
        this.addDestroyableEventListener(this.inputAxisFontSize, 'input', () => {
            const font = fonts[this.selectAxisFont.selectedIndex];
            const fontSize = Number.parseInt(this.inputAxisFontSize.value);

            chart.xAxis.labelFont = `${fontSize}px ${font}`;
            chart.yAxis.labelFont = `${fontSize}px ${font}`;

            chart.performLayout();
        });

        // TODO replace with Color Picker
        this.labelAxisLabelColor.innerHTML = 'Color';
        this.inputAxisLabelColor.value = `${chart.xAxis.labelColor}`;
        this.addDestroyableEventListener(this.inputAxisLabelColor, 'input', () => {
            chart.xAxis.labelColor = this.inputAxisLabelColor.value;
            chart.yAxis.labelColor = this.inputAxisLabelColor.value;

            chart.performLayout();
        });

        this.labelAxisLabelRotation.innerHTML = 'Rotation (degrees)';

        this.labelXAxisLabelRotation.innerHTML = 'x-axis';
        this.inputXAxisLabelRotation.value = `${chart.xAxis.labelRotation}`;
        this.addDestroyableEventListener(this.inputXAxisLabelRotation, 'input', () => {
            chart.xAxis.labelRotation = Number.parseInt(this.inputXAxisLabelRotation.value);
            chart.performLayout();
        });

        this.labelYAxisLabelRotation.innerHTML = 'y-axis';
        this.inputYAxisLabelRotation.value = `${chart.yAxis.labelRotation}`;
        this.addDestroyableEventListener(this.inputYAxisLabelRotation, 'input', () => {
            chart.yAxis.labelRotation = Number.parseInt(this.inputYAxisLabelRotation.value);
            chart.performLayout();
        });
    }
}