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

    /** Keys kept by `preservePreviousValues` but absent from the current values, in the order they left. */
    public readonly missingKeys = new Set<string | null>();

    /** Missing keys known only from a model, whose values are unknown. */
    public readonly keyOnlyKeys = new Set<string | null>();

    private loading = false;

    /** Once any value has loaded, no values means an empty source rather than one not loaded yet. */
    public valuesSeen = false;

    /** Bumped whenever `keyOnlyKeys` changes, so a list rebuilds the rows it drew for a key alone. */
    public keyOnlyVersion = 0;

    /** The keys the list shows: the available keys, then the missing keys. */
    public displayableKeys = this.availableKeys;

    public valuesType: SetFilterModelValuesType;

    private keyComparator: (a: string | null, b: string | null) => number;
    private entryComparator: (a: [string | null, TValue | null], b: [string | null, TValue | null]) => number;
    private compareByValue: boolean;

    private providedValues: SetFilterValues<any, TValue> | null = null;

    private formattedKeyIndex: Map<string | null, string | null> | undefined;

    private initialised: boolean = false;

    /** Counts the loads started, so an answer overtaken by a newer load is not taken. */
    private loadCount = 0;

    /** A replacing load overtaken before it answers hands its replacing on to the load that overtook it. */
    private replacePending = false;

    /** The load for the latest column definition, so however many ask for it, it loads once. */
    private colDefLoad: AgPromise<unknown> | undefined;

    constructor(
        private readonly csrmValuesExtractor: CsrmValuesExtractor<TValue> | undefined,
        private readonly caseFormat: <T extends string | null>(valueToFormat: T) => T,
        private readonly isTreeDataOrGrouping: () => boolean,
        private readonly isKeyChecked: (key: string | null) => boolean,
        private params: SetValueModelParams<TValue>
    ) {
        super();
    }

    public postConstruct(): void {
        const params = this.params;
        this.updateParams(params);
        this.setProvidedValues(params.handlerParams.filterParams.values);
        this.updateAllValues();
    }

    /**
     * Returns whether the values reload; `replace` reloads them without the kept keys, made by rules no longer in force.
     * A first load still pending needs no reload, as it reads by the new rules.
     */
    public refresh(params: SetValueModelParams<TValue>, replace: boolean): boolean {
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

        this.updateParams(params);

        // Rebuild values when values or their sort order changes
        if ((values ?? null) !== currentProvidedValues || suppressSorting !== currentSuppressSorting) {
            this.setProvidedValues(values);
            this.colDefLoad = this.updateAllValues(replace);
            return true;
        }
        if (replace && this.initialised) {
            this.colDefLoad = this.refreshAll(true);
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

    public refreshValues(forColDef: boolean): AgPromise<unknown> {
        if (!forColDef) {
            return this.refreshAll();
        }
        this.colDefLoad ??= this.refreshAll();
        return this.colDefLoad;
    }

    /** Takes the key function and sort rules without reloading, which `refresh` does only for a column definition. */
    public updateParams(params: SetValueModelParams<TValue>): void {
        this.params = params;
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

    public updateAllValues(replace = false): AgPromise<(string | null)[]> {
        const load = ++this.loadCount;
        const valuesType = this.valuesType;
        if (this.loading && valuesType !== SetFilterModelValuesType.PROVIDED_CALLBACK) {
            // The callback this load overtakes may never answer, so its loading ends here.
            this.setLoading(false);
        }
        const replaceKept = replace || this.replacePending;
        this.replacePending = replaceKept;
        this.allKeys = new AgPromise<(string | null)[]>((resolve) => {
            const resolveLoaded = (values: Map<string | null, TValue | null> | null) => {
                if (load === this.loadCount) {
                    this.replacePending = false;
                    resolve(this.processAllValues(values, replaceKept));
                } else {
                    this.allKeys.then(resolve);
                }
            };
            switch (valuesType) {
                case SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES:
                    this.getValuesFromRowsAsync().then((values) => {
                        if (this.isAlive()) {
                            resolveLoaded(values);
                        }
                    });

                    break;
                case SetFilterModelValuesType.PROVIDED_LIST: {
                    resolveLoaded(
                        this.uniqueValues(this.validateProvidedValues(this.providedValues as (TValue | null)[]))
                    );

                    break;
                }

                case SetFilterModelValuesType.PROVIDED_CALLBACK: {
                    this.setLoading(true);

                    const callback = this.providedValues as SetFilterValuesFunc<any, TValue>;
                    const { column, colDef } = this.params.handlerParams;
                    const params: SetFilterValuesFuncParams<any, TValue> = _addGridCommonParams(this.gos, {
                        success: (values) => {
                            if (this.isAlive()) {
                                if (load === this.loadCount) {
                                    this.setLoading(false);
                                }
                                resolveLoaded(this.uniqueValues(this.validateProvidedValues(values)));
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
        if (keys.length) {
            ++this.keyOnlyVersion;
        }
        this.resortKeys();
    }

    /** Cleared at once, so a load still in flight merges into what remains; only the sorted keys wait for it. */
    public clearMissing(isKept: (key: string | null) => boolean): AgPromise<(string | null)[]> {
        for (const key of this.missingKeys) {
            if (!isKept(key)) {
                this.dropKey(key);
            }
        }
        return this.resortKeys();
    }

    /** Sorts once any load in flight has merged, as the kept keys changed ahead of it. */
    private resortKeys(): AgPromise<(string | null)[]> {
        this.allKeys = this.allKeys.then(() => {
            const sortedKeys = this.sortKeys(this.allValues);
            this.updateDisplayableKeys(sortedKeys);
            return sortedKeys;
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

    private setLoading(loading: boolean): void {
        if (this.loading !== loading) {
            this.loading = loading;
            this.dispatchLocalEvent({ type: loading ? 'loadingStart' : 'loadingEnd' });
        }
    }

    private processAllValues(values: Map<string | null, TValue | null> | null, replace: boolean): (string | null)[] {
        const freshValues = values ?? new Map();
        if (freshValues.size) {
            this.valuesSeen = true;
        }
        if (this.isPreserving() && !replace) {
            this.mergeValues(freshValues);
        } else {
            if (this.keyOnlyKeys.size) {
                ++this.keyOnlyVersion;
            }
            this.missingKeys.clear();
            this.keyOnlyKeys.clear();
            this.formattedKeyIndex = undefined;
            this.allValues = freshValues;
        }
        return this.sortKeys(this.allValues);
    }

    /** Folds the fresh values into the kept ones in place; a key in another case is the kept key when not case sensitive. */
    private mergeValues(freshValues: Map<string | null, TValue | null>): void {
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
            ++this.keyOnlyVersion;
        }
        allValues.forEach(function markMissing(_value, key) {
            if (!freshValues.has(key) && !remappedKeys?.has(key)) {
                missingKeys.add(key);
            }
        });
        this.evictMissing();
    }

    public findKey(key: string | null): string | null | undefined {
        return this.getFormattedKeyIndex().get(this.caseFormat(key));
    }

    /** Kept across merges and removals, which update it in place; a replacing load drops it. */
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
    private evictMissing(): void {
        const max = this.params.handlerParams.filterParams.preservePreviousValuesLimit ?? DEFAULT_MAX_PRESERVED_VALUES;
        const { missingKeys, isKeyChecked } = this;
        if (max < 0 || missingKeys.size <= max) {
            return;
        }
        const evictable = Array.from(missingKeys).filter((key) => !isKeyChecked(key));
        for (let i = 0, len = evictable.length - max; i < len; ++i) {
            this.dropKey(evictable[i]);
        }
    }

    private dropKey(key: string | null): void {
        this.allValues.delete(key);
        this.missingKeys.delete(key);
        if (this.keyOnlyKeys.delete(key)) {
            ++this.keyOnlyVersion;
        }
        this.formattedKeyIndex?.delete(this.caseFormat(key));
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
        // Excel Mode lists the blank last when sorting, after the retained values too.
        const { excelMode, suppressSorting } = this.params.handlerParams.filterParams;
        if (excelMode && !suppressSorting && displayableKeys.has(null)) {
            displayableKeys.delete(null);
            displayableKeys.add(null);
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

/** Whether the Set Filter lists these values rather than the ones in the rows; an empty list is still a list. */
export const isProvidedValues = <V>(values: SetFilterValues<any, V> | undefined): values is SetFilterValues<any, V> =>
    values != null;
