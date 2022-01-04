import {
    _,
    AgGroupComponent,
    AgGroupComponentParams,
    AgSlider,
    AgToggleButton,
    Autowired,
    Component,
    PostConstruct,
    RefSelector
} from "@ag-grid-community/core";
import { MarkersPanel } from "./markersPanel";
import { ChartTranslationService } from "../../../services/chartTranslationService";
import { ChartOptionsService } from "../../../services/chartOptionsService";
import { initFontPanelParams } from "../widgetInitialiser";
import { FontPanel, FontPanelParams } from "../fontPanel";
import { getMaxValue } from "../formatPanel";

export class LineSeriesPanel extends Component {

    public static TEMPLATE = /* html */
        `<div>
            <ag-group-component ref="seriesGroup">
                <ag-toggle-button ref="seriesTooltipsToggle"></ag-toggle-button>
                <ag-slider ref="seriesLineWidthSlider"></ag-slider>
                <ag-slider ref="seriesLineDashSlider"></ag-slider>
            </ag-group-component>
        </div>`;

    @RefSelector('seriesGroup') private seriesGroup: AgGroupComponent;
    @RefSelector('seriesTooltipsToggle') private seriesTooltipsToggle: AgToggleButton;
    @RefSelector('seriesLineWidthSlider') private seriesLineWidthSlider: AgSlider;
    @RefSelector('seriesLineDashSlider') private seriesLineDashSlider: AgSlider;

    @Autowired('chartTranslationService') private chartTranslationService: ChartTranslationService;

    private activePanels: Component[] = [];

    constructor(private readonly chartOptionsService: ChartOptionsService) {
        super();
    }

    @PostConstruct
    private init() {
        const groupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical'
        };
        this.setTemplate(LineSeriesPanel.TEMPLATE, {seriesGroup: groupParams});

        this.initSeriesGroup();
        this.initSeriesTooltips();
        this.initSeriesLineWidth();
        this.initSeriesLineDash();
        this.initMarkersPanel();
        this.initLabelPanel();
    }

    private initSeriesGroup() {
        this.seriesGroup
            .setTitle(this.getTitle())
            .toggleGroupExpand(false)
            .hideEnabledCheckbox(true);
    }

    private initSeriesTooltips() {
        this.seriesTooltipsToggle
            .setLabel(this.chartTranslationService.translate("tooltips"))
            .setLabelAlignment("left")
            .setLabelWidth("flex")
            .setInputWidth(45)
            .setValue(this.chartOptionsService.getSeriesOption("tooltip.enabled") || false)
            .onValueChange(newValue => this.chartOptionsService.setSeriesOption("tooltip.enabled", newValue));
    }

    private initSeriesLineWidth() {
        const currentValue = this.chartOptionsService.getSeriesOption<number>("strokeWidth");
        this.seriesLineWidthSlider
            .setLabel(this.chartTranslationService.translate('lineWidth'))
            .setMaxValue(getMaxValue(currentValue, 10))
            .setTextFieldWidth(45)
            .setValue(`${currentValue}`)
            .onValueChange(newValue => this.chartOptionsService.setSeriesOption("strokeWidth", newValue));
    }

    private initSeriesLineDash() {
        const currentValue = this.chartOptionsService.getSeriesOption<number>("lineDash");
        this.seriesLineDashSlider
            .setLabel(this.chartTranslationService.translate('lineDash'))
            .setMaxValue(getMaxValue(currentValue, 30))
            .setTextFieldWidth(45)
            .setValue(`${currentValue}`)
            .onValueChange(newValue => this.chartOptionsService.setSeriesOption("lineDash", [newValue]));
    }

    private initMarkersPanel() {
        const markersPanelComp = this.createBean(new MarkersPanel(this.chartOptionsService));
        this.seriesGroup.addItem(markersPanelComp);
        this.activePanels.push(markersPanelComp);
    }

    private initLabelPanel() {
        const params: FontPanelParams = initFontPanelParams(this.chartTranslationService, this.chartOptionsService);
        const labelPanelComp = this.createBean(new FontPanel(params));
        this.activePanels.push(labelPanelComp);
        this.seriesGroup.addItem(labelPanelComp);
    }

    private getTitle() {
        let seriesTitle = this.chartTranslationService.translate("series");
        if (['groupedColumnLine', 'stackedColumnLine'].includes(this.chartOptionsService.getChartType())) {
            const lineTitle = this.chartTranslationService.translate("lineGroup");
            return  `${seriesTitle} (${lineTitle})`;
        }
        return seriesTitle;
    }

    private destroyActivePanels(): void {
        this.activePanels.forEach(panel => {
            _.removeFromParent(panel.getGui());
            this.destroyBean(panel);
        });
    }

    protected destroy(): void {
        this.destroyActivePanels();
        super.destroy();
    }
}
