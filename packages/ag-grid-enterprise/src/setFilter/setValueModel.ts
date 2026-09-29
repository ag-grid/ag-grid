import { _defaultComparator } from 'ag-stack';

import type {
    FilterHandlerParams,
    ISetFilterParams,
    RowNode,
    SetFilterModel,
    SetFilterModelValue,
    SetFilterValues,
    SetFilterValuesFunc,
    SetFilterValuesFuncParams,
} from 'ag-grid-community';
import { AgPromise, BeanStub, _addGridCommonParams } from 'ag-grid-community';

import type { CsrmValuesExtractor } from './csrmValueExtractor';
import { createTreeDataOrGroupingComparator, setFilterNullIfBlank } from './setFilterUtils';

type SetValueModelEvent = 'availableValuesChanged' | 'loadingStart' | 'loadingEnd' | 'destroyed';

enum SetFilterModelValuesType {
    PROVIDED_LIST,
    PROVIDED_CALLBACK,
    TAKEN_FROM_GRID_VALUES,
}
export default SetFilterModelValuesType;

export interface SetValueModelParams<TValue> {
    handlerParams: FilterHandlerParams<any, any, SetFilterModel, ISetFilterParams<any, TValue>>;
    createKey: (value: TValue | null | undefined, node?: RowNode | null) => string | null;
    usingComplexObjects: boolean;
    /** Only a user's key creator claims the values are complex objects; the data type's own says nothing. */
    userKeyCreator: boolean;
}

export class SetValueModel<TValue> extends BeanStub<SetValueModelEvent> {
    /** Values can be loaded asynchronously, so wait on this promise if you need to ensure values have been loaded. */
    public allKeys: AgPromise<(string | null)[]>;

    /** All possible values for the filter, sorted if required. */
    public allValues: Map<string | null, TValue | null> = new Map();

    /** Remaining keys when filters from other columns have been applied. */
    public availableKeys = new Set<string | null>();

    public valuesType: SetFilterModelValuesType;

    private keyComparator: (a: string | null, b: string | null) => number;
    private entryComparator: (a: [string | null, TValue | null], b: [string | null, TValue | null]) => number;
    private compareByValue: boolean;

    private providedValues: SetFilterValues<any, TValue> | null = null;

    private initialised: boolean = false;

    /** The load for the latest column definition, so however many ask for it, it loads once. */
    private colDefLoad: AgPromise<unknown> | undefined;

    constructor(
        private readonly csrmValuesExtractor: CsrmValuesExtractor<TValue> | undefined,
        private readonly caseFormat: <T extends string | null>(valueToFormat: T) => T,
        private readonly isTreeDataOrGrouping: () => boolean,
        private params: SetValueModelParams<TValue>
    ) {
        super();
    }

    public postConstruct(): void {
        const params = this.params;
        const values = params.handlerParams.filterParams.values;

        this.updateParams(params);
        this.setProvidedValues(values);
        this.updateAllValues();
    }

    /** Returns whether the values are being loaded again. */
    public refresh(params: SetValueModelParams<TValue>): boolean {
        const handlerParams = params.handlerParams;

        if (handlerParams.source !== 'colDef') {
            // if params haven't changed, we don't need to do anything.
            // also don't want to override provided values set via api.
            return false;
        }
        this.colDefLoad = undefined;

        const { values, suppressSorting } = handlerParams.filterParams;

        const currentProvidedValues = this.providedValues;
        const currentSuppressSorting = this.params.handlerParams.filterParams.suppressSorting;

        this.params = params;
        this.updateParams(params);

        // Rebuild values when values or their sort order changes
        if ((values ?? null) !== currentProvidedValues || suppressSorting !== currentSuppressSorting) {
            this.setProvidedValues(values);
            this.colDefLoad = this.updateAllValues();
            return true;
        }
        return false;
    }

    private setProvidedValues(values: SetFilterValues<any, TValue> | undefined): void {
        this.providedValues = values ?? null;
        if (!isProvidedValues(values)) {
            this.valuesType = SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES;
        } else if (Array.isArray(values)) {
            this.valuesType = SetFilterModelValuesType.PROVIDED_LIST;
        } else {
            this.valuesType = SetFilterModelValuesType.PROVIDED_CALLBACK;
        }
    }

    public refreshForColDef(): AgPromise<unknown> {
        this.colDefLoad ??= this.refreshAll();
        return this.colDefLoad;
    }

