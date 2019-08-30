import {AgGroupComponent, AgSlider, Autowired, Component, PostConstruct, RefSelector} from "ag-grid-community";
import {ChartTranslator} from "../../../chartTranslator";
import {CalloutProperty} from "../../../chartProxies/polar/polarChartProxy";
import {PieChartProxy} from "../../../chartProxies/polar/pieChartProxy";
import {DoughnutChartProxy} from "../../../chartProxies/polar/doughnutChartProxy";

export class CalloutPanel extends Component {

    public static TEMPLATE =
        `<div>
            <ag-group-component ref="calloutGroup">
                <ag-slider ref="calloutLengthSlider"></ag-slider>
                <ag-slider ref="calloutStrokeWidthSlider"></ag-slider>
                <ag-slider ref="labelOffsetSlider"></ag-slider>
            </ag-group-component>
        </div>`;

    @RefSelector('seriesGroup') private seriesGroup: AgGroupComponent;
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
            .setTitle(this.chartTranslator.translate('callout'))
            .setEnabled(true)
            .hideOpenCloseIcons(true)
            .hideEnabledCheckbox(true);

        const initInput = (property: CalloutProperty, input: AgSlider, labelKey: string, maxValue: number) => {
            input.setLabel(this.chartTranslator.translate(labelKey))
                .setValue(this.chartProxy.getSeriesProperty(property))
                .setMaxValue(maxValue)
                .setTextFieldWidth(45)
                .onValueChange(newValue => this.chartProxy.setSeriesProperty(property, newValue));
        };

        initInput('calloutLength', this.calloutLengthSlider, 'length', 40);
        initInput('calloutStrokeWidth', this.calloutStrokeWidthSlider, 'strokeWidth', 10);
        initInput('labelOffset', this.labelOffsetSlider, 'offset', 30);
    }
}
