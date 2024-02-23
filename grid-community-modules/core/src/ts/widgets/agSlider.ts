import { RefSelector } from "./componentAnnotations";
import { AgInputRange } from "./agInputRange";
import { AgAbstractLabel, LabelAlignment, AgLabelParams } from "./agAbstractLabel";
import { AgInputNumberField } from "./agInputNumberField";
import { PostConstruct } from "../context/context";
import { Events } from "../eventKeys";

export interface AgSliderParams extends AgLabelParams {
    minValue?: number;
    maxValue?: number;
    textFieldWidth?: number;
    step?: number;
    value?: string;
    onValueChange?: (newValue: number) => void;
}

export class AgSlider extends AgAbstractLabel<AgSliderParams> {
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

    constructor(config?: AgSliderParams) {
        super(config, AgSlider.TEMPLATE);
    }

    @PostConstruct
    private init() {
        this.eSlider.addCssClass('ag-slider-field');
        const { minValue, maxValue, textFieldWidth, step, value, onValueChange } = this.config;
        if (minValue != null) {
            this.setMinValue(minValue);
        }
        if (maxValue != null) {
            this.setMaxValue(maxValue);
        }
        if (textFieldWidth != null) {
            this.setTextFieldWidth(textFieldWidth);
        }
        if (step != null) {
            this.setStep(step);
        }
        if (value != null) {
            this.setValue(value);
        }
        if (onValueChange != null) {
            this.onValueChange(onValueChange);
        }
    }

    public onValueChange(callbackFn: (newValue: number) => void) {
        const eventChanged = Events.EVENT_FIELD_VALUE_CHANGED;
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

    public setValue(value: string, silent?: boolean): this {
        if (this.getValue() === value) {
            return this;
        }

        this.eText.setValue(value, true);
        this.eSlider.setValue(value, true);

        if (!silent) {
            this.dispatchEvent({ type: Events.EVENT_FIELD_VALUE_CHANGED });
        }

        return this;
    }

    public setStep(step: number): this {
        this.eSlider.setStep(step);
        this.eText.setStep(step);
        return this;
    }
}
