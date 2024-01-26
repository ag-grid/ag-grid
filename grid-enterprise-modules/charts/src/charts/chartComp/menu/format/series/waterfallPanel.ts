import {
    AgGroupComponent,
    AgGroupComponentParams,
    AgSlider,
    Autowired,
    Component,
    PostConstruct,
    RefSelector,
} from "@ag-grid-community/core";
import { ChartTranslationService } from "../../../services/chartTranslationService";
import { ChartOptionsService } from "../../../services/chartOptionsService";
import { ChartSeriesType } from "../../../utils/seriesTypeMapper";
import { AgColorPicker } from "../../../../../widgets/agColorPicker";

export class WaterfallPanel extends Component {

    public static TEMPLATE = /* html */
        `<div>
            <ag-group-component ref="lineGroup">
                <ag-color-picker ref="lineColorPicker"></ag-color-picker>
                <ag-slider ref="lineStrokeWidthSlider"></ag-slider>
                <ag-slider ref="lineOpacitySlider"></ag-slider>
                <ag-slider ref="lineDashSlider"></ag-slider>
                <ag-slider ref="lineDashOffsetSlider"></ag-slider>
            </ag-group-component>
        </div>`;

    @RefSelector('lineGroup') private lineGroup: AgGroupComponent;
    @RefSelector('lineColorPicker') private lineColorPicker: AgColorPicker;
    @RefSelector('lineStrokeWidthSlider') private lineStrokeWidthSlider: AgSlider;
    @RefSelector('lineOpacitySlider') private lineOpacitySlider: AgSlider;
    @RefSelector('lineDashSlider') private lineDashSlider: AgSlider;
    @RefSelector('lineDashOffsetSlider') private lineDashOffsetSlider: AgSlider;

    @Autowired('chartTranslationService') private chartTranslationService: ChartTranslationService;

    constructor(private readonly chartOptionsService: ChartOptionsService,
                private getSelectedSeries: () => ChartSeriesType) {
        super();
    }

    @PostConstruct
    private init() {
        const lineGroupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            title: this.chartTranslationService.translate("connectorLine"),
            enabled: true,
            suppressOpenCloseIcons: true,
            suppressEnabledCheckbox: true,
        };
        this.setTemplate(WaterfallPanel.TEMPLATE, {lineGroup: lineGroupParams});

        this.initLineControls();
        this.initItemControls();
    }

    private initLineControls() {
        const lineColor = this.chartOptionsService.getSeriesOption<string | undefined | null>("line.stroke", this.getSelectedSeries());
        this.lineColorPicker
            .setLabel(this.chartTranslationService.translate("color"))
            .setLabelWidth("flex") 
            .setValue(lineColor == null ? 'transparent' : `${lineColor}`)
            .onValueChange(newValue => this.chartOptionsService.setSeriesOption("line.stroke", newValue, this.getSelectedSeries()));

        const strokeWidth = this.chartOptionsService.getSeriesOption<number>("line.strokeWidth", this.getSelectedSeries());
        this.lineStrokeWidthSlider
            .setLabel(this.chartTranslationService.translate("strokeWidth"))
            .setMinValue(0)
            .setMaxValue(10)
            .setTextFieldWidth(45)
            .setValue(`${strokeWidth}`)
            .onValueChange(newValue => this.chartOptionsService.setSeriesOption("line.strokeWidth", newValue, this.getSelectedSeries()));

        const strokeOpacity = this.chartOptionsService.getSeriesOption<number>("line.strokeOpacity", this.getSelectedSeries());
        this.lineOpacitySlider
            .setLabel(this.chartTranslationService.translate("strokeOpacity"))
            .setStep(0.05)
            .setMinValue(0)
            .setMaxValue(1)
            .setTextFieldWidth(45)
            .setValue(`${strokeOpacity}`)
            .onValueChange(newValue => this.chartOptionsService.setSeriesOption("line.strokeOpacity", newValue, this.getSelectedSeries()));

        const lineDash = this.chartOptionsService.getSeriesOption<number[]>("line.lineDash", this.getSelectedSeries());
        this.lineDashSlider
            .setLabel(this.chartTranslationService.translate("lineDash"))
            .setMinValue(0)
            .setMaxValue(30)
            .setTextFieldWidth(45)
            .setValue(`${lineDash}`)
            .onValueChange(newValue => this.chartOptionsService.setSeriesOption("line.lineDash", [newValue], this.getSelectedSeries()));

        const lineDashOffset = this.chartOptionsService.getSeriesOption<number>("line.lineDashOffset", this.getSelectedSeries());
        this.lineDashOffsetSlider
            .setLabel(this.chartTranslationService.translate("lineDashOffset"))
            .setMinValue(0)
            .setMaxValue(30)
            .setTextFieldWidth(45)
            .setValue(`${lineDashOffset}`)
            .onValueChange(newValue => this.chartOptionsService.setSeriesOption("line.lineDashOffset", newValue, this.getSelectedSeries()));
    }

    private initItemControls() {
        const positiveItemComp = this.initItemControl("positive", "item.positive");
        const negativeItemComp = this.initItemControl("negative", "item.negative");

        const container = this.getGui();
        container.appendChild(positiveItemComp.getGui());
        container.appendChild(negativeItemComp.getGui());
    }

    private initItemControl(localeKey: string, propertyKey: string): WaterfallItemPanel {
        const itemComp = new WaterfallItemPanel(this.chartOptionsService, this.getSelectedSeries, localeKey, propertyKey);
        return this.createManagedBean(itemComp);
    }
}

