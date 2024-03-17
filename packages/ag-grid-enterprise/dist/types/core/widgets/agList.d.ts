import { Component } from "./component";
export interface ListOption<TValue = string> {
    value: TValue;
    text?: string;
}
export declare class AgList<TValue = string> extends Component {
    private readonly cssIdentifier;
    private readonly unFocusable;
    static EVENT_ITEM_SELECTED: string;
    private static ACTIVE_CLASS;
    private options;
    private itemEls;
    private highlightedEl;
    private value;
    private displayValue;
    constructor(cssIdentifier?: string, unFocusable?: boolean);
    private init;
    handleKeyDown(e: KeyboardEvent): void;
    addOptions(listOptions: ListOption<TValue>[]): this;
    addOption(listOption: ListOption<TValue>): this;
    clearOptions(): void;
    private updateIndices;
    private renderOption;
    setValue(value?: TValue | null, silent?: boolean): this;
    setValueByIndex(idx: number): this;
    getValue(): TValue | null;
    getDisplayValue(): string | null;
    refreshHighlighted(): void;
    private reset;
    private highlightItem;
    private clearHighlighted;
    private fireChangeEvent;
    private fireItemSelected;
}
