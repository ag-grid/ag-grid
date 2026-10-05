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
import { createTreeDataOrGroupingComparator, mapFormattedKeys, setFilterNullIfBlank } from './setFilterUtils';

type SetValueModelEvent = 'availableValuesChanged' | 'loadingStart' | 'loadingEnd' | 'destroyed';

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

    private valuesType: SetFilterModelValuesType;

    private keyComparator: (a: string | null, b: string | null) => number;
    private entryComparator: (a: [string | null, TValue | null], b: [string | null, TValue | null]) => number;
    private compareByValue: boolean;

    private providedValues: SetFilterValues<any, TValue> | null = null;

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

    /** Returns whether the values are being loaded again. */
    public refresh(params: SetValueModelParams<TValue>): boolean {
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

        this.params = params;
        this.updateParams(params);

        if (valuesChanged) {
            this.setProvidedValues(values);
            this.colDefLoad = this.updateAllValues();
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
        const { valuesType, providedValues } = this;
        const overtaken = this.current;
        const wasLoading = this.isLoading();
        const fromCallback = valuesType === SetFilterModelValuesType.PROVIDED_CALLBACK;
        const load: ValuesLoad = { settle: () => {}, answered: false, fromCallback };
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
                resolve(this.processAllValues(values));
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

    public getAvailableKeys(values: SetFilterModelValue): SetFilterModelValue {
        return this.initialised ? values.filter((v) => this.availableKeys.has(v)) : values;
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

    public isValuesTakenFromGrid(): boolean {
        return this.valuesType === SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES;
    }

    private updateAvailableKeys(allKeys: (string | null)[]): void {
        const availableKeys = this.isValuesTakenFromGrid()
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