class WaterfallItemPanel extends Component {

    public static TEMPLATE = /* html */
        `<ag-group-component ref="itemGroup">
            <ag-color-picker ref="fillColorPicker"></ag-color-picker>
            <ag-slider ref="strokeWidthSlider"></ag-slider>
            <ag-slider ref="lineDashSlider"></ag-slider>
            <ag-slider ref="lineOpacitySlider"></ag-slider>
            <ag-slider ref="fillOpacitySlider"></ag-slider>
        </ag-group-component>`;

    @RefSelector('itemGroup') private itemGroup: AgGroupComponent;
    @RefSelector('fillColorPicker') private fillColorPicker: AgColorPicker;
    @RefSelector('strokeWidthSlider') private strokeWidthSlider: AgSlider;
    @RefSelector('lineDashSlider') private lineDashSlider: AgSlider;
    @RefSelector('lineOpacitySlider') private lineOpacitySlider: AgSlider;
    @RefSelector('fillOpacitySlider') private fillOpacitySlider: AgSlider;

    @Autowired('chartTranslationService') private chartTranslationService: ChartTranslationService;

    constructor(private readonly chartOptionsService: ChartOptionsService,
                private getSelectedSeries: () => ChartSeriesType,
                private localeKey: string,
                private propertyKey: string) {
        super();
    }

    @PostConstruct
    private init() {
        const groupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            title: this.chartTranslationService.translate(this.localeKey),
            enabled: true,
            suppressOpenCloseIcons: true,
            suppressEnabledCheckbox: true,
        };
        this.setTemplate(WaterfallPanel.TEMPLATE, {itemGroup: groupParams});

        this.initControls();
    }

    private initControls() {
        const propertyNamespace = this.propertyKey;

        const fillColor = this.chartOptionsService.getSeriesOption<string | undefined | null>(`${propertyNamespace}.fill`, this.getSelectedSeries());
        this.fillColorPicker
            .setLabel(this.chartTranslationService.translate("color"))
            .setLabelWidth("flex") 
            .setValue(fillColor == null ? 'transparent' : `${fillColor}`)
            .onValueChange(newValue => this.chartOptionsService.setSeriesOption(`${propertyNamespace}.fill`, newValue, this.getSelectedSeries()));

        const strokeWidth = this.chartOptionsService.getSeriesOption<number>(`${propertyNamespace}.strokeWidth`, this.getSelectedSeries());
        this.strokeWidthSlider
            .setLabel(this.chartTranslationService.translate("strokeWidth"))
            .setMinValue(0)
            .setMaxValue(10)
            .setTextFieldWidth(45)
            .setValue(`${strokeWidth}`)
            .onValueChange(newValue => this.chartOptionsService.setSeriesOption(`${propertyNamespace}.strokeWidth`, newValue, this.getSelectedSeries()));

        const lineDash = this.chartOptionsService.getSeriesOption<number[]>(`${propertyNamespace}.lineDash`, this.getSelectedSeries());
        this.lineDashSlider
            .setLabel(this.chartTranslationService.translate("lineDash"))
            .setMinValue(0)
            .setMaxValue(30)
            .setTextFieldWidth(45)
            .setValue(`${lineDash}`)
            .onValueChange(newValue => this.chartOptionsService.setSeriesOption(`${propertyNamespace}.lineDash`, [newValue], this.getSelectedSeries()));

        const strokeOpacity = this.chartOptionsService.getSeriesOption<number>(`${propertyNamespace}.strokeOpacity`, this.getSelectedSeries());
        this.lineOpacitySlider
            .setLabel(this.chartTranslationService.translate("strokeOpacity"))
            .setStep(0.05)
            .setMinValue(0)
            .setMaxValue(1)
            .setTextFieldWidth(45)
            .setValue(`${strokeOpacity}`)
            .onValueChange(newValue => this.chartOptionsService.setSeriesOption(`${propertyNamespace}.strokeOpacity`, newValue, this.getSelectedSeries()));

        const fillOpacity = this.chartOptionsService.getSeriesOption<number>(`${propertyNamespace}.fillOpacity`, this.getSelectedSeries());
        this.fillOpacitySlider
            .setLabel(this.chartTranslationService.translate("fillOpacity"))
            .setStep(0.05)
            .setMinValue(0)
            .setMaxValue(1)
            .setTextFieldWidth(45)
            .setValue(`${fillOpacity}`)
            .onValueChange(newValue => this.chartOptionsService.setSeriesOption(`${propertyNamespace}.fillOpacity`, newValue, this.getSelectedSeries()));

    }
}