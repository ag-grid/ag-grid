import {_, AgCheckbox, Component, PostConstruct, RefSelector} from "ag-grid-community";
import {ChartController} from "../../chartController";
import {Chart} from "../../../../charts/chart/chart";
import {BarSeries} from "../../../../charts/chart/series/barSeries";

export class ChartBarSeriesPanel extends Component {

    public static TEMPLATE =
        `<div>   
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
        </div>`;

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

    private readonly chartController: ChartController;
    private chart: Chart;

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        this.setTemplate(ChartBarSeriesPanel.TEMPLATE);

        const chartProxy = this.chartController.getChartProxy();
        this.chart = chartProxy.getChart();

        this.initSeriesTooltips();
        this.initSeriesStrokeWidth();
        this.initSeriesLabels();
        this.initSeriesShadow();

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


}