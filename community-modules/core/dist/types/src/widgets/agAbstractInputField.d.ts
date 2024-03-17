import { AgAbstractField, AgFieldParams, FieldElement } from './agAbstractField';
export interface AgInputFieldParams extends AgFieldParams {
    inputName?: string;
    inputWidth?: number | 'flex';
}
export declare abstract class AgAbstractInputField<TElement extends FieldElement, TValue, TConfig extends AgInputFieldParams = AgInputFieldParams> extends AgAbstractField<TValue, TConfig> {
    private readonly inputType;
    private readonly displayFieldTag;
    protected readonly eLabel: HTMLElement;
    protected readonly eWrapper: HTMLElement;
    protected readonly eInput: TElement;
    constructor(config?: TConfig, className?: string, inputType?: string | null, displayFieldTag?: string);
    protected postConstruct(): void;
    protected addInputListeners(): void;
    private setInputType;
    getInputElement(): TElement;
    setInputWidth(width: number | 'flex'): this;
    setInputName(name: string): this;
    getFocusableElement(): HTMLElement;
    setMaxLength(length: number): this;
    setInputPlaceholder(placeholder?: string | null): this;
    setInputAriaLabel(label?: string | null): this;
    setDisabled(disabled: boolean): this;
    setAutoComplete(value: boolean | string): this;
}
