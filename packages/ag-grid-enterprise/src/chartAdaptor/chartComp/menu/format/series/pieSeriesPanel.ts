import {
    _,
    AgGroupComponent,
    AgSlider, AgToggleButton,
    Component,
    PostConstruct,
    RefSelector
} from "ag-grid-community";
import { ChartController } from "../../../chartController";
import { PieSeries } from "../../../../../charts/chart/series/pieSeries";
import { ShadowPanel } from "./shadowPanel";
import {LabelFont, LabelPanel, LabelPanelParams} from "../label/labelPanel";
import {CalloutPanel} from "./calloutPanel";
import {ExpandablePanel} from "../chartFormatingPanel";

export class PieSeriesPanel extends Component implements ExpandablePanel {

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

    private readonly chartController: ChartController;

    private activePanels: Component[] = [];
    private series: PieSeries[];

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        this.setTemplate(PieSeriesPanel.TEMPLATE);

        const chartProxy = this.chartController.getChartProxy();
        this.series = chartProxy.getChart().series as PieSeries[];

        this.initGroup();
        this.initSeriesTooltips();
        this.initSeriesStrokeWidth();
        this.initLabelPanel();
        this.initShadowPanel();
    }

    public expandPanel(expanded: boolean): void {
        this.seriesGroup.toggleGroupExpand(expanded);
    }

    public setExpandedCallback(expandedCallback: () => void) {
        this.addDestroyableEventListener(this.seriesGroup, 'expanded', expandedCallback);
    }

    private initGroup() {
        this.seriesGroup
            .setTitle('Series')
            .toggleGroupExpand(false)
            .hideEnabledCheckbox(true);
    }

    private initSeriesTooltips() {
        const selected = this.series.some(s => s.tooltipEnabled);

        this.seriesTooltipsToggle
            .setLabel('Tooltips')
            .setLabelAlignment('left')
            .setLabelWidth('flex')
            .setInputWidth(40)
            .setValue(selected)
            .onValueChange(newSelection => {
                this.series.forEach(s => s.tooltipEnabled = newSelection);
            });
    }

    private initSeriesStrokeWidth() {
        this.seriesStrokeWidthSlider
            .setLabel('Stroke Width')
            .setMaxValue(30)
            .setTextFieldWidth(45)
            .setValue(`${this.series[0].strokeWidth}`)
            .onValueChange(newValue => this.series.forEach(s => s.strokeWidth = newValue));
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

        const calloutPanelComp = new CalloutPanel(this.series);
        this.getContext().wireBean(calloutPanelComp);
        labelPanelComp.addCompToPanel(calloutPanelComp);
        this.activePanels.push(calloutPanelComp);

        this.seriesGroup.addItem(labelPanelComp);
    }

    private initShadowPanel() {
        const shadowPanelComp = new ShadowPanel(this.chartController);
        this.getContext().wireBean(shadowPanelComp);
        this.seriesGroup.getGui().appendChild(shadowPanelComp.getGui());
        this.seriesGroup.addItem(shadowPanelComp);
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