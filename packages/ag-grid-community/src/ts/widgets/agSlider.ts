import { RefSelector } from "./componentAnnotations";
import { AgInputTextField } from "./agInputTextField";
import { AgInputRange } from "./agInputRange";
import { AgLabel } from "./agLabel";

export class AgSlider extends AgLabel {
    private static TEMPLATE =
        `<div class="ag-slider">
            <label ref="eLabel"></label>
            <div ref="eInputWrapper" class="ag-wrapper">
                <ag-input-range ref="eSlider"></ag-input-range>
                <ag-input-text-field ref="eText"></ag-input-text-field>
            </div>
        </div>`;

    @RefSelector('eLabel') protected eLabel: HTMLElement;
    @RefSelector('eSlider') private eSlider: AgInputRange;
    @RefSelector('eText') private eText: AgInputTextField;

    constructor() {
        super(AgSlider.TEMPLATE);
    }

    public onInputChange(callbackFn: (newValue: number) => void) {
        this.addDestroyableEventListener(this.eText.getInputElement(), 'input', () => {
            const textValue = parseInt(this.eText.getValue(), 10);
            this.eSlider.setValue(textValue.toString());
            callbackFn(textValue);
        });

        this.addDestroyableEventListener(this.eSlider.getInputElement(), 'input', () => {
            const sliderValue = this.eSlider.getValue();
            this.eText.setValue(sliderValue);
            callbackFn(parseFloat(sliderValue));
        });

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

    public getValue(): string {
        return this.eText.getValue();
    }
}