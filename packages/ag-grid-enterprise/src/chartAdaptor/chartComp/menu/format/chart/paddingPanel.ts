import {AgGroupComponent, AgSlider, Autowired, Component, PostConstruct, RefSelector} from "ag-grid-community";
import {ChartController} from "../../../chartController";
import {ChartTranslator} from "../../../chartTranslator";
import {ChartPaddingProperty} from "../../../chartProxies/chartProxy";

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

    private readonly chartController: ChartController;

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        this.setTemplate(PaddingPanel.TEMPLATE);

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
        const initInput = (property: ChartPaddingProperty, input: AgSlider, labelKey: string) => {

            const proxy = this.chartController.getChartProxy();

            input.setLabel(this.chartTranslator.translate(labelKey))
                .setValue(proxy.getChartPadding(property))
                .setMaxValue(200)
                .setTextFieldWidth(45)
                .onValueChange(newValue => proxy.setChartPaddingProperty(property, newValue))
        };

        initInput('top', this.paddingTopSlider, 'top');
        initInput('right', this.paddingRightSlider, 'right');
        initInput('bottom', this.paddingBottomSlider, 'bottom');
        initInput('left', this.paddingLeftSlider, 'left');
    }
}