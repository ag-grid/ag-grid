import { Column, TextFormatter, ValueService, ValueFormatterParams } from 'ag-grid-community';
import { ISetDisplayValueModel } from './iSetDisplayValueModel';
export declare class FlatSetDisplayValueModel<V> implements ISetDisplayValueModel<V> {
    private readonly valueService;
    private readonly valueFormatter;
    private readonly formatter;
    private readonly column;
    /** All keys that are currently displayed, after the mini-filter has been applied. */
    private displayedKeys;
    constructor(valueService: ValueService, valueFormatter: ((params: ValueFormatterParams) => string) | undefined, formatter: TextFormatter, column: Column);
    updateDisplayedValuesToAllAvailable(_getValue: (key: string | null) => V | null, _allKeys: Iterable<string | null> | undefined, availableKeys: Set<string | null>): void;
    updateDisplayedValuesToMatchMiniFilter(getValue: (key: string | null) => V | null, _allKeys: Iterable<string | null> | undefined, availableKeys: Set<string | null>, matchesFilter: (valueToCheck: string | null) => boolean, nullMatchesFilter: boolean): void;
    getDisplayedValueCount(): number;
    getDisplayedItem(index: number): string | null;
    getSelectAllItem(): string;
    getAddSelectionToFilterItem(): string;
    getDisplayedKeys(): (string | null)[];
    forEachDisplayedKey(func: (key: string | null) => void): void;
    someDisplayedKey(func: (key: string | null) => boolean): boolean;
    hasGroups(): boolean;
    refresh(): void;
}
