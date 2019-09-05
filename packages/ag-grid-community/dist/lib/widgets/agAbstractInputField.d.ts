// Type definitions for ag-grid-community v21.2.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { IAgLabel } from "./agAbstractLabel";
import { AgAbstractField } from "./agAbstractField";
export interface IInputField extends IAgLabel {
    value?: any;
    width?: number;
}
export declare type FieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
export declare abstract class AgAbstractInputField<T extends FieldElement, K> extends AgAbstractField<K> {
    protected abstract className: string;
    protected abstract inputType: string;
    protected config: IInputField;
    protected TEMPLATE: string;
    protected eLabel: HTMLElement;
    protected eWrapper: HTMLElement;
    protected eInput: T;
    protected postConstruct(): void;
    protected addInputListeners(): void;
    private setInputType;
    getInputElement(): FieldElement;
    setInputWidth(width: number | 'flex'): this;
    setInputName(name: string): this;
}
