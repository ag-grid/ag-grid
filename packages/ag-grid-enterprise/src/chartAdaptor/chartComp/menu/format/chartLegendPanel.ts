import {_, AgCheckbox, AgGroupComponent, Component, PostConstruct, RefSelector} from "ag-grid-community";
import {ChartController} from "../../chartController";
import {Chart, LegendPosition} from "../../../../charts/chart/chart";

export class ChartLegendPanel extends Component {

    public static TEMPLATE =
        `<div>  
            <ag-group-component ref="labelLegend">        
                <div class="ag-column-tool-panel-column-group">
                    <ag-checkbox ref="cbLegendEnabled" style="padding-left: 15px"></ag-checkbox>
                    <span ref="labelLegendEnabled" style="padding-left: 5px"></span>
                </div>
    
                <div style="padding-top: 10px;">
                    <span ref="labelLegendPosition" style="padding-left: 15px; padding-right: 10px"></span>
                    <select ref="selectLegendPosition"></select>
                </div>
    
                <div style="padding-top: 10px;">
                    <span ref="labelLegendPadding" style="padding-left: 15px; padding-right: 10px"></span>
                    <input style="width: 38px" ref="inputLegendPadding" type="text">
                </div>
    
                <div style="padding-top: 10px;">
                    <span ref="labelMarkerSize" style="padding-left: 15px; padding-right: 10px"></span>
                    <input style="width: 38px" ref="inputMarkerSize" type="text">
                </div>
    
                <div style="padding-top: 10px;">
                    <span ref="labelMarkerStroke" style="padding-left: 15px; padding-right: 10px"></span>
                    <input style="width: 38px" ref="inputMarkerStroke" type="text">
                </div>
    
                <div style="padding-top: 10px;">
                    <span ref="labelMarkerPadding" style="padding-left: 15px; padding-right: 10px"></span>
                    <input style="width: 38px" ref="inputMarkerPadding" type="text">
                </div>
    
                <div style="padding-top: 10px;">
                    <span ref="labelItemPaddingX" style="padding-left: 15px; padding-right: 10px"></span>
                    <input style="width: 38px" ref="inputItemPaddingX" type="text">
                </div>
    
                <div style="padding-top: 10px;">
                    <span ref="labelItemPaddingY" style="padding-left: 15px; padding-right: 10px"></span>
                    <input style="width: 38px" ref="inputItemPaddingY" type="text">
                </div>
    
                <div style="padding-top: 10px; padding-bottom: 3px; padding-left: 15px">
                    <span ref="labelLegendLabels"></span>
                </div>
    
                <!-- LEGEND LABELS -->
    
                <div style="width:176px; padding: 5%; margin: auto; border: 1px solid rgba(0, 0, 0, 0.1);">
                    <select ref="selectLegendFont" style="width: 155px"></select>
                    <div style="padding-top: 10px">
                        <select ref="selectLegendFontWeight" style="width: 82px"></select>
                         <span ref="labelLegendFontSize" style="padding-left: 16px"></span>
                        <input ref="inputLegendFontSize" type="text" style="width: 25px">
                    </div>
                    <div style="padding-top: 10px">
                        <span ref="labelLegendLabelColor" style="padding-right: 5px"></span>
                        <input ref="inputLegendLabelColor" type="text" style="width: 115px">
                    </div>
                </div>
                
            </ag-group-component>
        </div>`;

    @RefSelector('labelLegend') private labelLegend: AgGroupComponent;
    @RefSelector('cbLegendEnabled') private cbLegendEnabled: AgCheckbox;
    @RefSelector('labelLegendEnabled') private labelLegendEnabled: HTMLElement;

    @RefSelector('selectLegendPosition') private selectLegendPosition: HTMLSelectElement;
    @RefSelector('labelLegendPosition') private labelLegendPosition: HTMLElement;

    @RefSelector('labelLegendPadding') private labelLegendPadding: HTMLElement;
    @RefSelector('inputLegendPadding') private inputLegendPadding: HTMLInputElement;

    @RefSelector('labelMarkerSize') private labelMarkerSize: HTMLElement;
    @RefSelector('inputMarkerSize') private inputMarkerSize: HTMLInputElement;

    @RefSelector('labelMarkerStroke') private labelMarkerStroke: HTMLElement;
    @RefSelector('inputMarkerStroke') private inputMarkerStroke: HTMLInputElement;

    @RefSelector('labelMarkerPadding') private labelMarkerPadding: HTMLElement;
    @RefSelector('inputMarkerPadding') private inputMarkerPadding: HTMLInputElement;

