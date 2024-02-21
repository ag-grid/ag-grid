import {
    _,
    AgSlider,
    Autowired,
    ChartMenuOptions,
    Component,
    GetChartToolbarItemsParams,
    PostConstruct,
    WithoutGridCommon
} from "@ag-grid-community/core";
import { FontPanel, FontPanelParams } from "../fontPanel";
import { ChartTranslationService } from "../../../services/chartTranslationService";
import { ChartOptionsService } from "../../../services/chartOptionsService";
import { ChartMenuUtils } from "../../chartMenuUtils";

export default class TitlePanel extends Component {

    public static TEMPLATE = /* html */ `<div></div>`;

    @Autowired('chartTranslationService') private readonly chartTranslationService: ChartTranslationService;
    @Autowired('chartMenuUtils') private readonly chartMenuUtils: ChartMenuUtils;

    private activePanels: Component[] = [];
    private titlePlaceholder: string;

    constructor(private readonly chartOptionsService: ChartOptionsService) {
        super(TitlePanel.TEMPLATE);
    }

    @PostConstruct
    private init() {
        this.initFontPanel();
        this.titlePlaceholder = this.chartTranslationService.translate('titlePlaceholder');
    }

    private hasTitle(): boolean {
        const title: any = this.getOption('title');
        return title && title.enabled && title.text && title.text.length > 0;
    }

    private initFontPanel(): void {
        const hasTitle = this.hasTitle();

        const fontPanelParams: FontPanelParams = {
            name: this.chartTranslationService.translate('title'),
            enabled: hasTitle,
            suppressEnabledCheckbox: false,
            fontModelProxy: {
                setValue: (key, value) => this.setOption(`title.${key}`, value),
                getValue: key => this.getOption(`title.${key}`)
            },
            setEnabled: (enabled) => {
                if (this.toolbarExists()) {
                    // extra padding is only included when the toolbar is present
                    const topPadding: number = this.getOption('padding.top');
                    this.setOption('padding.top', enabled ? topPadding - 20 : topPadding + 20);
                }

                this.setOption('title.enabled', enabled);
                const currentTitleText = this.getOption('title.text');
                const replaceableTitleText = currentTitleText === 'Title' || currentTitleText?.trim().length === 0;
                if (enabled && replaceableTitleText) {
                    this.setOption('title.text', this.titlePlaceholder);
                }
            }
        };

        const fontPanelComp = this.createBean(new FontPanel(fontPanelParams));

        // add the title spacing slider to font panel
        fontPanelComp.addItemToPanel(this.createSpacingSlicer());

        this.getGui().appendChild(fontPanelComp.getGui());
        this.activePanels.push(fontPanelComp);

        // edits to the title can disable it, so keep the checkbox in sync:
        this.addManagedListener(this.eventService, 'chartTitleEdit', () => {
            fontPanelComp.setEnabled(this.hasTitle());
        });
    }

    private createSpacingSlicer() {
        return this.createBean(new AgSlider(this.chartMenuUtils.getDefaultSliderParams({
            labelKey: 'spacing',
            defaultMaxValue: 100,
            value: this.chartOptionsService.getChartOption<number>('title.spacing') ?? 10,
            onValueChange: newValue => this.chartOptionsService.setChartOption('title.spacing', newValue)
        })));
    }

    private toolbarExists() {
        const toolbarItemsFunc = this.gridOptionsService.getCallback('getChartToolbarItems');
        if (!toolbarItemsFunc) { return true; }

        const params: WithoutGridCommon<GetChartToolbarItemsParams> = {
            defaultItems: ['chartUnlink', 'chartDownload']
        };
        const topItems: ChartMenuOptions[] = ['chartLink', 'chartUnlink', 'chartDownload'];
        return topItems.some(v => (toolbarItemsFunc && toolbarItemsFunc(params))?.includes(v));
    }

    private getOption<T = string>(expression: string): T {
        return this.chartOptionsService.getChartOption(expression);
    }

    private setOption(property: string, value: any): void {
        this.chartOptionsService.setChartOption(property, value);
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
