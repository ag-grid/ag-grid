import {_, AgCheckbox, Autowired, Component, GridOptionsWrapper, PostConstruct, RefSelector} from "ag-grid-community";
import {ChartController} from "../chartController";
import {Chart, LegendPosition} from "../../../charts/chart/chart";
import {BarSeries} from "../../../charts/chart/series/barSeries";
import {CartesianChart} from "../../../charts/chart/cartesianChart";

export class DummyFormattingPanel extends Component {

    public static TEMPLATE =
        `<div class="ag-chart-data-wrapper" style="padding: 5%">  
            
            <!-- CHART PADDING -->
            
            <div style="padding-top: 0px">
                <span ref="labelChartPadding"></span>  
            </div>         
            
            <div class="ag-column-tool-panel-column-group" style="padding: 10px 5px 5px 25px">
                <span ref="labelPaddingTop" style="padding-right: 5px"></span>   
                <input style="width: 38px" ref="inputPaddingTop" type="text" style="padding-right: 15px">   
                <span ref="labelPaddingRight" style="padding-left: 15px; padding-right: 5px"></span>       
                <input style="width: 38px" ref="inputPaddingRight" type="text" style="padding-right: 15px">   
            </div>
            
            <div class="ag-column-tool-panel-column-group" style="padding: 5px 5px 0px 5px">
                <span ref="labelPaddingBottom" style="padding-right: 5px"></span>   
                <input style="width: 38px" ref="inputPaddingBottom" type="text">   
                <span ref="labelPaddingLeft" style="padding-left: 22px; padding-right: 5px"></span>       
                <input style="width: 38px" ref="inputPaddingLeft" type="text">   
            </div>
            
            <hr>    
                   
            <!-- LEGEND -->                   
                   
            <div style="padding-bottom: 12px">
                <span ref="labelLegend"></span>  
            </div>   
            
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
                          
            <hr>       
                        
            <!-- SERIES -->   
            
            <div>
                <span ref="labelSeries"></span>  
            </div>                
            
            <div style="padding-top: 10px;">
                <span ref="labelSeriesStrokeWidth" style="padding-left: 15px; padding-right: 10px"></span>   
                <input style="width: 38px" ref="inputSeriesStrokeWidth" type="text">   
            </div>
            
            <div class="ag-column-tool-panel-column-group" style="padding-top: 10px">                
                <ag-checkbox ref="cbTooltipsEnabled" style="padding-left: 15px"></ag-checkbox>
                <span ref="labelTooltipsEnabled" style="padding-left: 5px"></span>                                                        
            </div>  
            
            <!-- SERIES LABELS -->   
            
            <div class="ag-column-tool-panel-column-group" style="padding-top: 10px; padding-bottom: 5px">                
                <ag-checkbox ref="cbSeriesLabelsEnabled" style="padding-left: 15px"></ag-checkbox>
                <span ref="labelSeriesLabelsEnabled" style="padding-left: 5px"></span>                                                        
            </div>  
            
            <div style="width:176px; padding: 5%; margin: auto; border: 1px solid rgba(0, 0, 0, 0.1);">                        
                <select ref="selectSeriesFont" style="width: 155px"></select>  
                <div style="padding-top: 10px">
                    <select ref="selectSeriesFontWeight" style="width: 82px"></select>
                     <span ref="labelSeriesFontSize" style="padding-left: 16px"></span>   
                    <input ref="inputSeriesFontSize" type="text" style="width: 25px"> 
                </div>                             
                <div style="padding-top: 10px">
                    <span ref="labelSeriesLabelColor" style="padding-right: 5px"></span>   
                    <input ref="inputSeriesLabelColor" type="text" style="width: 115px"> 
                </div>
            </div> 
                                                   
            <!-- SERIES SHADOW -->                      
                                            
            <div class="ag-column-tool-panel-column-group" style="padding-top: 10px; padding-bottom: 5px">                
                <ag-checkbox ref="cbSeriesShadow" style="padding-left: 15px"></ag-checkbox>
                <span ref="labelSeriesShadow" style="padding-left: 5px"></span>                                                        
            </div>                                                 
                        
            <div style="width:176px; padding: 5%; margin: auto; border: 1px solid rgba(0, 0, 0, 0.1);">
                <div>
                    <span ref="labelSeriesShadowBlur" style="padding-right: 34px"></span>   
                    <input style="width: 38px" ref="inputSeriesShadowBlur" type="text">   
                </div>
                <div style="padding-top: 5px">
                    <span ref="labelSeriesShadowXOffset" style="padding-right: 10px"></span>   
                    <input style="width: 38px" ref="inputSeriesShadowXOffset" type="text">   
                </div>
                <div style="padding-top: 5px">
                    <span ref="labelSeriesShadowYOffset" style="padding-right: 10px"></span>   
                    <input style="width: 38px" ref="inputSeriesShadowYOffset" type="text">   
                </div>
                <div style="padding-top: 5px">
                    <span ref="labelSeriesShadowColor" style="padding-right: 5px"></span>   
                    <input ref="inputSeriesShadowColor" type="text" style="width: 110px"> 
                </div>                              
            </div> 
                      
            <hr>       
                        
            <!-- AXIS -->
            
            <div>
                <span ref="labelAxis"></span>  
            </div>                
            
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
            
            <!-- AXIS GRIDLINES -->   
                               
            <div style="padding-top: 10px; padding-bottom: 3px; padding-left: 15px">
                <span ref="labelAxisGridlines"></span>  
            </div>        
                                          
            <div style="width:176px; padding: 5%; margin: auto; border: 1px solid rgba(0, 0, 0, 0.1);"> 
                <span ref="labelAxisGridlinesMajor"></span> 
                                
                <div style="padding-top: 10px">
                    <span ref="labelAxisGridlinesMajorDash" style="padding-left: 16px"></span>   
                    <select ref="selectAxisGridlinesMajorDash" style="width: 82px"></select>                                       
                </div> 
            </div>                                 
                      
         </div>`;

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    @RefSelector('labelChartPadding') private labelChartPadding: HTMLElement;

