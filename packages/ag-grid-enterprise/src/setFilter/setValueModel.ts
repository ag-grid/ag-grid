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

const DEFAULT_MAX_PRESERVED_VALUES = 100;

enum SetFilterModelValuesType {
    PROVIDED_LIST,
    PROVIDED_CALLBACK,
    TAKEN_FROM_GRID_VALUES,
}
export default SetFilterModelValuesType;

interface SetValueModelParams<TValue> {
    handlerParams: FilterHandlerParams<any, any, SetFilterModel, ISetFilterParams<any, TValue>>;
    usingComplexObjects?: boolean;
    /** Only a user's key creator claims the values are complex objects; the data type's own says nothing. */
    userKeyCreator?: boolean;
}

export class SetValueModel<TValue> extends BeanStub<SetValueModelEvent> {
    /** Values can be loaded asynchronously, so wait on this promise if you need to ensure values have been loaded. */
    public allKeys: AgPromise<(string | null)[]>;

    /** All possible values for the filter, sorted if required. */
    public allValues: Map<string | null, TValue | null> = new Map();

    /** Remaining keys when filters from other columns have been applied. */
    public availableKeys = new Set<string | null>();

    /** Keys kept by `preservePreviousValues` but absent from the current values, in the order they left. */
    public readonly missingKeys = new Set<string | null>();

    /** Missing keys known only from a model, whose values are unknown. */
    public readonly keyOnlyKeys = new Set<string | null>();

    /** Counts key-only keys whose values have arrived, so a list can rebuild the rows it made for them. */
    public keyOnlyResolved = 0;

    /** The keys the list shows: the available keys, then the missing keys. */
    public displayableKeys = this.availableKeys;

    public valuesType: SetFilterModelValuesType;

    private keyComparator: (a: string | null, b: string | null) => number;
    private entryComparator: (a: [string | null, TValue | null], b: [string | null, TValue | null]) => number;
    private compareByValue: boolean;

    private providedValues: SetFilterValues<any, TValue> | null = null;

    private formattedKeyIndex: Map<string | null, string | null> | undefined;

    private initialised: boolean = false;

