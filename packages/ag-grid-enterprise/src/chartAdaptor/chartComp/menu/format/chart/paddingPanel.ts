import { AgGroupComponent, AgSlider, Autowired, Component, PostConstruct, RefSelector } from "ag-grid-community";
import { ChartController } from "../../../chartController";
import { Chart } from "../../../../../charts/chart/chart";
import { ChartTranslator } from "../../../chartTranslator";

export class PaddingPanel extends Component {

    public static TEMPLATE =
        `<div>
            <ag-group-component ref="chartPaddingGroup">
                <ag-slider ref="paddingTopSlider"></ag-slider>
                <ag-slider ref="paddingRightSlider"></ag-slider>
                <ag-slider ref="paddingBottomSlider"></ag-slider>
                <ag-slider ref="paddingLeftSlider"></ag-slider>
            </ag-group-component>
        <div>`;

    @RefSelector('chartPaddingGroup') private chartPaddingGroup: AgGroupComponent;
    @RefSelector('paddingTopSlider') private paddingTopSlider: AgSlider;
    @RefSelector('paddingRightSlider') private paddingRightSlider: AgSlider;
    @RefSelector('paddingBottomSlider') private paddingBottomSlider: AgSlider;
    @RefSelector('paddingLeftSlider') private paddingLeftSlider: AgSlider;

    @Autowired('chartTranslator') private chartTranslator: ChartTranslator;

    private chart: Chart;
    private readonly chartController: ChartController;

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        this.setTemplate(PaddingPanel.TEMPLATE);

        const chartProxy = this.chartController.getChartProxy();
        this.chart = chartProxy.getChart();

        this.initGroup();
        this.initChartPaddingItems();
    }

    private initGroup(): void {
        this.chartPaddingGroup
            .setTitle(this.chartTranslator.translate('padding'))
            .hideOpenCloseIcons(true)
            .hideEnabledCheckbox(true);
    }

    private initChartPaddingItems(): void {
        type ChartPaddingProperty = 'top' | 'right' | 'bottom' | 'left';

        const initInput = (property: ChartPaddingProperty, input: AgSlider, labelKey: string, value: string) => {
            input.setLabel(this.chartTranslator.translate(labelKey))
                .setValue(value)
                .setMaxValue(200)
                .setTextFieldWidth(45)
                .onValueChange(newValue => {
                    const padding = this.chart.padding;
                    padding[property] = newValue;
                    this.chart.padding = padding;
                });
        };

        initInput('top', this.paddingTopSlider, 'top', `${this.chart.padding.top}`);
        initInput('right', this.paddingRightSlider, 'right', `${this.chart.padding.right}`);
        initInput('bottom', this.paddingBottomSlider, 'bottom', `${this.chart.padding.bottom}`);
        initInput('left', this.paddingLeftSlider, 'left', `${this.chart.padding.left}`);
    }
}
