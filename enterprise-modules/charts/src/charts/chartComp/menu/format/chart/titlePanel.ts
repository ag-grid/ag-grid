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
import { ChartOptionsProxy } from '../../../services/chartOptionsService';
import { ChartMenuUtils } from "../../chartMenuUtils";

export default class TitlePanel extends Component {

    public static TEMPLATE = /* html */ `<div></div>`;

    @Autowired('chartTranslationService') private readonly chartTranslationService: ChartTranslationService;

    private readonly chartOptions: ChartOptionsProxy;

    private activePanels: Component[] = [];
    private titlePlaceholder: string;

    constructor(private readonly chartMenuUtils: ChartMenuUtils) {
        super(TitlePanel.TEMPLATE);
        this.chartOptions = chartMenuUtils.getChartOptions();
    }

    @PostConstruct
    private init() {
        this.initFontPanel();
        this.titlePlaceholder = this.chartTranslationService.translate('titlePlaceholder');
    }

    private hasTitle(): boolean {
        const title: any = this.chartOptions.getValue('title');
        return title && title.enabled && title.text && title.text.length > 0;
    }

    private initFontPanel(): void {
        const hasTitle = this.hasTitle();

        const fontPanelParams: FontPanelParams = {
            name: this.chartTranslationService.translate('title'),
            enabled: hasTitle,
            suppressEnabledCheckbox: false,
            chartMenuUtils: this.chartMenuUtils,
            keyMapper: key => `title.${key}`,
            onEnableChange: (enabled) => {
                if (this.toolbarExists()) {
                    // extra padding is only included when the toolbar is present
                    const topPadding: number = this.chartOptions.getValue('padding.top');
                    this.chartOptions.setValue('padding.top', enabled ? topPadding - 20 : topPadding + 20);
                }

                this.chartOptions.setValue('title.enabled', enabled);
                const currentTitleText = this.chartOptions.getValue('title.text');
                const replaceableTitleText = currentTitleText === 'Title' || currentTitleText?.trim().length === 0;
                if (enabled && replaceableTitleText) {
                    this.chartOptions.setValue('title.text', this.titlePlaceholder);
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
        const params = this.chartMenuUtils.getDefaultSliderParams('title.spacing', 'spacing', 100);
        // Default title spacing is 10, but this isn't reflected in the options - this should really be fixed there.
        params.value = '10';
        return this.createBean(new AgSlider(params));
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
