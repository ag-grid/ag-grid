import {
    _,
    AgGroupComponent,
    AgSlider,
    Component,
    PostConstruct,
    RefSelector,
    AgToggleButton, Autowired,
} from "ag-grid-community";
import { ChartController } from "../../../chartController";
import { BarSeries } from "../../../../../charts/chart/series/barSeries";
import { ShadowPanel } from "./shadowPanel";
import {LabelFont, LabelPanel, LabelPanelParams} from "../label/labelPanel";
import {ExpandablePanel} from "../chartFormatingPanel";
import {ChartTranslator} from "../../../chartTranslator";

export class BarSeriesPanel extends Component implements ExpandablePanel {

    public static TEMPLATE =
        `<div>   
            <ag-group-component ref="seriesGroup">
                <ag-toggle-button ref="seriesTooltipsToggle"></ag-toggle-button>
                <ag-slider ref="seriesStrokeWidthSlider"></ag-slider>
            </ag-group-component>
        </div>`;

    @RefSelector('seriesGroup') private seriesGroup: AgGroupComponent;
    @RefSelector('seriesTooltipsToggle') private seriesTooltipsToggle: AgToggleButton;
    @RefSelector('seriesStrokeWidthSlider') private seriesStrokeWidthSlider: AgSlider;

    @Autowired('chartTranslator') private chartTranslator: ChartTranslator;

    private readonly chartController: ChartController;
    private activePanels: Component[] = [];
    private series: BarSeries[];

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        this.setTemplate(BarSeriesPanel.TEMPLATE);

        const chartProxy = this.chartController.getChartProxy();
        this.series = chartProxy.getChart().series as BarSeries[];

        this.seriesGroup
            .setTitle(this.chartTranslator.translate('series'))
            .toggleGroupExpand(false)
            .hideEnabledCheckbox(true);

        this.initSeriesStrokeWidth();
        this.initSeriesTooltips();
        this.initLabelPanel();
        this.initShadowPanel();
    }

    public expandPanel(expanded: boolean) {
        this.seriesGroup.toggleGroupExpand(expanded);
    }

    public setExpandedCallback(expandedCallback: () => void) {
        this.addDestroyableEventListener(this.seriesGroup, 'expanded', expandedCallback);
    }

    private initSeriesStrokeWidth() {
        this.seriesStrokeWidthSlider
            .setLabel(this.chartTranslator.translate('strokeWidth'))
            .setMaxValue(10)
            .setTextFieldWidth(45)
            .setValue(`${this.series[0].strokeWidth}`)
            .onValueChange(newValue => this.series.forEach(s => s.strokeWidth = newValue));
    }

    private initSeriesTooltips() {
        const selected = this.series.some(s => s.tooltipEnabled);

        this.seriesTooltipsToggle
            .setLabel(this.chartTranslator.translate('tooltips'))
            .setLabelAlignment('left')
            .setLabelWidth('flex')
            .setInputWidth(40)
            .setValue(selected)
            .onValueChange(newSelection => {
                this.series.forEach(s => s.tooltipEnabled = newSelection);
            });
    }

    private initLabelPanel() {
        const initialFont = {
            family: this.series[0].labelFontFamily,
            style: this.series[0].labelFontStyle,
            weight: this.series[0].labelFontWeight,
            size: this.series[0].labelFontSize,
            color: this.series[0].labelColor
        };

        const setFont = (font: LabelFont) => {
            if (font.family) this.series.forEach(s => s.labelFontFamily = font.family as string);
            if (font.style) this.series.forEach(s => s.labelFontStyle = font.style);
            if (font.weight) this.series.forEach(s => s.labelFontWeight = font.weight);
            if (font.size) this.series.forEach(s => s.labelFontSize = font.size as number);
            if (font.color) this.series.forEach(s => s.labelColor = font.color as string);
        };

        const params: LabelPanelParams = {
            enabled: this.series.some(s => s.labelEnabled),
            setEnabled: (enabled: boolean) => {
                this.series.forEach(s => s.labelEnabled = enabled);
            },
            suppressEnabledCheckbox: false,
            initialFont: initialFont,
            setFont: setFont
        };

        const labelPanelComp = new LabelPanel(this.chartController, params);
        this.getContext().wireBean(labelPanelComp);
        this.activePanels.push(labelPanelComp);


        const labelOffsetSlider = new AgSlider();
        this.getContext().wireBean(labelOffsetSlider);

        labelOffsetSlider
            .setLabel(this.chartTranslator.translate('offsets'))
            .setValue(`${this.series[0].labelOffset}`)
            .setMinValue(-100)
            .setMaxValue(100)
            .setTextFieldWidth(45)
            .onValueChange(newValue => this.series.forEach(s => s.labelOffset = newValue));

        labelPanelComp.addCompToPanel(labelOffsetSlider);
        this.activePanels.push(labelOffsetSlider);

        this.seriesGroup.addItem(labelPanelComp);
    }

    private initShadowPanel() {
        const shadowPanelComp = new ShadowPanel(this.chartController);
        this.getContext().wireBean(shadowPanelComp);
        this.seriesGroup.addItem(shadowPanelComp);
        this.activePanels.push(shadowPanelComp);
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
