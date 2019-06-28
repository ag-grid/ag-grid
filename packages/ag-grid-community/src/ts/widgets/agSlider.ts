import { RefSelector } from "./componentAnnotations";
import { AgInputRange } from "./agInputRange";
import { AgLabel, LabelAlignment } from "./agLabel";
import { AgInputNumberField } from "./agInputNumberField";
import { _ } from "../utils";

export class AgSlider extends AgLabel {
    private static TEMPLATE =
        `<div class="ag-slider">
            <label ref="eLabel"></label>
            <div class="ag-wrapper">
                <ag-input-range ref="eSlider"></ag-input-range>
                <ag-input-number-field ref="eText"></ag-input-number-field>
            </div>
        </div>`;

    @RefSelector('eLabel') protected eLabel: HTMLElement;
    @RefSelector('eSlider') private eSlider: AgInputRange;
    @RefSelector('eText') private eText: AgInputNumberField;

    protected labelAlignment: LabelAlignment = 'top';

    constructor() {
        super(AgSlider.TEMPLATE);
    }

    postConstruct() {
        super.postConstruct();
        this.setMinValue(0);
    }

    public onInputChange(callbackFn: (newValue: number) => void) {
        this.addDestroyableEventListener(this.eText.getInputElement(), 'input', () => {
            const textValue = parseInt(this.eText.getValue(), 10);
            this.eSlider.setValue(textValue.toString());
            callbackFn(textValue);
        });

        const sliderEvent = _.isBrowserIE() ? 'change' : 'input';
        this.addDestroyableEventListener(this.eSlider.getInputElement(), sliderEvent , () => {
            const sliderValue = this.eSlider.getValue();
            this.eText.setValue(sliderValue);
            callbackFn(parseFloat(sliderValue));
        });

        return this;
    }

    public setSliderWidth(width: number): this {
        this.eSlider.setWidth(width);
        return this;
    }

    public setTextFieldWidth(width: number): this {
        this.eText.setWidth(width);
        return this;
    }

    public setValue(value: string): this {
        if (this.eText.getValue() === value) {
            return this;
        }

        this.eText.setValue(value);
        this.eSlider.setValue(value);

        return this;
    }

    public setMinValue(minValue: number): this {
        this.eSlider.setMinValue(minValue);
        this.eText.setMin(minValue);

        return this;
    }

    public setMaxValue(maxValue: number): this {
        this.eSlider.setMaxValue(maxValue);
        this.eText.setMax(maxValue);
        return this;
    }

    public getValue(): string {
        return this.eText.getValue();
    }
}