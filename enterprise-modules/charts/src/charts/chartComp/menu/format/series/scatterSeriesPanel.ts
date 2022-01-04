import {
    _,
    AgGroupComponent,
    AgGroupComponentParams,
    AgToggleButton,
    Autowired,
    Component,
    PostConstruct,
    RefSelector
} from "@ag-grid-community/core";
import { MarkersPanel } from "./markersPanel";
import { ChartTranslationService } from "../../../services/chartTranslationService";
import { initFontPanelParams } from "../widgetInitialiser";
import { FontPanel, FontPanelParams } from "../fontPanel";
import { ChartOptionsService } from "../../../services/chartOptionsService";

export class ScatterSeriesPanel extends Component {

    public static TEMPLATE = /* html */
        `<div>
            <ag-group-component ref="seriesGroup">
                <ag-toggle-button ref="seriesTooltipsToggle"></ag-toggle-button>
            </ag-group-component>
        </div>`;

    @RefSelector('seriesGroup') private seriesGroup: AgGroupComponent;
    @RefSelector('seriesTooltipsToggle') private seriesTooltipsToggle: AgToggleButton;

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
        this.setTemplate(ScatterSeriesPanel.TEMPLATE, {seriesGroup: groupParams});

        this.initSeriesGroup();
        this.initSeriesTooltips();
        this.initMarkersPanel();
        this.initLabelPanel();
    }

    private initSeriesGroup() {
        this.seriesGroup
            .setTitle(this.chartTranslationService.translate("series"))
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
