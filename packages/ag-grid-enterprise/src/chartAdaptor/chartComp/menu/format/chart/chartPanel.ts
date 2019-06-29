import {_, AgGroupComponent, AgInputTextArea, Component, PostConstruct, RefSelector} from "ag-grid-community";
import {ChartController} from "../../../chartController";
import {Chart} from "../../../../../charts/chart/chart";
import {ExpandablePanel} from "../chartFormatingPanel";
import {PaddingPanel} from "./paddingPanel";
import {LabelFont, LabelPanel, LabelPanelParams} from "../label/labelPanel";
import {Caption} from "../../../../../charts/chart/caption";

export class ChartPanel extends Component implements ExpandablePanel {

    public static TEMPLATE =
        `<div>
            <ag-group-component ref="chartGroup">               
                <ag-input-text-area ref="titleInput"></ag-input-text-area>                                      
            </ag-group-component>
        <div>`;

    @RefSelector('chartGroup') private chartGroup: AgGroupComponent;
    @RefSelector('titleInput') private titleInput: AgInputTextArea;

    private chart: Chart;
    private activePanels: Component[] = [];
    private readonly chartController: ChartController;

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        this.setTemplate(ChartPanel.TEMPLATE);

        const chartProxy = this.chartController.getChartProxy();
        this.chart = chartProxy.getChart();

        this.initGroup();
        this.initTitles();
        this.initPaddingPanel();
    }

    public expandPanel(expanded: boolean): void {
        this.chartGroup.toggleGroupExpand(expanded);
    }

    public setExpandedCallback(expandedCallback: () => void) {
        this.addDestroyableEventListener(this.chartGroup, 'expanded', expandedCallback);
    }

    private initGroup(): void {
        this.chartGroup
            .setTitle('Chart')
            .toggleGroupExpand(false)
            .hideEnabledCheckbox(true);
    }

    private initTitles(): void {
        const title = this.chart.title ? this.chart.title.text : '';

        const initialFont = {
            family: this.chart.title ? this.chart.title.fontFamily : 'Verdana, sans-serif',
            style: this.chart.title ? this.chart.title.fontStyle : '',
            weight: this.chart.title ? this.chart.title.fontWeight : 'Normal',
            size: this.chart.title ? this.chart.title.fontSize : 22,
            color: this.chart.title ? this.chart.title.color : 'black'
        };

        const setFont = (font: LabelFont) => {
            const currentFont = this.chart.title as Caption;

            if (font.family) {
                currentFont.fontFamily = font.family;
                this.chart.title = currentFont;
            }

            if (font.weight) {
                currentFont.fontWeight = font.weight;
                this.chart.title = currentFont;
            }

            if (font.size) {
                currentFont.fontSize = font.size;
                this.chart.title = currentFont;
            }

            if (font.color) {
                currentFont.color = font.color;
                this.chart.title = currentFont;
            }
        };

        this.titleInput
            .setLabel('Title')
            .setLabelWidth('flex')
            // .setInputWidth('flex')
            .setValue(title)
            .onValueChange(newValue => {
                if (!this.chart.title) {
                    this.chart.title = Caption.create({text: title});
                    setFont(initialFont);
                }

                const currentCaption = this.chart.title as Caption;
                currentCaption.text = newValue;
                this.chart.title = currentCaption;
                this.chart.performLayout();
            });

        const params: LabelPanelParams = {
            name: 'Font',
            enabled: true,
            suppressEnabledCheckbox: true,
            initialFont: initialFont,
            setFont: setFont
        };

        const labelPanelComp = new LabelPanel(this.chartController, params);
        this.getContext().wireBean(labelPanelComp);
        this.chartGroup.addItem(labelPanelComp);
        this.activePanels.push(labelPanelComp);
    }

    private initPaddingPanel(): void {
        const paddingPanelComp = new PaddingPanel(this.chartController);
        this.getContext().wireBean(paddingPanelComp);
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