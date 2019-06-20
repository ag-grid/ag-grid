import {_, AgCheckbox, Component, PostConstruct, RefSelector, AgGroupComponent, AgInputTextField} from "ag-grid-community";
import {ChartController} from "../../chartController";
import {Chart} from "../../../../charts/chart/chart";
import {PieSeries} from "../../../../charts/chart/series/pieSeries";

export class ChartPieSeriesPanel extends Component {

    public static TEMPLATE =
        `<div>   
            <ag-group-component ref="seriesGroup">
                <ag-input-text-field ref="inputSeriesStrokeWidth"></ag-input-text-field>
                <ag-checkbox ref="cbTooltipsEnabled"></ag-checkbox>
                <ag-group-component ref="labelSeriesLabels">
                    <ag-checkbox ref="cbSeriesLabelsEnabled"></ag-checkbox>
                    <select ref="selectSeriesFont"></select>
                    <div class="ag-group-subgroup">
                        <select ref="selectSeriesFontWeight" style="width: 82px"></select>
                        <ag-input-text-field ref="inputSeriesFontSize"></ag-input-text-field>
                    </div>
                    <ag-input-text-field ref="inputSeriesLabelColor"></ag-input-text-field>
                </ag-group-component> 
                
                <ag-group-component ref="labelSeriesCallout">
                    <ag-input-text-field ref="inputSeriesCalloutLength"></ag-input-text-field>
                    <ag-input-text-field ref="inputSeriesCalloutStrokeWidth"></ag-input-text-field>
                    <ag-input-text-field ref="inputSeriesCalloutPadding"></ag-input-text-field>
                </ag-group-component>
                
                <ag-group-component ref="labelSeriesShadow">
                    <ag-checkbox ref="cbSeriesShadow"></ag-checkbox>
                    <ag-input-text-field ref="inputSeriesShadowBlur"></ag-input-text-field>
                    <ag-input-text-field ref="inputSeriesShadowXOffset"></ag-input-text-field>
                    <ag-input-text-field ref="inputSeriesShadowYOffset"></ag-input-text-field>
                    <ag-input-text-field ref="inputSeriesShadowColor"></ag-input-text-field>
                </ag-group-component>
            </ag-group-component>
        </div>`;

    @RefSelector('seriesGroup') private seriesGroup: AgGroupComponent;
    @RefSelector('inputSeriesStrokeWidth') private inputSeriesStrokeWidth: AgInputTextField;
    @RefSelector('cbTooltipsEnabled') private cbTooltipsEnabled: AgCheckbox;

    @RefSelector('labelSeriesLabels') private labelSeriesLabels: AgGroupComponent;
    @RefSelector('cbSeriesLabelsEnabled') private cbSeriesLabelsEnabled: AgCheckbox;
    
    @RefSelector('selectSeriesFont') private selectSeriesFont: HTMLSelectElement;
    @RefSelector('selectSeriesFontWeight') private selectSeriesFontWeight: HTMLSelectElement;
    @RefSelector('inputSeriesFontSize') private inputSeriesFontSize: AgInputTextField;
    @RefSelector('inputSeriesLabelColor') private inputSeriesLabelColor: AgInputTextField;

    @RefSelector('labelSeriesCallout') private labelSeriesCallout: AgGroupComponent;
    @RefSelector('inputSeriesCalloutLength') private inputSeriesCalloutLength: AgInputTextField;
    @RefSelector('inputSeriesCalloutStrokeWidth') private inputSeriesCalloutStrokeWidth: AgInputTextField;
    @RefSelector('inputSeriesCalloutPadding') private inputSeriesCalloutPadding: AgInputTextField;

    @RefSelector('labelSeriesShadow') private labelSeriesShadow: AgGroupComponent;
    @RefSelector('cbSeriesShadow') private cbSeriesShadow: AgCheckbox; 
    @RefSelector('inputSeriesShadowBlur') private inputSeriesShadowBlur: AgInputTextField;
    @RefSelector('inputSeriesShadowXOffset') private inputSeriesShadowXOffset: AgInputTextField;
    @RefSelector('inputSeriesShadowYOffset') private inputSeriesShadowYOffset: AgInputTextField;
    @RefSelector('inputSeriesShadowColor') private inputSeriesShadowColor: AgInputTextField;

    private readonly chartController: ChartController;
    private chart: Chart;

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        this.setTemplate(ChartPieSeriesPanel.TEMPLATE);

