import { AgGroupComponent, AgSlider, Autowired, Component, PostConstruct, RefSelector } from "ag-grid-community";
import { PieSeries } from "../../../../../charts/chart/series/pieSeries";
import { ChartTranslator } from "../../../chartTranslator";

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

    private series: PieSeries[];

    constructor(series: PieSeries[]) {
        super();
        this.series = series;
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

        type CalloutProperty = 'calloutLength' | 'calloutStrokeWidth' | 'labelOffset';

        const initInput = (property: CalloutProperty, input: AgSlider, labelKey: string, initialValue: string, maxValue: number) => {
            input.setLabel(this.chartTranslator.translate(labelKey))
                .setValue(initialValue)
                .setMaxValue(maxValue)
                .setTextFieldWidth(45)
                .onValueChange(newValue => this.series.forEach(s => s[property] = newValue));
        };

        const initialLength = this.series.length > 0 ? this.series[0].calloutLength : 10;
        initInput('calloutLength', this.calloutLengthSlider, 'length', `${initialLength}`, 40);

        const initialStrokeWidth = this.series.length > 0 ? this.series[0].calloutStrokeWidth : 1;
        initInput('calloutStrokeWidth', this.calloutStrokeWidthSlider, 'strokeWidth', `${initialStrokeWidth}`, 10);

        const initialOffset = this.series.length > 0 ? this.series[0].labelOffset : 3;
        initInput('labelOffset', this.labelOffsetSlider, 'offset', `${initialOffset}`, 30);
    }
}
