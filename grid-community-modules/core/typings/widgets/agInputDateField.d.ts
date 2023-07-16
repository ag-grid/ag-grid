import { AgInputTextField, ITextInputField } from "./agInputTextField";
export declare class AgInputDateField extends AgInputTextField {
    private min?;
    private max?;
    private step?;
    constructor(config?: ITextInputField);
    postConstruct(): void;
    private onWheel;
    setMin(minDate: Date | string | undefined): this;
    setMax(maxDate: Date | string | undefined): this;
    setStep(step?: number): this;
    getDate(): Date | undefined;
    setDate(date: Date | undefined, silent?: boolean): void;
}