    @RefSelector('labelPaddingTop') private labelPaddingTop: HTMLElement;
    @RefSelector('inputPaddingTop') private inputPaddingTop: HTMLInputElement;

    @RefSelector('labelPaddingRight') private labelPaddingRight: HTMLElement;
    @RefSelector('inputPaddingRight') private inputPaddingRight: HTMLInputElement;

    @RefSelector('labelPaddingBottom') private labelPaddingBottom: HTMLElement;
    @RefSelector('inputPaddingBottom') private inputPaddingBottom: HTMLInputElement;

    @RefSelector('labelPaddingLeft') private labelPaddingLeft: HTMLElement;
    @RefSelector('inputPaddingLeft') private inputPaddingLeft: HTMLInputElement;

    @RefSelector('labelLegend') private labelLegend: HTMLElement;
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

    @RefSelector('labelSeries') private labelSeries: HTMLElement;
    @RefSelector('labelSeriesStrokeWidth') private labelSeriesStrokeWidth: HTMLElement;
    @RefSelector('inputSeriesStrokeWidth') private inputSeriesStrokeWidth: HTMLInputElement;
    @RefSelector('cbTooltipsEnabled') private cbTooltipsEnabled: AgCheckbox;
    @RefSelector('labelTooltipsEnabled') private labelTooltipsEnabled: HTMLElement;

    @RefSelector('cbSeriesLabelsEnabled') private cbSeriesLabelsEnabled: AgCheckbox;
    @RefSelector('labelSeriesLabelsEnabled') private labelSeriesLabelsEnabled: HTMLElement;
    @RefSelector('labelSeriesLabels') private labelSeriesLabels: HTMLElement;
    @RefSelector('selectSeriesFont') private selectSeriesFont: HTMLSelectElement;
    @RefSelector('selectSeriesFontWeight') private selectSeriesFontWeight: HTMLSelectElement;
    @RefSelector('labelSeriesFontSize') private labelSeriesFontSize: HTMLElement;
    @RefSelector('inputSeriesFontSize') private inputSeriesFontSize: HTMLInputElement;
    @RefSelector('labelSeriesLabelColor') private labelSeriesLabelColor: HTMLElement;
    @RefSelector('inputSeriesLabelColor') private inputSeriesLabelColor: HTMLInputElement;

