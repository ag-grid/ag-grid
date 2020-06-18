// Type definitions for @ag-grid-community/core v23.2.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Component } from "./component";
export interface ListOption {
    value: string;
    text?: string;
}
export declare class AgList extends Component {
    private cssIdentifier;
    private options;
    private itemEls;
    private highlightedEl;
    private value;
    private displayValue;
    static EVENT_ITEM_SELECTED: string;
    constructor(cssIdentifier?: string);
    private init;
    private static getTemplate;
    private handleKeyDown;
    addOptions(listOptions: ListOption[]): this;
    addOption(listOption: ListOption): this;
    private renderOption;
    setValue(value?: string, silent?: boolean): this;
    setValueByIndex(idx: number): this;
    getValue(): string | null;
    getDisplayValue(): string | null;
    refreshHighlighted(): void;
    private reset;
    private highlightItem;
    private clearHighlighted;
    private fireChangeEvent;
    private fireItemSelected;
}
