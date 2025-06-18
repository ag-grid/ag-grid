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
import {
    AgPromise,
    BeanStub,
    _addGridCommonParams,
    _defaultComparator,
    _error,
    _makeNull,
    _warn,
} from 'ag-grid-community';

import type { ClientSideValuesExtractor } from './clientSideValueExtractor';
import { createTreeDataOrGroupingComparator } from './setFilterUtils';

type SetValueModelEvent = 'availableValuesChanged' | 'loadingStart' | 'loadingEnd' | 'destroyed';

enum SetFilterModelValuesType {
    PROVIDED_LIST,
    PROVIDED_CALLBACK,
    TAKEN_FROM_GRID_VALUES,
}
export default SetFilterModelValuesType;

export interface SetValueModelParams<TValue> {
    handlerParams: FilterHandlerParams<any, any, SetFilterModel, ISetFilterParams<any, TValue>>;
    usingComplexObjects?: boolean;
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

    constructor(
        private readonly clientSideValuesExtractor: ClientSideValuesExtractor<TValue> | undefined,
        private readonly caseFormat: <T extends string | null>(valueToFormat: T) => T,
        private readonly createKey: (value: TValue | null | undefined, node?: RowNode) => string | null,
        private readonly isTreeDataOrGrouping: () => boolean,
        private params: SetValueModelParams<TValue>
    ) {
        super();
    }

    public postConstruct(): void {
        const params = this.params;
        const values = params.handlerParams.filterParams.values;

        this.updateParams(params);

        if (values == null) {
            this.valuesType = SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES;
        } else {
            this.valuesType = Array.isArray(values)
                ? SetFilterModelValuesType.PROVIDED_LIST
                : SetFilterModelValuesType.PROVIDED_CALLBACK;

            this.providedValues = values;
        }

        this.updateAllValues();
    }

    public refresh(params: SetValueModelParams<TValue>): void {
        const { values, suppressSorting } = params.handlerParams.filterParams;

        const currentProvidedValues = this.providedValues;
        const currentSuppressSorting = this.params.handlerParams.filterParams.suppressSorting;

        this.params = params;
        this.updateParams(params);

        this.providedValues = values ?? null;

        // Rebuild values when values or their sort order changes
        if (this.providedValues !== currentProvidedValues || suppressSorting !== currentSuppressSorting) {
            if (!values || values.length === 0) {
                this.valuesType = SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES;
                this.providedValues = null;
            } else {
                this.valuesType = Array.isArray(values)
                    ? SetFilterModelValuesType.PROVIDED_LIST
                    : SetFilterModelValuesType.PROVIDED_CALLBACK;
            }

            this.updateAllValues();
        }
    }

    private updateParams(params: SetValueModelParams<TValue>): void {
        const {
            handlerParams: {
                colDef,
                filterParams: { comparator, treeList, treeListPathGetter },
            },
            usingComplexObjects,
        } = params;

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
                    this.getValuesFromRowsAsync().then((values) => resolve(this.processAllValues(values)));

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
                            this.dispatchLocalEvent({ type: 'loadingEnd' });

                            resolve(this.processAllValues(this.uniqueValues(this.validateProvidedValues(values))));
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
        if (!this.clientSideValuesExtractor) {
            _error(113);
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

        return this.clientSideValuesExtractor?.extractUniqueValues(predicate, existingValues) ?? null;
    }

    private getValuesFromRowsAsync(): AgPromise<Map<string | null, TValue | null> | null> {
        const existingValues = this.getParamsForValuesFromRows(false);

        return (
            this.clientSideValuesExtractor?.extractUniqueValuesAsync(() => true, existingValues) ??
            AgPromise.resolve(null)
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
        const { caseFormat, createKey } = this;
        (values ?? []).forEach((value) => {
            const valueToUse = _makeNull(value);
            const unformattedKey = createKey(valueToUse);
            const formattedKey = caseFormat(unformattedKey);
            if (!formattedKeys.has(formattedKey)) {
                formattedKeys.add(formattedKey);
                uniqueValues.set(unformattedKey, valueToUse);
            }
        });

        return uniqueValues;
    }

    private validateProvidedValues(values: (TValue | null)[]): (TValue | null)[] {
        if (this.params.usingComplexObjects && values?.length) {
            const firstValue = values[0];
            if (firstValue && typeof firstValue !== 'object' && typeof firstValue !== 'function') {
                const firstKey = this.createKey(firstValue);
                if (firstKey == null) {
                    _warn(209);
                } else {
                    _warn(210);
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
        this.dispatchLocalEvent({ type: 'availableValuesChanged' });
    }
}
