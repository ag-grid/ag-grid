import { AgAbstractInputField, AgInputFieldParams } from './agAbstractInputField';
export interface AgInputTextFieldParams extends AgInputFieldParams {
    allowedCharPattern?: string;
}
export declare class AgInputTextField<TConfig extends AgInputTextFieldParams = AgInputTextFieldParams> extends AgAbstractInputField<HTMLInputElement, string, TConfig> {
    constructor(config?: TConfig, className?: string, inputType?: string);
    protected postConstruct(): void;
    setValue(value?: string | null, silent?: boolean): this;
    /** Used to set an initial value into the input without necessarily setting `this.value` or triggering events (e.g. to set an invalid value) */
    setStartValue(value?: string | null): void;
    private preventDisallowedCharacters;
}