    @RefSelector('labelItemPaddingX') private labelItemPaddingX: HTMLElement;
    @RefSelector('inputItemPaddingX') private inputItemPaddingX: HTMLInputElement;

    @RefSelector('labelItemPaddingY') private labelItemPaddingY: HTMLElement;
    @RefSelector('inputItemPaddingY') private inputItemPaddingY: HTMLInputElement;

    @RefSelector('labelLegendLabels') private labelLegendLabels: HTMLElement;
    @RefSelector('selectLegendFont') private selectLegendFont: HTMLSelectElement;
    @RefSelector('selectLegendFontWeight') private selectLegendFontWeight: HTMLSelectElement;
    @RefSelector('labelLegendFontSize') private labelLegendFontSize: HTMLElement;
    @RefSelector('inputLegendFontSize') private inputLegendFontSize: HTMLInputElement;
    @RefSelector('labelLegendLabelColor') private labelLegendLabelColor: HTMLElement;
    @RefSelector('inputLegendLabelColor') private inputLegendLabelColor: HTMLInputElement;

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
        this.labelLegendEnabled.innerHTML = 'Enabled';
        this.addDestroyableEventListener(this.cbLegendEnabled, 'change', () => {
            this.chart.series.forEach(s => {
                s.showInLegend = this.cbLegendEnabled.isSelected();
                s.toggleSeriesItem(1, this.cbLegendEnabled.isSelected());
            });
        });

        this.labelLegendPosition.innerHTML = 'Position';

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

        this.labelLegendPadding.innerHTML = 'Padding';
        this.inputLegendPadding.value = `${this.chart.legendPadding}`;
        this.addDestroyableEventListener(this.inputLegendPadding, 'input', () => {
            this.chart.legendPadding = Number.parseInt(this.inputLegendPadding.value);
        });

        this.labelMarkerSize.innerHTML = 'Marker Size';
        this.inputMarkerSize.value = `${this.chart.legend.markerSize}`;
        this.addDestroyableEventListener(this.inputMarkerSize, 'input', () => {
            this.chart.legend.markerSize = Number.parseInt(this.inputMarkerSize.value);
        });

        this.labelMarkerStroke.innerHTML = 'Marker Stroke';
        this.inputMarkerStroke.value = `${this.chart.legend.markerStrokeWidth}`;
        this.addDestroyableEventListener(this.inputMarkerStroke, 'input', () => {
            this.chart.legend.markerStrokeWidth = Number.parseInt(this.inputMarkerStroke.value);
        });

        this.labelMarkerPadding.innerHTML = 'Marker Padding';
        this.inputMarkerPadding.value = `${this.chart.legend.markerPadding}`;
        this.addDestroyableEventListener(this.inputMarkerPadding, 'input', () => {
            this.chart.legend.markerPadding = Number.parseInt(this.inputMarkerPadding.value);
        });

        this.labelItemPaddingX.innerHTML = 'Item Padding X';
        this.inputItemPaddingX.value = `${this.chart.legend.itemPaddingX}`;
        this.addDestroyableEventListener(this.inputItemPaddingX, 'input', () => {
            this.chart.legend.itemPaddingX = Number.parseInt(this.inputItemPaddingX.value);
        });

        this.labelItemPaddingY.innerHTML = 'Item Padding Y';
        this.inputItemPaddingY.value = `${this.chart.legend.itemPaddingX}`;
        this.addDestroyableEventListener(this.inputItemPaddingY, 'input', () => {
            this.chart.legend.itemPaddingY = Number.parseInt(this.inputItemPaddingY.value);
        });
    }

    private initLegendLabels() {
        this.labelLegendLabels.innerHTML = 'Labels';

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
            const fontSize = Number.parseInt(this.inputLegendFontSize.value);
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

        this.labelLegendFontSize.innerHTML = 'Size';

        this.inputLegendFontSize.value = fontSize;
        this.addDestroyableEventListener(this.inputLegendFontSize, 'input', () => {
            const fontSize = Number.parseInt(this.inputLegendFontSize.value);
            const font = fonts[this.selectLegendFont.selectedIndex];
            this.chart.legend.labelFont = `${fontSize}px ${font}`;
            this.chart.performLayout();
        });

        // TODO replace with Color Picker
        this.labelLegendLabelColor.innerHTML = 'Color';
        this.inputLegendLabelColor.value = this.chart.legend.labelColor;
        this.addDestroyableEventListener(this.inputLegendLabelColor, 'input', () => {
            this.chart.legend.labelColor = this.inputLegendLabelColor.value;
            this.chart.performLayout();
        });
    }

}