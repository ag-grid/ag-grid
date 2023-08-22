import { Component } from "./component";
export interface ListOption<TValue = string> {
    value: TValue;
    text?: string;
}
export declare class AgList extends Component {
    private readonly cssIdentifier;
    static EVENT_ITEM_SELECTED: string;
    private static ACTIVE_CLASS;
    private options;
    private itemEls;
    private highlightedEl;
    private value;
    private displayValue;
    constructor(cssIdentifier?: string);
    private init;
    private handleKeyDown;
    addOptions(listOptions: ListOption[]): this;
    addOption(listOption: ListOption): this;
    private updateIndices;
    private renderOption;
    setValue(value?: string | null, silent?: boolean): this;
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
