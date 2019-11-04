import { AgGroupComponent, AgSlider, Autowired, Component, PostConstruct, RefSelector } from "@ag-grid-community/grid-core";
import { ChartTranslator } from "../../../chartTranslator";
import { PieChartProxy } from "../../../chartProxies/polar/pieChartProxy";
import { DoughnutChartProxy } from "../../../chartProxies/polar/doughnutChartProxy";

export class CalloutPanel extends Component {

    public static TEMPLATE =
        `<div>
            <ag-group-component ref="calloutGroup">
                <ag-slider ref="calloutLengthSlider"></ag-slider>
                <ag-slider ref="calloutStrokeWidthSlider"></ag-slider>
                <ag-slider ref="labelOffsetSlider"></ag-slider>
            </ag-group-component>
        </div>`;

    @RefSelector('calloutGroup') private calloutGroup: AgGroupComponent;
    @RefSelector('calloutLengthSlider') private calloutLengthSlider: AgSlider;
    @RefSelector('calloutStrokeWidthSlider') private calloutStrokeWidthSlider: AgSlider;
    @RefSelector('labelOffsetSlider') private labelOffsetSlider: AgSlider;

    @Autowired('chartTranslator') private chartTranslator: ChartTranslator;

    private chartProxy: PieChartProxy | DoughnutChartProxy;

    constructor(chartProxy: PieChartProxy | DoughnutChartProxy) {
        super();
        this.chartProxy = chartProxy;
    }

    @PostConstruct
    private init() {
        this.setTemplate(CalloutPanel.TEMPLATE);
        this.initCalloutOptions();
    }

    private initCalloutOptions() {
        this.calloutGroup
            .setTitle(this.chartTranslator.translate("callout"))
            .setEnabled(true)
            .hideOpenCloseIcons(true)
            .hideEnabledCheckbox(true);

        const initInput = (expression: string, input: AgSlider, labelKey: string, maxValue: number) => {
            input.setLabel(this.chartTranslator.translate(labelKey))
                .setValue(this.chartProxy.getSeriesOption(expression))
                .setMaxValue(maxValue)
                .setTextFieldWidth(45)
                .onValueChange(newValue => this.chartProxy.setSeriesOption(expression, newValue));
        };

        initInput("callout.length", this.calloutLengthSlider, "length", 40);
        initInput("callout.strokeWidth", this.calloutStrokeWidthSlider, "strokeWidth", 10);
        initInput("label.offset", this.labelOffsetSlider, "offset", 30);
    }
}
