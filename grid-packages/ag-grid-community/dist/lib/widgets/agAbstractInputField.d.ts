import { IAgLabel } from './agAbstractLabel';
import { AgAbstractField, FieldElement } from './agAbstractField';
export interface IInputField extends IAgLabel {
    value?: any;
    width?: number;
}
export declare abstract class AgAbstractInputField<T extends FieldElement, K> extends AgAbstractField<K> {
    protected abstract inputType: string;
    protected config: IInputField;
    protected TEMPLATE: string;
    protected eLabel: HTMLLabelElement;
    protected eWrapper: HTMLElement;
    protected eInput: T;
    protected postConstruct(): void;
    protected addInputListeners(): void;
    private setInputType;
    getInputElement(): T;
    setInputWidth(width: number | 'flex'): this;
    setInputName(name: string): this;
    getFocusableElement(): HTMLElement;
    setMaxLength(length: number): this;
    setInputPlaceholder(placeholder: string): this;
    setDisabled(disabled: boolean): this;
    setInputAriaLabel(label: string): this;
}