    @RefSelector('cbSeriesShadow') private cbSeriesShadow: AgCheckbox;
    @RefSelector('labelSeriesShadow') private labelSeriesShadow: HTMLElement;
    @RefSelector('labelSeriesShadowBlur') private labelSeriesShadowBlur: HTMLElement;
    @RefSelector('inputSeriesShadowBlur') private inputSeriesShadowBlur: HTMLInputElement;
    @RefSelector('labelSeriesShadowXOffset') private labelSeriesShadowXOffset: HTMLElement;
    @RefSelector('inputSeriesShadowXOffset') private inputSeriesShadowXOffset: HTMLInputElement;
    @RefSelector('labelSeriesShadowYOffset') private labelSeriesShadowYOffset: HTMLElement;
    @RefSelector('inputSeriesShadowYOffset') private inputSeriesShadowYOffset: HTMLInputElement;
    @RefSelector('labelSeriesShadowColor') private labelSeriesShadowColor: HTMLElement;
    @RefSelector('inputSeriesShadowColor') private inputSeriesShadowColor: HTMLInputElement;

    @RefSelector('labelAxis') private labelAxis: HTMLElement;
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

    @RefSelector('labelAxisGridlines') private labelAxisGridlines: HTMLElement;
    @RefSelector('labelAxisGridlinesMajor') private labelAxisGridlinesMajor: HTMLElement;
    @RefSelector('labelAxisGridlinesMajorDash') private labelAxisGridlinesMajorDash: HTMLElement;
    @RefSelector('selectAxisGridlinesMajorDash') private selectAxisGridlinesMajorDash: HTMLSelectElement;


    private readonly chartController: ChartController;
    private chart: Chart;

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        this.setTemplate(DummyFormattingPanel.TEMPLATE);

        const chartProxy = this.chartController.getChartProxy();
        this.chart = chartProxy.getChart();

        this.initChartPaddingItems();
        this.initLegendItems();
        this.initLegendLabels();

        this.initSeriesTooltips();
        this.initSeriesStrokeWidth();
        this.initSeriesLabels();
        this.initSeriesShadow();

