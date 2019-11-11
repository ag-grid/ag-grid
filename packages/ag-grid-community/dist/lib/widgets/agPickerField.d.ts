import { AgAbstractField } from "./agAbstractField";
export declare abstract class AgPickerField<T, K> extends AgAbstractField<K> {
    protected TEMPLATE: string;
    protected abstract showPicker(): void;
    protected abstract pickerIcon: string;
    protected value: K;
    protected displayedPicker: boolean;
    protected isDestroyingPicker: boolean;
    private gridOptionsWrapper;
    protected eLabel: HTMLElement;
    protected eWrapper: HTMLElement;
    protected eDisplayField: T;
    private eButton;
    protected postConstruct(): void;
    setInputWidth(width: number | 'flex'): this;
}
