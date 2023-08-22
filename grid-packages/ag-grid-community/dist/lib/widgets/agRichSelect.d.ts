import { AgPickerField, IPickerFieldParams } from "./agPickerField";
import { VirtualList } from "./virtualList";
export interface RichSelectParams<TValue = any> extends IPickerFieldParams {
    value?: TValue;
    valueList?: TValue[];
    cellRenderer?: any;
    cellRowHeight?: number;
    searchDebounceDelay?: number;
    valueFormatter?: (value: TValue) => any;
    searchStringCreator?: (values: TValue[]) => string[];
}
export declare class AgRichSelect<TValue = any> extends AgPickerField<TValue, RichSelectParams<TValue>, VirtualList> {
    private searchString;
    private listComponent;
    private searchDebounceDelay;
    private values;
    private highlightedItem;
    private cellRowHeight;
    private userComponentFactory;
    constructor(config?: RichSelectParams<TValue>);
    protected postConstruct(): void;
    private createListComponent;
    private renderSelectedValue;
    setValueList(valueList: TValue[]): void;
    private getCurrentValueIndex;
    private highlightSelectedValue;
    setRowHeight(height: number): void;
    protected createPickerComponent(): VirtualList;
    showPicker(): void;
    protected beforeHidePicker(): void;
    searchText(searchKey: KeyboardEvent | string): void;
    private runSearch;
    private clearSearchString;
    private selectListItem;
    setValue(value: TValue, silent?: boolean, fromPicker?: boolean): this;
    private createRowComponent;
    private getRowForMouseEvent;
    private onPickerMouseMove;
    private onNavigationKeyDown;
    private onEnterKeyDown;
    private onListValueSelected;
    private dispatchPickerEvent;
    protected onKeyDown(event: KeyboardEvent): void;
}
