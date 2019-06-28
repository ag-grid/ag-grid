import { AgGroupComponent, AgSlider, Component, PostConstruct, RefSelector } from "ag-grid-community";
import { PieSeries } from "../../../../../charts/chart/series/pieSeries";

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
            .setTitle('Callout')
            .setEnabled(true)
            .hideOpenCloseIcons(true)
            .hideEnabledCheckbox(true);

        type CalloutProperty = 'calloutLength' | 'calloutStrokeWidth' | 'labelOffset';

        const initInput = (property: CalloutProperty, input: AgSlider, label: string, initialValue: string, maxValue: number) => {
            input.setLabel(label)
                .setValue(initialValue)
                .setMaxValue(maxValue)
                .setTextFieldWidth(45)
                .onValueChange(newValue => this.series.forEach(s => s[property] = newValue));
        };

        const initialLength = `${this.series[0].calloutLength}`;
        initInput('calloutLength', this.calloutLengthSlider, 'Length', initialLength, 30);

        const initialStrokeWidth = `${this.series[0].calloutStrokeWidth}`;
        initInput('calloutStrokeWidth', this.calloutStrokeWidthSlider, 'Stroke Width', initialStrokeWidth, 20);

        const initialOffset = `${this.series[0].labelOffset}`;
        initInput('labelOffset', this.labelOffsetSlider, 'Offset', initialOffset, 30);
    }

    public destroy(): void {
        super.destroy();
    }
}