    private updateParams(params: SetValueModelParams<TValue>): void {
        const {
            handlerParams: {
                colDef,
                getValue,
                filterParams: { comparator, treeList, treeListPathGetter },
            },
            createKey,
            usingComplexObjects,
        } = params;

        const csrmValuesExtractor = this.csrmValuesExtractor;
        if (csrmValuesExtractor) {
            csrmValuesExtractor.createKey = createKey;
            csrmValuesExtractor.getValue = getValue;
        }

        const keyComparator = comparator ?? (colDef.comparator as (a: any, b: any) => number);
        const treeDataOrGrouping = this.isTreeDataOrGrouping();
        let entryComparator: (a: [string | null, TValue | null], b: [string | null, TValue | null]) => number;
        if (treeDataOrGrouping && !keyComparator) {
            entryComparator = createTreeDataOrGroupingComparator() as any;
        } else if (treeList && !treeListPathGetter && !keyComparator) {
            entryComparator = (
                [_aKey, aValue]: [string | null, TValue | null],
                [_bKey, bValue]: [string | null, TValue | null]
            ) => _defaultComparator(aValue, bValue);
        } else {
            entryComparator = (
                [_aKey, aValue]: [string | null, TValue | null],
                [_bKey, bValue]: [string | null, TValue | null]
            ) => keyComparator(aValue, bValue);
        }
        this.entryComparator = entryComparator;
        this.keyComparator = (keyComparator as any) ?? _defaultComparator;
        // If using complex objects and a comparator is provided, sort by values, otherwise need to sort by the string keys.
        // Also if tree data, grouping, or date with tree list, then need to do value sort
        this.compareByValue = !!(
            (usingComplexObjects && keyComparator) ||
            treeDataOrGrouping ||
            (treeList && !treeListPathGetter)
        );
    }

    public updateAllValues(): AgPromise<(string | null)[]> {
        this.allKeys = new AgPromise<(string | null)[]>((resolve) => {
            switch (this.valuesType) {
                case SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES:
                    this.getValuesFromRowsAsync().then((values) => {
                        if (this.isAlive()) {
                            resolve(this.processAllValues(values));
                        }
                    });

                    break;
                case SetFilterModelValuesType.PROVIDED_LIST: {
                    resolve(
                        this.processAllValues(
                            this.uniqueValues(this.validateProvidedValues(this.providedValues as (TValue | null)[]))
                        )
                    );

                    break;
                }

                case SetFilterModelValuesType.PROVIDED_CALLBACK: {
                    this.dispatchLocalEvent({ type: 'loadingStart' });

                    const callback = this.providedValues as SetFilterValuesFunc<any, TValue>;
                    const { column, colDef } = this.params.handlerParams;
                    const params: SetFilterValuesFuncParams<any, TValue> = _addGridCommonParams(this.gos, {
                        success: (values) => {
                            if (this.isAlive()) {
                                this.dispatchLocalEvent({ type: 'loadingEnd' });

                                resolve(this.processAllValues(this.uniqueValues(this.validateProvidedValues(values))));
                            }
                        },
                        colDef,
                        column,
                    });

                    window.setTimeout(() => callback(params), 0);

                    break;
                }
            }
        });

        this.allKeys.then((values) => {
            this.updateAvailableKeys(values ?? []);
            this.initialised = true;
        });

        return this.allKeys;
    }

    public getAvailableValues(predicate: (node: RowNode) => boolean): (string | null)[] {
        return this.sortKeys(this.getValuesFromRows(predicate));
    }

    public overrideValues(valuesToUse: (TValue | null)[]): AgPromise<void> {
        return this.allKeys.then(() => {
            this.valuesType = SetFilterModelValuesType.PROVIDED_LIST;
            this.providedValues = valuesToUse;
        });
    }

    public refreshAvailable(): AgPromise<boolean> {
        return new AgPromise((resolve) => {
            if (this.showAvailableOnly()) {
                this.allKeys.then((keys) => {
                    const updatedKeys = keys ?? [];
                    this.updateAvailableKeys(updatedKeys);
                    resolve(true);
                });
                return;
            }
            resolve(false);
        });
    }

    public refreshAll(): AgPromise<void> {
        return new AgPromise((resolve) => {
            this.allKeys.then(() => {
                this.updateAllValues().then(() => {
                    resolve();
                });
            });
        });
    }

    public isLoading(): boolean {
        return !this.initialised && this.valuesType === SetFilterModelValuesType.PROVIDED_CALLBACK;
    }

