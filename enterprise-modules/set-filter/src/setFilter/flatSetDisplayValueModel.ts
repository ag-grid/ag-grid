import { Column, TextFormatter, ValueFormatterParams, ValueFormatterService, _ } from '@ag-grid-community/core';
import { ISetDisplayValueModel } from './iSetDisplayValueModel';

export class FlatSetDisplayValueModel<V> implements ISetDisplayValueModel<V, string> {
    /** All keys that are currently displayed, after the mini-filter has been applied. */
    private displayedKeys: (string | null)[] = [];

    constructor(
        private readonly valueFormatterService: ValueFormatterService,
        private readonly valueFormatter: (params: ValueFormatterParams) => string,
        private readonly formatter: TextFormatter,
        private readonly column: Column
    ) {}

    public updateDisplayedValuesToAllAvailable(allValues: Map<string | null, V | null>, availableKeys: Set<string | null>): void {
        this.displayedKeys = _.values(availableKeys);
    }

    public updateDisplayedValuesToMatchMiniFilter(
        allValues: Map<string | null, V | null>,
        availableKeys: Set<string | null>,
        matchesFilter: (valueToCheck: string | null) => boolean,
        nullMatchesFilter: boolean
    ): void {
        this.displayedKeys = [];

        availableKeys.forEach(key => {
            if (key == null) {
                if (nullMatchesFilter) {
                    this.displayedKeys.push(key);
                }
            } else {
                const value = allValues.get(key);
                const valueFormatterValue = this.valueFormatterService.formatValue(
                    this.column, null, value, this.valueFormatter, false);

                const textFormatterValue = this.formatter(valueFormatterValue);

                if (matchesFilter(textFormatterValue)) {
                    this.displayedKeys.push(key);
                }
            }
        });
    }

    public getDisplayedValueCount(): number {
        return this.displayedKeys.length;
    }

    public getDisplayedKey(index: number): string | null {
        return this.displayedKeys[index];
    }

    public getDisplayedKeys(): (string | null)[] {
        return this.displayedKeys;
    }

    public forEachDisplayedKey(func: (key: string | null) => void): void {
        this.displayedKeys.forEach(func);
    }

    public someDisplayedKey(func: (key: string | null) => boolean): boolean {
        return this.displayedKeys.some(func);
    }

    public hasGroups(): boolean {
        return false;
    }

    public refresh(): void {
        // not used
    }
}