        const chartProxy = this.chartController.getChartProxy();
        this.chart = chartProxy.getChart();

        this.initSeriesTooltips();
        this.initSeriesStrokeWidth();
        this.initSeriesLabels();
        this.initCalloutOptions();
        this.initSeriesShadow();
    }

    private initSeriesTooltips() {
        this.seriesGroup.setLabel('Series');

        // TODO update code below when this.chart.showTooltips is available
        let enabled = _.every(this.chart.series, (series) => series.tooltipEnabled);
        this.cbTooltipsEnabled.setLabel('Tooltips');
        this.cbTooltipsEnabled.setSelected(enabled);
        this.addDestroyableEventListener(this.cbTooltipsEnabled, 'change', () => {
            this.chart.series.forEach(series => {
                series.tooltipEnabled = this.cbTooltipsEnabled.isSelected();
            });
        });
    }

    private initSeriesStrokeWidth() {
        this.inputSeriesStrokeWidth.setLabel('Stroke Width');

        const pieSeries = this.chart.series as PieSeries[];
        if (pieSeries.length > 0) {
            this.inputSeriesStrokeWidth.setValue(`${pieSeries[0].strokeWidth}`);
        }

        this.addDestroyableEventListener(this.inputSeriesStrokeWidth.getInputElement(), 'input', () => {
            pieSeries.forEach(series => {
                series.strokeWidth = Number.parseInt(this.inputSeriesStrokeWidth.getValue());
            });
        });
    }

    private initSeriesLabels() {
        const pieSeries = this.chart.series as PieSeries[];

        let enabled = _.every(pieSeries, pieSeries => pieSeries.labelEnabled);

        this.labelSeriesLabels.setLabel('Labels');
        this.cbSeriesLabelsEnabled.setLabel('Enabled');
        this.cbSeriesLabelsEnabled.setSelected(enabled);
        this.addDestroyableEventListener(this.cbSeriesLabelsEnabled, 'change', () => {
            pieSeries.forEach(series => {
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

        const fontParts = pieSeries[0].labelFont.split('px');
        const fontSize = fontParts[0];
        const font = fontParts[1].trim();

        this.selectSeriesFont.selectedIndex = fonts.indexOf(font);

        this.addDestroyableEventListener(this.selectSeriesFont, 'input', () => {
            const font = fonts[this.selectSeriesFont.selectedIndex];
            const fontSize = Number.parseInt(this.inputSeriesFontSize.getValue());
            pieSeries.forEach(series => {
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
            pieSeries.forEach(series => {
                series.labelFont = `${fontSize}px ${font}`;
            });
        });

        this.inputSeriesLabelColor
            .setLabel('Color')
            .setValue(pieSeries[0].labelColor);

        this.addDestroyableEventListener(this.inputSeriesLabelColor.getInputElement(), 'input', () => {
            pieSeries.forEach(series => {
                series.labelColor = this.inputSeriesLabelColor.getValue();
            });
        });
    }

    private initCalloutOptions() {
        this.labelSeriesCallout.setLabel('Callout');

        const pieSeries = this.chart.series as PieSeries[];

        this.inputSeriesCalloutLength.setLabel('Length')
            .setLabelWidth(80)
            .setWidth(115);

        if (pieSeries.length > 0) {
            this.inputSeriesCalloutLength.setValue(`${pieSeries[0].calloutLength}`);
        }

        this.addDestroyableEventListener(this.inputSeriesCalloutLength.getInputElement(), 'input', () => {
            pieSeries.forEach(series => {
                series.calloutLength = Number.parseInt(this.inputSeriesCalloutLength.getValue());
            });
        });

        this.inputSeriesCalloutStrokeWidth.setLabel('Stroke Width')
            .setLabelWidth(80)
            .setWidth(115);

        if (pieSeries.length > 0) {
            this.inputSeriesCalloutStrokeWidth.setValue(`${pieSeries[0].calloutStrokeWidth}`);
        }

        this.addDestroyableEventListener(this.inputSeriesCalloutStrokeWidth.getInputElement(), 'input', () => {
            pieSeries.forEach(series => {
                series.calloutStrokeWidth = Number.parseInt(this.inputSeriesCalloutStrokeWidth.getValue());
            });
        });

        this.inputSeriesCalloutPadding.setLabel('Padding')
            .setLabelWidth(80)
            .setWidth(115);

        if (pieSeries.length > 0) {
            this.inputSeriesCalloutPadding.setValue(`${pieSeries[0].calloutPadding}`);
        }

        this.addDestroyableEventListener(this.inputSeriesCalloutPadding.getInputElement(), 'input', () => {
            pieSeries.forEach(series => {
                series.calloutPadding = Number.parseInt(this.inputSeriesCalloutPadding.getValue());
            });
        });
    }

    private initSeriesShadow() {
        this.labelSeriesShadow.setLabel('Shadow');

        const pieSeries = this.chart.series as PieSeries[];
        // TODO use shadowEnabled instead when it's available in chart api
        let enabled = _.every(pieSeries, pieSeries => pieSeries.shadow != undefined);
        this.cbSeriesShadow.setLabel('Enabled');
        this.cbSeriesShadow.setSelected(enabled);

        // Add defaults to chart as shadow is undefined by default
        if (!this.inputSeriesShadowBlur.getValue()) this.inputSeriesShadowBlur.setValue('20');
        if (!this.inputSeriesShadowXOffset.getValue()) this.inputSeriesShadowXOffset.setValue('10');
        if (!this.inputSeriesShadowYOffset.getValue()) this.inputSeriesShadowYOffset.setValue('10');
        if (!this.inputSeriesShadowColor.getValue()) this.inputSeriesShadowColor.setValue('rgba(0,0,0,0.5)');

        this.addDestroyableEventListener(this.cbSeriesShadow, 'change', () => {
            pieSeries.forEach(series => {
                // TODO remove this check when shadowEnabled instead when it's available in chart api
                if (this.cbSeriesShadow.isSelected()) {
                    series.shadow = {
                        color: this.inputSeriesShadowColor.getValue(),
                        offset: {
                            x: Number.parseInt(this.inputSeriesShadowXOffset.getValue()),
                            y: Number.parseInt(this.inputSeriesShadowYOffset.getValue())
                        },
                        blur: Number.parseInt(this.inputSeriesShadowBlur.getValue())
                    };
                } else {
                    series.shadow = undefined;
                }
            });
        });

        const updateShadow = () => {
            pieSeries.forEach(series => {
                // TODO remove this check when shadowEnabled instead when it's available in chart api
                if (this.cbSeriesShadow.isSelected()) {
                    const blur = this.inputSeriesShadowBlur.getValue() ? Number.parseInt(this.inputSeriesShadowBlur.getValue()) : 0;
                    const xOffset = this.inputSeriesShadowXOffset.getValue() ? Number.parseInt(this.inputSeriesShadowXOffset.getValue()) : 0;
                    const yOffset = this.inputSeriesShadowYOffset.getValue() ? Number.parseInt(this.inputSeriesShadowYOffset.getValue()) : 0;
                    const color = this.inputSeriesShadowColor.getValue() ? this.inputSeriesShadowColor.getValue() : 'rgba(0,0,0,0.5)';
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
        this.inputSeriesShadowBlur.setLabel('Blur');
        if (pieSeries.length > 0) {
            if (pieSeries[0].shadow) {
                this.inputSeriesShadowBlur.setValue(pieSeries[0].shadow.blur + '');
            }
        }
        this.addDestroyableEventListener(this.inputSeriesShadowBlur.getInputElement(), 'input', updateShadow);

        // X Offset
        this.inputSeriesShadowXOffset.setLabel('X Offset');
        if (pieSeries.length > 0) {
            if (pieSeries[0].shadow) {
                this.inputSeriesShadowXOffset.setValue(pieSeries[0].shadow.offset.x + '');
            }
        }
        this.addDestroyableEventListener(this.inputSeriesShadowXOffset.getInputElement(), 'input', updateShadow);

        // Y Offset
        this.inputSeriesShadowYOffset.setLabel('Y Offset');
        if (pieSeries.length > 0) {
            if (pieSeries[0].shadow) {
                this.inputSeriesShadowYOffset.setValue(pieSeries[0].shadow.offset.y + '');
            }
        }
        this.addDestroyableEventListener(this.inputSeriesShadowYOffset.getInputElement(), 'input', updateShadow);

        // TODO replace with Color Picker
        this.inputSeriesShadowColor.setLabel('Color');
        if (pieSeries.length > 0) {
            if (pieSeries[0].shadow) {
                this.inputSeriesShadowColor.setValue(pieSeries[0].shadow.color + '');
            }
        }
        this.addDestroyableEventListener(this.inputSeriesShadowColor.getInputElement(), 'input', updateShadow);
    }
}