    public isInitialised(): boolean {
        return this.initialised;
    }

    public getValueForFormatter(key: string | null): TValue | string | null {
        return this.initialised ? this.allValues.get(key)! : key;
    }

    public getAvailableKeys(values: SetFilterModelValue): SetFilterModelValue {
        return this.initialised ? values.filter((v) => this.availableKeys.has(v)) : values;
    }

    private getParamsForValuesFromRows(
        removeUnavailableValues: boolean
    ): Map<string | null, TValue | null> | undefined {
        if (!this.csrmValuesExtractor) {
            this.error(113);
            return undefined;
        }

        const existingValues =
            removeUnavailableValues && !this.params.handlerParams.filterParams.caseSensitive
                ? this.allValues
                : undefined;

        return existingValues;
    }

    private getValuesFromRows(predicate: (node: RowNode) => boolean): Map<string | null, TValue | null> | null {
        const existingValues = this.getParamsForValuesFromRows(true);

        return this.csrmValuesExtractor?.extractUniqueValues(predicate, existingValues) ?? null;
    }

    private getValuesFromRowsAsync(): AgPromise<Map<string | null, TValue | null> | null> {
        const existingValues = this.getParamsForValuesFromRows(false);

        return (
            this.csrmValuesExtractor?.extractUniqueValuesAsync(() => true, existingValues) ?? AgPromise.resolve(null)
        );
    }

    private processAllValues(values: Map<string | null, TValue | null> | null): (string | null)[] {
        const sortedKeys = this.sortKeys(values);

        this.allValues = values ?? new Map();

        return sortedKeys;
    }

    private uniqueValues(values: (TValue | null)[] | null): Map<string | null, TValue | null> {
        const uniqueValues: Map<string | null, TValue | null> = new Map();
        const formattedKeys: Set<string | null> = new Set();
        const caseFormat = this.caseFormat;
        const createKey = this.params.createKey;
        for (const value of values ?? []) {
            const valueToUse = setFilterNullIfBlank(value);
            const unformattedKey = createKey(valueToUse);
            const formattedKey = caseFormat(unformattedKey);
            if (!formattedKeys.has(formattedKey)) {
                formattedKeys.add(formattedKey);
                uniqueValues.set(unformattedKey, valueToUse);
            }
        }

        return uniqueValues;
    }

    private validateProvidedValues(values: (TValue | null)[]): (TValue | null)[] {
        if (this.params.userKeyCreator && values?.length) {
            const firstValue = values[0];
            if (firstValue && typeof firstValue !== 'object' && typeof firstValue !== 'function') {
                const firstKey = this.params.createKey(firstValue);
                if (firstKey == null) {
                    this.warn(209);
                } else {
                    this.warn(210);
                }
            }
        }
        return values;
    }

    private sortKeys(nullableValues: Map<string | null, TValue | null> | null): (string | null)[] {
        const values = nullableValues ?? new Map();

        const filterParams = this.params.handlerParams.filterParams;

        if (filterParams.suppressSorting) {
            return Array.from(values.keys());
        }

        let sortedKeys;
        if (this.compareByValue) {
            sortedKeys = Array.from(values.entries())
                .sort(this.entryComparator)
                .map(([key]) => key);
        } else {
            sortedKeys = Array.from(values.keys()).sort(this.keyComparator);
        }

        if (filterParams.excelMode && values.has(null)) {
            // ensure the blank value always appears last
            sortedKeys = sortedKeys.filter((v) => v != null);
            sortedKeys.push(null);
        }

        return sortedKeys;
    }

    private showAvailableOnly(): boolean {
        return this.valuesType === SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES;
    }

    private updateAvailableKeys(allKeys: (string | null)[]): void {
        const availableKeys = this.showAvailableOnly()
            ? this.getAvailableValues((node) => this.params.handlerParams.doesRowPassOtherFilter(node))
            : allKeys;

        this.availableKeys = new Set(availableKeys);
        window.setTimeout(() => {
            if (this.isAlive()) {
                // event needs to be handled async
                this.dispatchLocalEvent({ type: 'availableValuesChanged' });
            }
        });
    }
}

/** Whether the Set Filter lists these values rather than the ones in the rows; an empty list is still a list. */
export const isProvidedValues = <V>(values: SetFilterValues<any, V> | undefined): values is SetFilterValues<any, V> =>
    values != null;
