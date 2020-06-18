// Type definitions for @ag-grid-community/core v23.2.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { AgAbstractField } from "./agAbstractField";
import { Component } from "./component";
export declare abstract class AgPickerField<T, K> extends AgAbstractField<K> {
    protected TEMPLATE: string;
    protected abstract showPicker(): Component;
    protected abstract pickerIcon: string;
    protected value: K;
    protected isDestroyingPicker: boolean;
    private skipClick;
    private pickerComponent;
    private gridOptionsWrapper;
    protected eLabel: HTMLElement;
    protected eWrapper: HTMLElement;
    protected eDisplayField: T;
    private eIcon;
    protected postConstruct(): void;
    setInputWidth(width: number | 'flex'): this;
    getFocusableElement(): HTMLElement;
}
