import {
    _,
    AgGroupComponent,
    AgInputTextArea,
    Autowired,
    Component,
    PostConstruct,
    RefSelector
} from "@ag-community/grid-core";
import { ChartController } from "../../../chartController";
import { PaddingPanel } from "./paddingPanel";
import { LabelFont, LabelPanel, LabelPanelParams } from "../label/labelPanel";
import { ChartTranslator } from "../../../chartTranslator";
import { ChartProxy } from "../../../chartProxies/chartProxy";

export class ChartPanel extends Component {

    public static TEMPLATE =
        `<div>
            <ag-group-component ref="chartGroup">
                <ag-input-text-area ref="titleInput"></ag-input-text-area>
            </ag-group-component>
        <div>`;

    @RefSelector('chartGroup') private chartGroup: AgGroupComponent;
    @RefSelector('titleInput') private titleInput: AgInputTextArea;

    @Autowired('chartTranslator') private chartTranslator: ChartTranslator;

    private chartProxy: ChartProxy<any, any>;
    private activePanels: Component[] = [];
    private readonly chartController: ChartController;

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
        this.chartProxy = this.chartController.getChartProxy();
    }

    @PostConstruct
    private init() {
        this.setTemplate(ChartPanel.TEMPLATE);

        this.initGroup();
        this.initTitles();
        this.initPaddingPanel();
    }

    private initGroup(): void {
        this.chartGroup
            .setTitle(this.chartTranslator.translate("chart"))
            .toggleGroupExpand(false)
            .hideEnabledCheckbox(true);
    }

    private initTitles(): void {
        const { title } = this.chartProxy.getChartOption("title");
        const text = title ? title.text : "";

        // note we don't set the font style via chart title panel
        const setFont = (font: LabelFont) => {
            if (font.family) { this.chartProxy.setTitleOption("fontFamily", font.family); }
            if (font.weight) { this.chartProxy.setTitleOption("fontWeight", font.weight); }
            if (font.size) { this.chartProxy.setTitleOption("fontSize", font.size); }
            if (font.color) { this.chartProxy.setTitleOption("color", font.color); }
        };

        const initialFont = {
            family: title ? this.chartProxy.getChartOption("title.fontFamily") : "Verdana, sans-serif",
            style: title ? this.chartProxy.getChartOption("title.fontStyle") : "",
            weight: title ? this.chartProxy.getChartOption("title.fontWeight") : "Normal",
            size: title ? this.chartProxy.getChartOption<number>("title.fontSize") : 22,
            color: title ? this.chartProxy.getChartOption("title.color") : "black"
        };

        if (!title) {
            setFont(initialFont);
        }

        this.titleInput
            .setLabel(this.chartTranslator.translate("title"))
            .setLabelAlignment("top")
            .setLabelWidth("flex")
            .setValue(text)
            .onValueChange(value => {
                this.chartProxy.setTitleOption("text", value);

                // only show font panel when title exists
                labelPanelComp.setEnabled(_.exists(value));
            });

        const params: LabelPanelParams = {
            name: this.chartTranslator.translate("font"),
            enabled: true,
            suppressEnabledCheckbox: true,
            initialFont,
            setFont,
        };

        const labelPanelComp = this.wireBean(new LabelPanel(params));
        this.chartGroup.addItem(labelPanelComp);
        this.activePanels.push(labelPanelComp);

        labelPanelComp.setEnabled(_.exists(text));
    }

    private initPaddingPanel(): void {
        const paddingPanelComp = this.wireBean(new PaddingPanel(this.chartController));
        this.chartGroup.addItem(paddingPanelComp);
        this.activePanels.push(paddingPanelComp);
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
