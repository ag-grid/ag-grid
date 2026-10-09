import { _defaultComparator } from 'ag-stack';

import type {
    FilterHandlerParams,
    IClientSideRowModel,
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
import { mapFormattedKeys, setFilterNullIfBlank, treeDataOrGroupingComparator } from './setFilterUtils';

type SetValueModelEvent = 'availableValuesChanged' | 'loadingStart' | 'loadingEnd' | 'destroyed';

const DEFAULT_MAX_PRESERVED_VALUES = 100;

enum SetFilterModelValuesType {
    PROVIDED_LIST,
    PROVIDED_CALLBACK,
    TAKEN_FROM_GRID_VALUES,
}

/** One load of the values. Only the newest is read; one it overtakes settles with its keys. */
interface ValuesLoad {
    settle: (keys: (string | null)[]) => void;
    answered: boolean;
    readonly fromCallback: boolean;
    /** Drops the kept keys; a load overtaking one still pending inherits it. */
    replace: boolean;
}

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

    /** Once any value has loaded, no values means an empty source rather than one not loaded yet. */
    public valuesSeen = false;

    /** Bumped whenever `keyOnlyKeys` changes, so a list rebuilds the rows it drew for a key alone. */
    public keyOnlyVersion = 0;

    /** The keys the list shows: the available and missing keys, in the values' order. */
    public displayableKeys = this.availableKeys;

    private valuesType: SetFilterModelValuesType;

    private keyComparator: (a: string | null, b: string | null) => number;
    private valueComparator: (a: TValue | null, b: TValue | null) => number;
    private compareByValue: boolean;

    private providedValues: SetFilterValues<any, TValue> | null = null;

    private formattedKeyIndex: Map<string | null, string | null> | undefined;

    private initialised: boolean = false;

    private current: ValuesLoad | undefined;

    /** The current load's read of the rows, waiting for them to be ready; a newer load drops or replaces it. */
    private readRowsWhenReady: (() => void) | undefined;

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
        if (this.csrmValuesExtractor) {
            this.addManagedEventListeners({
                rowCountReady: () => this.readRowsWhenReady?.(),
            });
        }
        const params = this.params;
        this.updateParams(params);
        this.setProvidedValues(params.handlerParams.filterParams.values);
        this.updateAllValues();
    }

    /** Returns whether the values reload; `replace` drops the kept keys, made by rules no longer in force. */
    public refresh(params: SetValueModelParams<TValue>, replace: boolean): boolean {
        const handlerParams = params.handlerParams;

        if (handlerParams.source !== 'colDef') {
            // if params haven't changed, we don't need to do anything.
            // also don't want to override provided values set via api.
            return false;
        }
        this.colDefLoad = undefined;

        const values = handlerParams.filterParams.values;
        const oldHandlerParams = this.params.handlerParams;
        // the params change only with the column definition, so the API's values never read as its own
        const valuesChanged = (values ?? null) !== (oldHandlerParams.filterParams.values ?? null);

        this.updateParams(params);

        if (valuesChanged) {
            this.setProvidedValues(values);
            this.colDefLoad = this.updateAllValues(replace);
            return true;
        }
        if (replace) {
            const current = this.current;
            // its answer is keyed by the new rules, so it replaces kept keys rather than loading again
            if (current && !current.answered && this.isPreserving()) {
                current.replace = true;
                this.colDefLoad = this.allKeys;
                return false;
            }
            this.colDefLoad = this.updateAllValues(true);
            return true;
        }
        // the loaded values, the API's included, are sorted again; a load still pending sorts when it answers
        if (this.current?.answered && isOrderChanged(oldHandlerParams, handlerParams)) {
            const keys = this.sortKeys(this.allValues);
            const available = this.availableKeys;
            const nextAvailable = new Set<string | null>();
            for (let i = 0, len = keys.length; i < len; ++i) {
                const key = keys[i];
                if (available.has(key)) {
                    nextAvailable.add(key);
                }
            }
            this.allKeys = AgPromise.resolve(keys);
            this.availableKeys = nextAvailable;
            this.updateDisplayableKeys(keys);
        }
        return false;
    }

    /** The one writer of the values used, so their kind always matches them; `undefined` reads the rows. */
    public setProvidedValues(values: SetFilterValues<any, TValue> | undefined): void {
        this.providedValues = values ?? null;
        if (!isProvidedValues(values)) {
            this.valuesType = SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES;
        } else if (Array.isArray(values)) {
            this.valuesType = SetFilterModelValuesType.PROVIDED_LIST;
        } else {
            this.valuesType = SetFilterModelValuesType.PROVIDED_CALLBACK;
        }
    }

    /** Overtakes a load still pending rather than waiting on it, as its answer may never come. */
    public refreshValues(forColDef: boolean): AgPromise<unknown> {
        if (!forColDef) {
            return this.updateAllValues();
        }
        let load = this.colDefLoad;
        if (!load) {
            load = this.updateAllValues();
            this.colDefLoad = load;
        }
        return load;
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
        let valueComparator: (a: TValue | null, b: TValue | null) => number;
        if (treeDataOrGrouping && !keyComparator) {
            valueComparator = treeDataOrGroupingComparator as any;
        } else if (treeList && !treeListPathGetter && !keyComparator) {
            valueComparator = _defaultComparator;
        } else {
            valueComparator = keyComparator;
        }
        this.valueComparator = valueComparator;
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
        const { valuesType, providedValues } = this;
        const overtaken = this.current;
        const wasLoading = this.isLoading();
        const fromCallback = valuesType === SetFilterModelValuesType.PROVIDED_CALLBACK;
        const load: ValuesLoad = {
            settle: () => {},
            answered: false,
            fromCallback,
            replace: replace || (!!overtaken && !overtaken.answered && overtaken.replace),
        };
        this.current = load;
        this.readRowsWhenReady = undefined;
        if (wasLoading !== fromCallback) {
            this.dispatchLocalEvent({ type: fromCallback ? 'loadingStart' : 'loadingEnd' });
        }
        this.allKeys = new AgPromise<(string | null)[]>((resolve) => {
            load.settle = resolve;
            const resolveLoaded = (values: Map<string | null, TValue | null> | null) => {
                load.answered = true;
                if (fromCallback) {
                    this.dispatchLocalEvent({ type: 'loadingEnd' });
                }
                resolve(this.processAllValues(values, load.replace));
            };
            switch (valuesType) {
                case SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES: {
                    const readRows = () => {
                        this.readRowsWhenReady = undefined;
                        resolveLoaded(this.getValuesFromRows(null));
                    };
                    if (!this.csrmValuesExtractor || (this.beans.rowModel as IClientSideRowModel).rowCountReady) {
                        readRows();
                    } else {
                        this.readRowsWhenReady = readRows;
                    }
                    break;
                }
                case SetFilterModelValuesType.PROVIDED_LIST: {
                    resolveLoaded(this.uniqueValues(this.validateProvidedValues(providedValues as (TValue | null)[])));

                    break;
                }

                case SetFilterModelValuesType.PROVIDED_CALLBACK: {
                    const callback = providedValues as SetFilterValuesFunc<any, TValue>;
                    const { column, colDef } = this.params.handlerParams;
                    const params: SetFilterValuesFuncParams<any, TValue> = _addGridCommonParams(this.gos, {
                        // an answer to a load since overtaken, or to a destroyed filter, or a second answer, is not read
                        success: (values) => {
                            if (this.current === load && this.isAlive() && !load.answered) {
                                resolveLoaded(this.uniqueValues(this.validateProvidedValues(values)));
                            }
                        },
                        colDef,
                        column,
                    });

                    window.setTimeout(() => {
                        if (this.current === load && this.isAlive()) {
                            callback(params);
                        }
                    }, 0);

                    break;
                }
            }
        });
        this.allKeys.then((values) => {
            if (this.current === load) {
                this.updateAvailableKeys(values ?? []);
                this.initialised = true;
            }
        });
        // The load overtaken settles with this one's keys, as its own answer may never come.
        if (overtaken && !overtaken.answered) {
            this.allKeys.then(overtaken.settle);
        }

        return this.allKeys;
    }

    public getAvailableValues(predicate: (node: RowNode) => boolean): (string | null)[] {
        return this.sortKeys(this.getValuesFromRows(predicate));
    }

    public refreshAvailable(): AgPromise<boolean> {
        return new AgPromise((resolve) => {
            if (this.isValuesTakenFromGrid()) {
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

    public isLoading(): boolean {
        const current = this.current;
        return !!current && !current.answered && current.fromCallback;
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

    /** The values' keys, or only the available ones, under their case-folded form. */
    public mapFormattedKeys(availableOnly?: boolean): Map<string | null, string | null> {
        return mapFormattedKeys(availableOnly ? this.availableKeys : this.allValues.keys(), this.caseFormat);
    }

    private getValuesFromRows(
        predicate: ((node: RowNode) => boolean) | null
    ): Map<string | null, TValue | null> | null {
        const csrmValuesExtractor = this.csrmValuesExtractor;
        if (!csrmValuesExtractor) {
            this.error(113);
            return null;
        }
        const existingValues =
            predicate && !this.params.handlerParams.filterParams.caseSensitive ? this.allValues : undefined;
        return csrmValuesExtractor.extractUniqueValues(predicate, existingValues);
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

    /** Folds the fresh values into the kept ones in place; one in another case keeps the kept key and value, its first-seen case. */
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
            if (key === freshKey) {
                // A kept key keeps its position, so first-seen order holds under `suppressSorting`.
                allValues.set(key, value);
            } else {
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
        let index = this.formattedKeyIndex;
        if (!index) {
            index = mapFormattedKeys(this.allValues.keys(), this.caseFormat);
            this.formattedKeyIndex = index;
        }
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
        const values = nullableValues ?? new Map<string | null, TValue | null>();

        const filterParams = this.params.handlerParams.filterParams;

        // Their values are unknown, so no comparator is handed one: after the rest, ordered by key when sorting.
        const keyOnlyKeys = this.keyOnlyKeys.size > 0 && values === this.allValues ? this.keyOnlyKeys : undefined;

        if (filterParams.suppressSorting) {
            if (!keyOnlyKeys) {
                return Array.from(values.keys());
            }
            const unsortedKeys: (string | null)[] = [];
            values.forEach(function collectValueKey(_value, key) {
                if (!keyOnlyKeys.has(key)) {
                    unsortedKeys.push(key);
                }
            });
            for (const key of keyOnlyKeys) {
                unsortedKeys.push(key);
            }
            return unsortedKeys;
        }
        // Excel Mode lists the blank last, so it is left out of the sort.
        const blankLast = !!filterParams.excelMode && values.has(null);
        const keys: (string | null)[] = [];
        const sortValues: (TValue | null)[] | undefined = this.compareByValue ? [] : undefined;
        values.forEach(function collectSortedKey(value, key) {
            if ((key === null && blankLast) || keyOnlyKeys?.has(key)) {
                return;
            }
            keys.push(key);
            if (sortValues) {
                sortValues.push(value);
            }
        });

        let sortedKeys: (string | null)[];
        if (sortValues) {
            const valueComparator = this.valueComparator;
            const len = keys.length;
            const order: number[] = [];
            for (let i = 0; i < len; ++i) {
                order.push(i);
            }
            order.sort(function compareSortValues(a, b) {
                return valueComparator(sortValues[a], sortValues[b]);
            });
            sortedKeys = [];
            for (let i = 0; i < len; ++i) {
                sortedKeys.push(keys[order[i]]);
            }
        } else {
            sortedKeys = keys.sort(this.keyComparator);
        }

        if (keyOnlyKeys) {
            const sortedKeyOnlyKeys = Array.from(keyOnlyKeys).sort(_defaultComparator);
            for (let i = 0, len = sortedKeyOnlyKeys.length; i < len; ++i) {
                const key = sortedKeyOnlyKeys[i];
                if (key !== null || !blankLast) {
                    sortedKeys.push(key);
                }
            }
        }

        if (blankLast) {
            sortedKeys.push(null);
        }

        return sortedKeys;
    }

    private updateDisplayableKeys(allKeys: (string | null)[]): void {
        const { availableKeys, missingKeys } = this;
        if (!missingKeys.size && !this.isPreserving()) {
            this.displayableKeys = availableKeys;
            return;
        }
        // In the values' order, not the rows', so a value leaving or returning never moves the others.
        const displayableKeys = new Set<string | null>();
        for (let i = 0, len = allKeys.length; i < len; ++i) {
            const key = allKeys[i];
            if (availableKeys.has(key) || missingKeys.has(key)) {
                displayableKeys.add(key);
            }
        }
        this.displayableKeys = displayableKeys;
    }

    public isValuesTakenFromGrid(): boolean {
        return this.valuesType === SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES;
    }

    private updateAvailableKeys(allKeys: (string | null)[]): void {
        const missingKeys = this.missingKeys;
        let availableKeys: (string | null)[];
        if (this.isValuesTakenFromGrid()) {
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

/** Whether an input the order is read from differs; a change to the keys reloads the values instead. */
const isOrderChanged = (
    oldParams: FilterHandlerParams<any, any, SetFilterModel, ISetFilterParams<any, any>>,
    newParams: FilterHandlerParams<any, any, SetFilterModel, ISetFilterParams<any, any>>
): boolean => {
    const oldFilterParams = oldParams.filterParams;
    const newFilterParams = newParams.filterParams;
    return (
        oldFilterParams.suppressSorting !== newFilterParams.suppressSorting ||
        oldFilterParams.excelMode !== newFilterParams.excelMode ||
        oldFilterParams.comparator !== newFilterParams.comparator ||
        oldParams.colDef.comparator !== newParams.colDef.comparator ||
        oldFilterParams.treeList !== newFilterParams.treeList ||
        // the order reads only whether there is one; the data type builds its own afresh with every definition
        !oldFilterParams.treeListPathGetter !== !newFilterParams.treeListPathGetter
    );
};

/** Whether the Set Filter lists these values rather than the ones in the rows; an empty list is still a list. */
export const isProvidedValues = <V>(values: SetFilterValues<any, V> | undefined): values is SetFilterValues<any, V> =>
    values != null;
