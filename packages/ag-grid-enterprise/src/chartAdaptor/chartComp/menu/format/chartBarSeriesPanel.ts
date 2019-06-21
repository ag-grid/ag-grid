import {_, AgCheckbox, Component, PostConstruct, RefSelector, AgGroupComponent, AgInputTextField, AgColorPicker} from "ag-grid-community";
import {ChartController} from "../../chartController";
import {Chart} from "../../../../charts/chart/chart";
import {BarSeries} from "../../../../charts/chart/series/barSeries";
import {ChartShadowPanel} from "./chartShadowPanel";

export class ChartBarSeriesPanel extends Component {

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
                    <ag-color-picker ref="inputSeriesLabelColor"></ag-color-picker>
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
    @RefSelector('inputSeriesLabelColor') private inputSeriesLabelColor: AgColorPicker;

    private readonly chartController: ChartController;
    private chart: Chart;
    private activePanels: Component[] = [];

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

        const shadowPanelComp = new ChartShadowPanel(this.chartController);
        this.getContext().wireBean(shadowPanelComp);
        this.seriesGroup.getGui().appendChild(shadowPanelComp.getGui());
        this.activePanels.push(shadowPanelComp);
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

        const barSeries = this.chart.series as BarSeries[];
        if (barSeries.length > 0) {
            this.inputSeriesStrokeWidth.setValue(`${barSeries[0].strokeWidth}`);
        }

        this.addDestroyableEventListener(this.inputSeriesStrokeWidth.getInputElement(), 'input', () => {
            (this.chart.series as BarSeries[]).forEach(series => {
                series.strokeWidth = Number.parseInt(this.inputSeriesStrokeWidth.getValue());
            });
        });
    }

    private initSeriesLabels() {
        const barSeries = this.chart.series as BarSeries[];

        let enabled = _.every(barSeries, barSeries => barSeries.labelEnabled);

        this.labelSeriesLabels.setLabel('Labels');
        this.cbSeriesLabelsEnabled.setLabel('Enabled');
        this.cbSeriesLabelsEnabled.setSelected(enabled);
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
            const fontSize = Number.parseInt(this.inputSeriesFontSize.getValue());
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

        this.inputSeriesFontSize
            .setLabel('Size')
            .setValue(fontSize);

        this.addDestroyableEventListener(this.inputSeriesFontSize.getInputElement(), 'input', () => {
            const font = fonts[this.selectSeriesFont.selectedIndex];
            const fontSize = Number.parseInt(this.inputSeriesFontSize.getValue());
            const barSeries = this.chart.series as BarSeries[];
            barSeries.forEach(series => {
                series.labelFont = `${fontSize}px ${font}`;
            });
        });

        this.inputSeriesLabelColor.setValue(barSeries[0].labelColor);

        this.inputSeriesLabelColor.addDestroyableEventListener(this.inputSeriesLabelColor, 'valueChange', () => {
            const barSeries = this.chart.series as BarSeries[];
            barSeries.forEach(series => {
                series.labelColor = this.inputSeriesLabelColor.getValue();
            });
        });
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