        this.initAxis();
        this.initAxisTicks();
        this.initAxisLabels();
        this.initAxisGridlines();
    }

    private initChartPaddingItems() {
        this.labelChartPadding.innerHTML = 'Chart Padding';

        this.labelPaddingTop.innerHTML = 'Top';
        this.inputPaddingTop.value = `${this.chart.padding.top}`;
        this.addDestroyableEventListener(this.inputPaddingTop, 'input', () => {
            this.chart.padding.top = Number.parseInt(this.inputPaddingTop.value);
            this.chart.performLayout();
        });

        this.labelPaddingRight.innerHTML = 'Right';
        this.inputPaddingRight.value = `${this.chart.padding.right}`;
        this.addDestroyableEventListener(this.inputPaddingRight, 'input', () => {
            this.chart.padding.right = Number.parseInt(this.inputPaddingRight.value);
            this.chart.performLayout();
        });

        this.labelPaddingBottom.innerHTML = 'Bottom';
        this.inputPaddingBottom.value = `${this.chart.padding.bottom}`;
        this.addDestroyableEventListener(this.inputPaddingBottom, 'input', () => {
            this.chart.padding.bottom = Number.parseInt(this.inputPaddingBottom.value);
            this.chart.performLayout();
        });

        this.labelPaddingLeft.innerHTML = 'Left';
        this.inputPaddingLeft.value = `${this.chart.padding.left}`;
        this.addDestroyableEventListener(this.inputPaddingLeft, 'input', () => {
            this.chart.padding.left = Number.parseInt(this.inputPaddingLeft.value);
            this.chart.performLayout();
        });
    }

    private initLegendItems() {
        this.labelLegend.innerHTML = 'Legend';

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

    private initSeriesTooltips() {
        this.labelSeries.innerHTML = 'Series';

        // TODO update code below when this.chart.showTooltips is available
        let enabled = _.every(this.chart.series, (series) => series.tooltipEnabled);
        this.cbTooltipsEnabled.setSelected(enabled);
        this.labelTooltipsEnabled.innerHTML = 'Tooltips';
        this.addDestroyableEventListener(this.cbTooltipsEnabled, 'change', () => {
            this.chart.series.forEach(series => {
                series.tooltipEnabled = this.cbTooltipsEnabled.isSelected();
            });
        });
    }

    private initSeriesStrokeWidth() {
        this.labelSeriesStrokeWidth.innerHTML = 'Stroke Width';

        const barSeries = this.chart.series as BarSeries[];
        if (barSeries.length > 0) {
            this.inputSeriesStrokeWidth.value = `${barSeries[0].strokeWidth}`;
        }

        this.addDestroyableEventListener(this.inputSeriesStrokeWidth, 'input', () => {
            (this.chart.series as BarSeries[]).forEach(series => {
                series.strokeWidth = Number.parseInt(this.inputSeriesStrokeWidth.value);
            });
        });
    }

    private initSeriesLabels() {
        const barSeries = this.chart.series as BarSeries[];

        let enabled = _.every(barSeries, barSeries => barSeries.labelEnabled);
        this.cbSeriesLabelsEnabled.setSelected(enabled);
        this.labelSeriesLabelsEnabled.innerHTML = 'Labels';
        this.addDestroyableEventListener(this.cbSeriesLabelsEnabled, 'change', () => {
            barSeries.forEach(series => {
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

        const fontParts = barSeries[0].labelFont.split('px');
        const fontSize = fontParts[0];
        const font = fontParts[1].trim();

        this.selectSeriesFont.selectedIndex = fonts.indexOf(font);

        this.addDestroyableEventListener(this.selectSeriesFont, 'input', () => {
            const font = fonts[this.selectSeriesFont.selectedIndex];
            const fontSize = Number.parseInt(this.inputSeriesFontSize.value);
            const barSeries = this.chart.series as BarSeries[];
            barSeries.forEach(series => {
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

        this.labelSeriesFontSize.innerHTML = 'Size';
        this.inputSeriesFontSize.value = fontSize;
        this.addDestroyableEventListener(this.inputSeriesFontSize, 'input', () => {
            const font = fonts[this.selectSeriesFont.selectedIndex];
            const fontSize = Number.parseInt(this.inputSeriesFontSize.value);
            const barSeries = this.chart.series as BarSeries[];
            barSeries.forEach(series => {
                series.labelFont = `${fontSize}px ${font}`;
            });
        });

        // TODO replace with Color Picker
        this.labelSeriesLabelColor.innerHTML = 'Color';
        this.inputSeriesLabelColor.value = barSeries[0].labelColor;
        this.addDestroyableEventListener(this.inputSeriesLabelColor, 'input', () => {
            const barSeries = this.chart.series as BarSeries[];
            barSeries.forEach(series => {
                series.labelColor = this.inputSeriesLabelColor.value;
            });
        });
    }

    private initSeriesShadow() {
        const barSeries = this.chart.series as BarSeries[];

        // TODO use shadowEnabled instead when it's available in chart api
        let enabled = _.every(barSeries, barSeries => barSeries.shadow != undefined);
        this.cbSeriesShadow.setSelected(enabled);
        this.labelSeriesShadow.innerHTML = 'Shadow';

        // Add defaults to chart as shadow is undefined by default
        if (!this.inputSeriesShadowBlur.value) this.inputSeriesShadowBlur.value = `20`;
        if (!this.inputSeriesShadowXOffset.value) this.inputSeriesShadowXOffset.value = `10`;
        if (!this.inputSeriesShadowYOffset.value) this.inputSeriesShadowYOffset.value = `10`;
        if (!this.inputSeriesShadowColor.value) this.inputSeriesShadowColor.value = `rgba(0,0,0,0.5)`;

        this.addDestroyableEventListener(this.cbSeriesShadow, 'change', () => {
            barSeries.forEach(series => {
                // TODO remove this check when shadowEnabled instead when it's available in chart api
                if (this.cbSeriesShadow.isSelected()) {
                    series.shadow = {
                        color: this.inputSeriesShadowColor.value,
                        offset: {
                            x: Number.parseInt(this.inputSeriesShadowXOffset.value),
                            y: Number.parseInt(this.inputSeriesShadowYOffset.value)
                        },
                        blur: Number.parseInt(this.inputSeriesShadowBlur.value)
                    };
                } else {
                    series.shadow = undefined;
                }
            });
        });

        const updateShadow = () => {
            barSeries.forEach(series => {
                // TODO remove this check when shadowEnabled instead when it's available in chart api
                if (this.cbSeriesShadow.isSelected()) {
                    const blur = this.inputSeriesShadowBlur.value ? Number.parseInt(this.inputSeriesShadowBlur.value) : 0;
                    const xOffset = this.inputSeriesShadowXOffset.value ? Number.parseInt(this.inputSeriesShadowXOffset.value) : 0;
                    const yOffset = this.inputSeriesShadowYOffset.value ? Number.parseInt(this.inputSeriesShadowYOffset.value) : 0;
                    const color = this.inputSeriesShadowColor.value ? this.inputSeriesShadowColor.value : 'rgba(0,0,0,0.5)';
                    series.shadow = {
                        color: color,
                        offset: {x: xOffset, y: yOffset},
                        blur: blur
                    }
                }
            });
            // TODO: why is this necessary???
            this.chart.performLayout();
        };

        // BLUR
        this.labelSeriesShadowBlur.innerHTML = 'Blur';
        if (barSeries.length > 0) {
            if (barSeries[0].shadow) {
                this.inputSeriesShadowBlur.value = barSeries[0].shadow.blur + ''
            }
        }
        this.addDestroyableEventListener(this.inputSeriesShadowBlur, 'input', updateShadow);

        // X Offset
        this.labelSeriesShadowXOffset.innerHTML = 'X Offset';
        if (barSeries.length > 0) {
            if (barSeries[0].shadow) {
                this.inputSeriesShadowXOffset.value = barSeries[0].shadow.offset.x + ''
            }
        }
        this.addDestroyableEventListener(this.inputSeriesShadowXOffset, 'input', updateShadow);

        // Y Offset
        this.labelSeriesShadowYOffset.innerHTML = 'Y Offset';
        if (barSeries.length > 0) {
            if (barSeries[0].shadow) {
                this.inputSeriesShadowYOffset.value = barSeries[0].shadow.offset.y + ''
            }
        }
        this.addDestroyableEventListener(this.inputSeriesShadowYOffset, 'input', updateShadow);

        // TODO replace with Color Picker
        this.labelSeriesShadowColor.innerHTML = 'Color';
        if (barSeries.length > 0) {
            if (barSeries[0].shadow) {
                this.inputSeriesShadowColor.value = barSeries[0].shadow.color + ''
            }
        }
        this.addDestroyableEventListener(this.inputSeriesShadowColor, 'input', updateShadow);
    }

    private initAxis() {
        this.labelAxis.innerHTML = 'Axis';

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

    private initAxisGridlines() {
        this.labelAxisGridlines.innerHTML = 'Gridlines';
        this.labelAxisGridlinesMajor.innerHTML = 'Major';
        this.labelAxisGridlinesMajorDash.innerHTML = 'Dash';

        const dashes = ['----------------', '..................'];
        dashes.forEach((font: any, index: number) => {
            const option = document.createElement('option');
            option.value = `index`;
            option.text = font;
            this.selectAxisGridlinesMajorDash.appendChild(option);
        });
    }
}