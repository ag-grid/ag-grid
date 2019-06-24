import {AgGroupComponent, AgInputTextField, Component, PostConstruct, RefSelector} from "ag-grid-community";
import {PieSeries} from "../../../../../charts/chart/series/pieSeries";

export class CalloutPanel extends Component {

    public static TEMPLATE =
        `<div>               
            <ag-group-component ref="calloutGroup">
                <ag-input-text-field ref="calloutLengthInput"></ag-input-text-field>
                <ag-input-text-field ref="calloutStrokeWidthInput"></ag-input-text-field>
                <ag-input-text-field ref="labelOffsetInput"></ag-input-text-field>
            </ag-group-component>            
        </div>`;

    @RefSelector('seriesGroup') private seriesGroup: AgGroupComponent;

    @RefSelector('calloutGroup') private calloutGroup: AgGroupComponent;
    @RefSelector('calloutLengthInput') private calloutLengthInput: AgInputTextField;
    @RefSelector('calloutStrokeWidthInput') private calloutStrokeWidthInput: AgInputTextField;
    @RefSelector('labelOffsetInput') private labelOffsetInput: AgInputTextField;

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
            .hideEnabledCheckbox(true);

        type CalloutProperty = 'calloutLength' | 'calloutStrokeWidth' | 'labelOffset';

        const initInput = (property: CalloutProperty, input: AgInputTextField, label: string, initialValue: string) => {
            input.setLabel(label)
                .setLabelWidth(80)
                .setWidth(115)
                .setValue(initialValue)
                .onInputChange(newValue => this.series.forEach(s => s[property] = newValue));
        };

        const initialLength = `${this.series[0].calloutLength}`;
        initInput('calloutLength', this.calloutLengthInput, 'Length', initialLength);

        const initialStrokeWidth = `${this.series[0].calloutStrokeWidth}`;
        initInput('calloutStrokeWidth', this.calloutStrokeWidthInput, 'Stroke Width', initialStrokeWidth);

        const initialOffset = `${this.series[0].labelOffset}`;
        initInput('labelOffset', this.labelOffsetInput, 'Offset', initialOffset);
    }

    public destroy(): void {
        super.destroy();
    }
}