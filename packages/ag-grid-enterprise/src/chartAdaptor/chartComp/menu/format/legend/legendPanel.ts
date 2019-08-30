import {
    _,
    AgGroupComponent,
    AgSelect,
    AgSlider,
    Autowired,
    Component,
    PostConstruct,
    RefSelector
} from "ag-grid-community";
import {ChartController} from "../../../chartController";
import {LegendPosition} from "../../../../../charts/chart/chart";
import {LabelFont, LabelPanel, LabelPanelParams} from "../label/labelPanel";
import {ChartTranslator} from "../../../chartTranslator";
import {ChartProxy, LegendProperty} from "../../../chartProxies/chartProxy";

export class LegendPanel extends Component {

    public static TEMPLATE =
        `<div>  
            <ag-group-component ref="legendGroup">
                <ag-select ref="legendPositionSelect"></ag-select>
                <ag-slider ref="legendPaddingSlider"></ag-slider>
                <ag-slider ref="markerSizeSlider"></ag-slider>
                <ag-slider ref="markerStrokeSlider"></ag-slider>
                <ag-slider ref="markerPaddingSlider"></ag-slider>
                <ag-slider ref="itemPaddingXSlider"></ag-slider>
                <ag-slider ref="itemPaddingYSlider"></ag-slider>
            </ag-group-component>
        </div>`;

    @RefSelector('legendGroup') private legendGroup: AgGroupComponent;
    @RefSelector('legendPositionSelect') private legendPositionSelect: AgSelect;
    @RefSelector('legendPaddingSlider') private legendPaddingSlider: AgSlider;
    @RefSelector('markerSizeSlider') private markerSizeSlider: AgSlider;
    @RefSelector('markerStrokeSlider') private markerStrokeSlider: AgSlider;
    @RefSelector('markerPaddingSlider') private markerPaddingSlider: AgSlider;
    @RefSelector('itemPaddingXSlider') private itemPaddingXSlider: AgSlider;
    @RefSelector('itemPaddingYSlider') private itemPaddingYSlider: AgSlider;

    @Autowired('chartTranslator') private chartTranslator: ChartTranslator;

    private activePanels: Component[] = [];

    private chartProxy: ChartProxy<any>;
    private readonly chartController: ChartController;

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
        this.chartProxy = this.chartController.getChartProxy();
    }

    @PostConstruct
    private init() {
        this.setTemplate(LegendPanel.TEMPLATE);

        this.initLegendGroup();
        this.initLegendPosition();
        this.initLegendPadding();
        this.initLegendItems();
        this.initLabelPanel();
    }

    private initLegendGroup() {
        this.legendGroup
            .setTitle(this.chartTranslator.translate('legend'))
            .hideEnabledCheckbox(false)
            .setEnabled(this.chartProxy.getLegendEnabled())
            .toggleGroupExpand(false)
            .onEnableChange(enabled => {
                this.chartProxy.setLegendProperty('enabled', enabled);
                this.legendGroup.toggleGroupExpand(true);
            });
    }

    private initLegendPosition() {
        const chartProxy = this.chartController.getChartProxy();

        const positions: LegendPosition[] = ['top', 'right', 'bottom', 'left'];

        this.legendPositionSelect
            .setLabel(this.chartTranslator.translate('position'))
            .setLabelWidth('flex')
            .setInputWidth(80)
            .addOptions(positions.map(position => ({
                value: position,
                text: this.chartTranslator.translate(position)
            })))
            .setValue(chartProxy.getLegendPosition())
            .onValueChange(newValue => chartProxy.setLegendPosition(newValue as LegendPosition));
    }

    private initLegendPadding() {
        this.legendPaddingSlider
            .setLabel(this.chartTranslator.translate('padding'))
            .setValue(this.chartProxy.getLegendPadding())
            .setTextFieldWidth(45)
            .setMaxValue(200)
            .onValueChange(newValue => this.chartProxy.setLegendPadding(newValue));
    }

    private initLegendItems() {
        const initSlider = (property: LegendProperty, labelKey: string, input: AgSlider, maxValue: number) => {
            input.setLabel(this.chartTranslator.translate(labelKey))
                 .setValue(this.chartProxy.getLegendProperty(property))
                 .setMaxValue(maxValue)
                 .setTextFieldWidth(45)
                 .onValueChange(newValue => this.chartProxy.setLegendProperty(property, newValue));
        };

        initSlider('markerSize', 'markerSize', this.markerSizeSlider, 40);
        initSlider('markerStrokeWidth', 'markerStroke', this.markerStrokeSlider, 10);
        initSlider('markerPadding',  'markerPadding', this.markerPaddingSlider, 200);
        initSlider('itemPaddingX', 'itemPaddingX', this.itemPaddingXSlider, 50);
        initSlider('itemPaddingY', 'itemPaddingY', this.itemPaddingYSlider, 50);
    }

    private initLabelPanel() {
        const initialFont = {
            family: this.chartProxy.getLegendProperty('labelFontFamily'),
            style: this.chartProxy.getLegendProperty('labelFontStyle'),
            weight: this.chartProxy.getLegendProperty('labelFontWeight'),
            size: parseInt(this.chartProxy.getLegendProperty('labelFontSize')),
            color: this.chartProxy.getLegendProperty('labelColor')
        };

        // note we don't set the font style via legend panel
        const setFont = (font: LabelFont) => {
            if (font.family) { this.chartProxy.setLegendProperty('labelFontFamily', font.family); }
            if (font.weight) { this.chartProxy.setLegendProperty('labelFontWeight', font.weight); }
            if (font.size) { this.chartProxy.setLegendProperty('labelFontSize', font.size); }
            if (font.color) { this.chartProxy.setLegendProperty('labelColor', font.color); }
        };

        const params: LabelPanelParams = {
            enabled: true,
            suppressEnabledCheckbox: true,
            initialFont: initialFont,
            setFont: setFont
        };

        const labelPanelComp = new LabelPanel(params);
        this.getContext().wireBean(labelPanelComp);
        this.legendGroup.addItem(labelPanelComp);
        this.activePanels.push(labelPanelComp);
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
