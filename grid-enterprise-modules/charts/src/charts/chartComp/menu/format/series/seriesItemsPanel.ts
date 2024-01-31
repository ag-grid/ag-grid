import {
    _,
    AgGroupComponentParams,
    AgSelect,
    AgSlider,
    AgGroupComponent,
    Autowired,
    Component,
    ListOption,
    PostConstruct,
    RefSelector
} from "@ag-grid-community/core";
import { ChartTranslationService } from "../../../services/chartTranslationService";
import { ChartOptionsService } from "../../../services/chartOptionsService";
import { ChartSeriesType } from "../../../utils/seriesTypeMapper";
import { initFontPanelParams } from "./fontPanelParams";
import { FontPanel } from "../fontPanel";

type SeriesItemType = 'positive' | 'negative';

export class SeriesItemsPanel extends Component {

    public static TEMPLATE = /* html */
        `<div>
            <ag-group-component ref="seriesItemsGroup">
                <ag-select ref="seriesItemSelect"></ag-select>
            </ag-group-component>
        </div>`;

    @RefSelector('seriesItemsGroup') private seriesItemsGroup: AgGroupComponent;
    @RefSelector('seriesItemSelect') private seriesItemSelect: AgSelect;

    @Autowired('chartTranslationService') private chartTranslationService: ChartTranslationService;

    private activePanels: Component[] = [];

    constructor(private readonly chartOptionsService: ChartOptionsService,
                private getSelectedSeries: () => ChartSeriesType) {
        super();
    }

    @PostConstruct
    private init() {
        const seriesItemsGroupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            title: this.chartTranslationService.translate('seriesItems'),
            enabled: true,
            suppressOpenCloseIcons: true,
            suppressEnabledCheckbox: true,
        };
        this.setTemplate(SeriesItemsPanel.TEMPLATE, {seriesItemsGroup: seriesItemsGroupParams});

        this.initSeriesItems();
        this.initSeriesControls();
    }

    private initSeriesItems() {
        const selectOptions: ListOption<SeriesItemType>[] = [
            {value: 'positive', text: this.chartTranslationService.translate('seriesItemPositive')},
            {value: 'negative', text: this.chartTranslationService.translate('seriesItemNegative')},
        ];

        const seriesItemChangedCallback = (newValue: SeriesItemType) => {
            this.destroyActivePanels();
            this.initSeriesControls(newValue as SeriesItemType);
        }

        this.seriesItemSelect
            .setLabel(this.chartTranslationService.translate('seriesItemType'))
            .setLabelAlignment("left")
            .setLabelWidth('flex')
            .setInputWidth('flex')
            .addOptions(selectOptions)
            .setValue('positive')
            .onValueChange(seriesItemChangedCallback);
    }

    private initSeriesControls(itemType: SeriesItemType = 'positive') {
        this.initSlider("strokeWidth", 0, 10, 45, `item.${itemType}.strokeWidth`);
        this.initSlider("lineDash", 0, 30, 45, `item.${itemType}.lineDash`, 1, true);
        this.initSlider("strokeOpacity", 0, 1, 45, `item.${itemType}.strokeOpacity`, 0.05, false);
        this.initSlider("fillOpacity", 0, 1, 45, `item.${itemType}.fillOpacity`, 0.05, false);
        this.initItemLabels(itemType);
    }

    private initSlider(labelKey: string, minValue: number, maxValue: number, textFieldWidth: number, seriesOptionKey: string, step: number = 1, isArray: boolean = false) {
        const itemSlider = this.seriesItemsGroup.createManagedBean(new AgSlider());
        const value = this.chartOptionsService.getSeriesOption(seriesOptionKey, this.getSelectedSeries());

        const sliderChangedCallback = (newValue: number) => {
            const value = isArray ? [newValue] : newValue;
            this.chartOptionsService.setSeriesOption(seriesOptionKey, value, this.getSelectedSeries());
        }

        itemSlider
            .setLabel(this.chartTranslationService.translate(labelKey))
            .setMinValue(minValue)
            .setMaxValue(maxValue)
            .setTextFieldWidth(textFieldWidth)
            .setValue(`${value}`)
            .setStep(step)
            .onValueChange(sliderChangedCallback);

        this.seriesItemsGroup.addItem(itemSlider);
        this.activePanels.push(itemSlider);
    }

    private initItemLabels(itemType: "positive" | "negative") {
        const sectorParams = initFontPanelParams({
            labelName: this.chartTranslationService.translate('seriesItemLabels'),
            chartOptionsService: this.chartOptionsService,
            getSelectedSeries: () => this.getSelectedSeries(),
            seriesOptionLabelProperty: `item.${itemType}.label`
        });

        const labelPanelComp = this.createBean(new FontPanel(sectorParams));
        this.seriesItemsGroup.addItem(labelPanelComp);
        this.activePanels.push(labelPanelComp);
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