    constructor(
        private readonly csrmValuesExtractor: CsrmValuesExtractor<TValue> | undefined,
        private readonly caseFormat: <T extends string | null>(valueToFormat: T) => T,
        private readonly createKey: (value: TValue | null | undefined, node?: RowNode) => string | null,
        private readonly isTreeDataOrGrouping: () => boolean,
        private readonly isKeyChecked: (key: string | null) => boolean,
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

    /** Returns whether the values reload; `replace` has that reload drop the kept keys rather than merge with them. */
    public refresh(params: SetValueModelParams<TValue>, replace: boolean): boolean {
        const handlerParams = params.handlerParams;

        if (handlerParams.source !== 'colDef') {
            // if params haven't changed, we don't need to do anything.
            // also don't want to override provided values set via api.
            return false;
        }

        const { values, suppressSorting } = handlerParams.filterParams;

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

            this.updateAllValues(replace);
            return true;
        }
        return false;
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

    public updateAllValues(replace = false): AgPromise<(string | null)[]> {
        this.allKeys = new AgPromise<(string | null)[]>((resolve) => {
            switch (this.valuesType) {
                case SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES:
                    this.getValuesFromRowsAsync().then((values) => {
                        if (this.isAlive()) {
                            resolve(this.processAllValues(values, replace));
                        }
                    });

                    break;
                case SetFilterModelValuesType.PROVIDED_LIST: {
                    resolve(
                        this.processAllValues(
                            this.uniqueValues(this.validateProvidedValues(this.providedValues as (TValue | null)[])),
                            replace
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

                                resolve(
                                    this.processAllValues(
                                        this.uniqueValues(this.validateProvidedValues(values)),
                                        replace
                                    )
                                );
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

    /** `replace` drops the kept keys, for when they were made by rules no longer in force. */
    public refreshAll(replace = false): AgPromise<void> {
        return new AgPromise((resolve) => {
            this.allKeys.then(() => {
                this.updateAllValues(replace).then(() => {
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

    public getDisplayableKeys(values: SetFilterModelValue): SetFilterModelValue {
        return this.initialised ? values.filter((v) => this.displayableKeys.has(v)) : values;
    }

    public isPreserving(): boolean {
        return !!this.params.handlerParams.filterParams.preservePreviousValues;
    }

    /** Model keys the values do not hold join them as missing, so the list can show and select them. */
    public addKeyOnlyKeys(keys: SetFilterModelValue): void {
        const { allValues, keyOnlyKeys, missingKeys, caseFormat } = this;
        const index = this.getFormattedKeyIndex();
        for (let i = 0, len = keys.length; i < len; ++i) {
            const key = keys[i];
            allValues.set(key, null);
            keyOnlyKeys.add(key);
            missingKeys.add(key);
            index.set(caseFormat(key), key);
        }
        this.allKeys = this.allKeys.then(() => {
            const sortedKeys = this.sortKeys(this.allValues);
            this.updateDisplayableKeys(sortedKeys);
            return sortedKeys;
        });
    }

    /** Cleared at once, so a load still in flight merges into what remains; only the sorted keys wait for it. */
    public clearMissing(onlyUnselected: boolean): AgPromise<(string | null)[]> {
        const { allValues, missingKeys, keyOnlyKeys, isKeyChecked } = this;
        for (const key of missingKeys) {
            if (!onlyUnselected || !isKeyChecked(key)) {
                allValues.delete(key);
                missingKeys.delete(key);
                keyOnlyKeys.delete(key);
            }
        }
        this.formattedKeyIndex = undefined;
        this.allKeys = this.allKeys.then((keys) => {
            const remainingKeys = (keys ?? []).filter((key) => this.allValues.has(key));
            this.updateAvailableKeys(remainingKeys);
            return remainingKeys;
        });
        return this.allKeys;
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

    private processAllValues(values: Map<string | null, TValue | null> | null, replace: boolean): (string | null)[] {
        const freshValues = values ?? new Map();
        let allValues = freshValues;
        if (this.isPreserving() && !replace) {
            allValues = this.mergeValues(freshValues);
        } else {
            if (this.keyOnlyKeys.size) {
                ++this.keyOnlyResolved;
            }
            this.missingKeys.clear();
            this.keyOnlyKeys.clear();
            this.formattedKeyIndex = undefined;
        }
        this.allValues = allValues;
        return this.sortKeys(allValues);
    }

    /** Folds the fresh values into the kept ones in place; a key in another case is the kept key when not case sensitive. */
    private mergeValues(freshValues: Map<string | null, TValue | null>): Map<string | null, TValue | null> {
        const { caseFormat, missingKeys, keyOnlyKeys } = this;
        const allValues = this.allValues;
        const index = this.getFormattedKeyIndex();
        // Kept keys present under another case; every other present key is in `freshValues` itself.
        let remappedKeys: Set<string | null> | undefined;
        const keyOnlyCount = keyOnlyKeys.size;
        freshValues.forEach(function mergeFreshValue(value, freshKey) {
            const formattedKey = caseFormat(freshKey);
            let key = index.get(formattedKey);
            if (key !== undefined && keyOnlyKeys.size && keyOnlyKeys.has(key)) {
                allValues.delete(key);
                keyOnlyKeys.delete(key);
                missingKeys.delete(key);
                key = undefined;
            }
            if (key === undefined) {
                key = freshKey;
                index.set(formattedKey, key);
            }
            // A kept key keeps its position, so first-seen order holds under `suppressSorting`.
            allValues.set(key, value);
            if (key !== freshKey) {
                remappedKeys ??= new Set();
                remappedKeys.add(key);
            }
            if (missingKeys.size) {
                missingKeys.delete(key);
            }
        });
        if (keyOnlyKeys.size !== keyOnlyCount) {
            ++this.keyOnlyResolved;
        }
        allValues.forEach(function markMissing(_value, key) {
            if (!freshValues.has(key) && !remappedKeys?.has(key)) {
                missingKeys.add(key);
            }
        });
        this.evictMissing(allValues, index);
        return allValues;
    }

    public findKey(key: string | null): string | null | undefined {
        return this.getFormattedKeyIndex().get(this.caseFormat(key));
    }

    /** Kept across merges, which update it in place; every other change to the keys drops it. */
    private getFormattedKeyIndex(): Map<string | null, string | null> {
        const cached = this.formattedKeyIndex;
        if (cached) {
            return cached;
        }
        const caseFormat = this.caseFormat;
        const index = new Map<string | null, string | null>();
        this.allValues.forEach((_value, key) => index.set(caseFormat(key), key));
        this.formattedKeyIndex = index;
        return index;
    }

    /** Only unchecked keys are evicted, so which rows pass never changes. */
    private evictMissing(values: Map<string | null, TValue | null>, index: Map<string | null, string | null>): void {
        const max = this.params.handlerParams.filterParams.preservePreviousValuesLimit ?? DEFAULT_MAX_PRESERVED_VALUES;
        const { missingKeys, keyOnlyKeys, isKeyChecked, caseFormat } = this;
        if (max < 0 || missingKeys.size <= max) {
            return;
        }
        const evictable = Array.from(missingKeys).filter((key) => !isKeyChecked(key));
        for (let i = 0, len = evictable.length - max; i < len; ++i) {
            const key = evictable[i];
            missingKeys.delete(key);
            keyOnlyKeys.delete(key);
            values.delete(key);
            index.delete(caseFormat(key));
        }
    }

    private uniqueValues(values: (TValue | null)[] | null): Map<string | null, TValue | null> {
        const uniqueValues: Map<string | null, TValue | null> = new Map();
        const formattedKeys: Set<string | null> = new Set();
        const { caseFormat, createKey } = this;
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
                const firstKey = this.createKey(firstValue);
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
        let values = nullableValues ?? new Map();

        const filterParams = this.params.handlerParams.filterParams;

        if (filterParams.suppressSorting) {
            return Array.from(values.keys());
        }

        const keyOnlyKeys = this.keyOnlyKeys;
        let sortedKeyOnlyKeys: (string | null)[] | undefined;
        if (keyOnlyKeys.size && values === this.allValues) {
            // Their values are unknown, so no comparator is handed one: ordered by key, after the rest.
            sortedKeyOnlyKeys = Array.from(keyOnlyKeys).sort(_defaultComparator);
            values = new Map(values);
            for (const key of keyOnlyKeys) {
                values.delete(key);
            }
        }

        let sortedKeys;
        if (this.compareByValue) {
            sortedKeys = Array.from(values.entries())
                .sort(this.entryComparator)
                .map(([key]) => key);
        } else {
            sortedKeys = Array.from(values.keys()).sort(this.keyComparator);
        }

        if (sortedKeyOnlyKeys) {
            for (let i = 0, len = sortedKeyOnlyKeys.length; i < len; ++i) {
                sortedKeys.push(sortedKeyOnlyKeys[i]);
            }
        }

        if (filterParams.excelMode && nullableValues?.has(null)) {
            // ensure the blank value always appears last
            sortedKeys = sortedKeys.filter((v) => v != null);
            sortedKeys.push(null);
        }

        return sortedKeys;
    }

    private updateDisplayableKeys(allKeys: (string | null)[]): void {
        const { availableKeys, missingKeys } = this;
        if (!missingKeys.size) {
            this.displayableKeys = availableKeys;
            return;
        }
        const displayableKeys = new Set(availableKeys);
        for (let i = 0, len = allKeys.length; i < len; ++i) {
            const key = allKeys[i];
            if (missingKeys.has(key)) {
                displayableKeys.add(key);
            }
        }
        this.displayableKeys = displayableKeys;
    }

    private showAvailableOnly(): boolean {
        return this.valuesType === SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES;
    }

    private updateAvailableKeys(allKeys: (string | null)[]): void {
        const missingKeys = this.missingKeys;
        let availableKeys: (string | null)[];
        if (this.showAvailableOnly()) {
            availableKeys = this.getAvailableValues((node) => this.params.handlerParams.doesRowPassOtherFilter(node));
        } else if (missingKeys.size) {
            availableKeys = allKeys.filter((key) => !missingKeys.has(key));
        } else {
            availableKeys = allKeys;
        }

        this.availableKeys = new Set(availableKeys);
        this.updateDisplayableKeys(allKeys);
        window.setTimeout(() => {
            if (this.isAlive()) {
                // event needs to be handled async
                this.dispatchLocalEvent({ type: 'availableValuesChanged' });
            }
        });
    }
}
