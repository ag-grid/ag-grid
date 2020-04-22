import {
    _,
    AgGroupComponent,
    Autowired,
    Component,
    FontStyle,
    FontWeight,
    PostConstruct,
    RefSelector,
    AgGroupComponentParams
} from "@ag-grid-community/core";
import { ChartController } from "../../../chartController";
import { Font, FontPanel, FontPanelParams } from "../fontPanel";
import { ChartTranslator } from "../../../chartTranslator";
import { CaptionOptions } from "ag-charts-community";

export default class TitlePanel extends Component {

    public static TEMPLATE =
        `<div>
            <ag-group-component ref="titleGroup">
            </ag-group-component>
        <div>`;

    @RefSelector('titleGroup') private titleGroup: AgGroupComponent;
    @Autowired('chartTranslator') private chartTranslator: ChartTranslator;

    private activePanels: Component[] = [];
    private readonly chartController: ChartController;

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        const groupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical'
        };
        this.setTemplate(TitlePanel.TEMPLATE, { chartGroup: groupParams });

        this.initGroup();
        this.initTitles();
    }

    private initGroup(): void {
        this.titleGroup
            .setTitle(this.chartTranslator.translate('title'))
            .toggleGroupExpand(true)
            .hideOpenCloseIcons(true)
            .hideEnabledCheckbox(false)
            .setEnabled(this.hasTitle())
            .onEnableChange(enabled => {
                const newTitle = enabled? this.chartTranslator.translate('titlePlaceholder') : null;
                this.chartController.getChartProxy().setTitleOption('text', newTitle);
            });
    }

    private hasTitle(): boolean {
        const chartProxy = this.chartController.getChartProxy();
        const title = chartProxy.getChartOption<CaptionOptions>('title');
        const text = title && title.text ? title.text : '';

        return _.exists(text);
    }

    private initTitles(): void {
        const chartProxy = this.chartController.getChartProxy();
        const hasTitle = this.hasTitle;

        const setFont = (font: Font) => {
            const chartProxy = this.chartController.getChartProxy();

            if (font.family) { chartProxy.setTitleOption('fontFamily', font.family); }
            if (font.weight) { chartProxy.setTitleOption('fontWeight', font.weight); }
            if (font.style) { chartProxy.setTitleOption('fontStyle', font.style); }
            if (font.size) { chartProxy.setTitleOption('fontSize', font.size); }
            if (font.color) { chartProxy.setTitleOption('color', font.color); }
        };

        const initialFont = {
            family: hasTitle ? chartProxy.getChartOption('title.fontFamily') : 'Verdana, sans-serif',
            style: hasTitle ? chartProxy.getChartOption<FontStyle>('title.fontStyle') : undefined,
            weight: hasTitle ? chartProxy.getChartOption<FontWeight>('title.fontWeight') : undefined,
            size: hasTitle ? chartProxy.getChartOption<number>('title.fontSize') : 22,
            color: hasTitle ? chartProxy.getChartOption('title.color') : 'black'
        };

        if (!hasTitle) {
            setFont(initialFont);
        }

        const params: FontPanelParams = {
            name: this.chartTranslator.translate('font'),
            enabled: true,
            suppressEnabledCheckbox: true,
            initialFont,
            setFont,
        };

        const fontPanelComp = this.wireBean(new FontPanel(params));
        this.titleGroup.addItem(fontPanelComp);
        this.activePanels.push(fontPanelComp);
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
