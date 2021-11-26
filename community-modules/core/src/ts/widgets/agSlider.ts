import { RefSelector } from "./componentAnnotations";
import { AgInputRange } from "./agInputRange";
import { AgAbstractLabel, LabelAlignment, IAgLabel } from "./agAbstractLabel";
import { AgInputNumberField } from "./agInputNumberField";
import { AgAbstractField } from "./agAbstractField";
import { PostConstruct } from "../context/context";

export class AgSlider extends AgAbstractLabel {
    private static TEMPLATE = /* html */
        `<div class="ag-slider">
            <label ref="eLabel"></label>
            <div class="ag-wrapper ag-slider-wrapper">
                <ag-input-range ref="eSlider"></ag-input-range>
                <ag-input-number-field ref="eText"></ag-input-number-field>
            </div>
        </div>`;

    @RefSelector('eLabel') protected readonly eLabel: HTMLElement;
    @RefSelector('eSlider') private readonly eSlider: AgInputRange;
    @RefSelector('eText') private readonly eText: AgInputNumberField;

    protected labelAlignment: LabelAlignment = 'top';

    constructor(config?: IAgLabel) {
        super(config, AgSlider.TEMPLATE);
    }

    @PostConstruct
    private init() {
        this.eSlider.addCssClass('ag-slider-field');
    }

    public onValueChange(callbackFn: (newValue: number) => void) {
        const eventChanged = AgAbstractField.EVENT_CHANGED;
        this.addManagedListener(this.eText, eventChanged, () => {
            const textValue = parseFloat(this.eText.getValue()!);
            this.eSlider.setValue(textValue.toString(), true);
            callbackFn(textValue || 0);
        });

        this.addManagedListener(this.eSlider, eventChanged, () => {
            const sliderValue = this.eSlider.getValue()!;
            this.eText.setValue(sliderValue, true);
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

    public getValue(): string | null | undefined {
        return this.eText.getValue();
    }

    public setValue(value: string): this {
        if (this.getValue() === value) {
            return this;
        }

        this.eText.setValue(value, true);
        this.eSlider.setValue(value, true);

        this.dispatchEvent({ type: AgAbstractField.EVENT_CHANGED });

        return this;
    }

    public setStep(step: number): this {
        this.eSlider.setStep(step);
        this.eText.setStep(step);
        return this;
    }
}
