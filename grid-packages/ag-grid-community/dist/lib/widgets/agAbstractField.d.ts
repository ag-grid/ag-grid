import { AgAbstractLabel } from "./agAbstractLabel";
export declare type FieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
export declare abstract class AgAbstractField<T> extends AgAbstractLabel {
    static EVENT_CHANGED: string;
    protected abstract displayTag: string;
    protected abstract className: string;
    protected value: T;
    protected disabled: boolean;
    protected postConstruct(): void;
    onValueChange(callbackFn: (newValue: T) => void): this;
    getWidth(): number;
    setWidth(width: number): this;
    getValue(): T;
    setValue(value: T, silent?: boolean): this;
    setDisabled(disabled: boolean): this;
    isDisabled(): boolean;
}
