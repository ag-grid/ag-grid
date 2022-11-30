import {
    IClientSideRowModel,
    Column,
    Constants,
    ISetFilterParams,
    AgPromise,
    SetFilterValues,
    SetFilterValuesFunc,
    SetFilterValuesFuncParams,
    TextFilter,
    TextFormatter,
    ValueFormatterService,
    IEventEmitter,
    EventService,
    RowNode,
    _,
    SetFilterModelValue,
    ValueFormatterParams,
    GridOptionsService,
    ColumnModel,
    ValueService
} from '@ag-grid-community/core';
import { ISetFilterLocaleText } from './localeText';
import { ClientSideValuesExtractor } from '../clientSideValueExtractor';
import { FlatSetDisplayValueModel } from './flatSetDisplayValueModel';
import { ISetDisplayValueModel, SetFilterModelTreeItem } from './iSetDisplayValueModel';
import { TreeSetDisplayValueModel } from './treeSetDisplayValueModel';

export enum SetFilterModelValuesType {
    PROVIDED_LIST, PROVIDED_CALLBACK, TAKEN_FROM_GRID_VALUES
}

interface SetFilterModelValues<K extends string | string[], V, A> {
    isKeySelected(key: K | null): boolean;

    selectKey(key: K | null): void;

    deselectKey(key: K | null): void;

    getSelectedKeyCount(): number;

    selectAll(): void;

    clearSelectedKeys(): void;

    getSelectedKeys(): (K | null)[];

    setSelectedKeys(keys: Iterable<K | null>): void;

    setSelectedKeysThatExist(keys: (K | null)[]): void;

    getKeys(): (K | null)[];

    getAllKeyCount(): number;

    getValues(): (V | null)[];

    getValue(key: K | null): V | null;

    uniqueValues(values: (V | null)[]): A

    setAllValues(allValues: A | null): void;

    getValuesFromRows(clientSideValuesExtractor: ClientSideValuesExtractor<V>, predicate: (node: RowNode) => boolean, checkExistingValue: boolean): A;

    sortKeys(values: A | null): (K | null)[];

    isKeyAvailable(key: K | null): boolean;

    setAvailableKeys(keys: Iterable<K | null>): void;

    getAvailableKeys(): Iterable<K | null>;
}

class FlatSetFilterModelValues<V> implements SetFilterModelValues<string, V, Map<string | null, V | null>> {
    private readonly keyComparator: (a: string | null, b: string | null) => number;
    private readonly entryComparator: (a: [string | null, V | null], b: [string | null, V | null]) => number;
    private readonly compareByValue: boolean;

    /** All possible values for the filter, sorted if required. */
    private allValues: Map<string | null, V | null> = new Map();

    /** Remaining keys when filters from other columns have been applied. */
    private availableKeys = new Set<string | null>();

    /** Keys that have been selected for this filter. */
    private selectedKeys = new Set<string | null>();

    constructor(
        private readonly suppressSorting: boolean,
        keyComparator: (a: V | null, b: V | null) => number,
        private readonly excelMode: boolean,
        private readonly caseFormat: <T extends string | null>(valueToFormat: T) => typeof valueToFormat,
        private readonly convertAndGetKey: (value: V | null) => string | null,
        usingComplexObjects: boolean
    ) {
        // if using complex objects and a comparator is provided, sort by values, otherwise need to sort by the string keys
        this.compareByValue = usingComplexObjects && !!keyComparator;
        if (this.compareByValue) {
            this.entryComparator = ([_aKey, aValue]: [string | null, V | null], [_bKey, bValue]: [string | null, V | null]) => keyComparator(aValue, bValue);    
        } else {
            this.keyComparator = keyComparator as any ?? _.defaultComparator;
        }
    }

    public isKeySelected(key: string | null): boolean {
        return this.selectedKeys.has(key);
    }

    public selectKey(key: string | null): void {
        this.selectedKeys.add(key);
    }

    public deselectKey(key: string | null): void {
        this.selectedKeys.delete(key);
    }

    public getSelectedKeyCount(): number {
        return this.selectedKeys.size;
    }

    public selectAll(): void {
        this.setSelectedKeys(this.allValues.keys());
    }

    public clearSelectedKeys(): void {
        this.selectedKeys.clear();
    }

    public getSelectedKeys(): (string | null)[] {
        return Array.from(this.selectedKeys);
    }

    public setSelectedKeys(keys: Iterable<string | null>): void {
        this.selectedKeys = new Set(keys);
    }

    public setSelectedKeysThatExist(keys: (string | null)[]): void {
        this.clearSelectedKeys();

        const existingFormattedKeys: Map<string | null, string | null> = new Map();
        this.allValues.forEach((_value, key) => {
            existingFormattedKeys.set(this.caseFormat(key), key);
        });

        keys.forEach(unformattedKey => {
            const formattedKey = this.caseFormat(unformattedKey);
            const existingUnformattedKey = existingFormattedKeys.get(formattedKey);
            if (existingUnformattedKey !== undefined) {
                this.selectKey(existingUnformattedKey);
            }
        });
    }

    public getKeys(): (string | null)[] {
        return Array.from(this.allValues.keys());
    }

    public getAllKeyCount(): number {
        return this.allValues.size;
    }

    public getValues(): (V | null)[] {
        return Array.from(this.allValues.values());
    }

    public getValue(key: string | null): V | null {
        return this.allValues.get(key)!;
    }

    public uniqueValues(values: (V | null)[] | null): Map<string | null, V | null> {
        const uniqueValues: Map<string | null, V | null> = new Map();
        const formattedKeys: Set<string | null> = new Set();
        (values ?? []).forEach(value => {
            const valueToUse = _.makeNull(value);
            const unformattedKey = this.convertAndGetKey(valueToUse);
            const formattedKey = this.caseFormat(unformattedKey);
            if (!formattedKeys.has(formattedKey)) {
                formattedKeys.add(formattedKey);
                uniqueValues.set(unformattedKey, valueToUse);
            }
        });

        return uniqueValues;
    }

    public setAllValues(allValues: Map<string | null, V | null> | null): void {
        this.allValues = allValues ?? new Map();
    }

    public getValuesFromRows(clientSideValuesExtractor: ClientSideValuesExtractor<V>, predicate: (node: RowNode<any>) => boolean, checkExistingValue: boolean): Map<string | null, V | null> {
        return clientSideValuesExtractor.extractUniqueValues(predicate, checkExistingValue ? this.allValues : undefined);
    }

    public sortKeys<A>(nullableValues: Map<string | null, V | null> | null): (string | null)[] {
        const values = nullableValues ?? new Map();

        if (this.suppressSorting) { return Array.from(values.keys()); }

        let sortedKeys;
        if (this.compareByValue) {
            sortedKeys = Array.from(values.entries()).sort(this.entryComparator).map(([key]) => key);
        } else {
            sortedKeys = Array.from(values.keys()).sort(this.keyComparator);
        }

        if (this.excelMode && values.has(null)) {
            // ensure the blank value always appears last
            sortedKeys = sortedKeys.filter(v => v != null);
            sortedKeys.push(null);
        }

        return sortedKeys;
    }

    public isKeyAvailable(key: string | null): boolean {
        return this.availableKeys.has(key);
    }

    public setAvailableKeys(keys: Iterable<string | null>): void {
        this.availableKeys = new Set(keys);
    }

    public getAvailableKeys(): Iterable<string | null> {
        return this.availableKeys;
    }
}

class TreeSetFilterModelValues<V> implements SetFilterModelValues<string[], V, (string[] | null)[]> {
    /** All possible values for the filter, sorted if required. */
    private allValues: (string[] | null)[];

    /** Remaining keys when filters from other columns have been applied. */
    private availableKeys = new Map<string | null, (string[] | null)[]>();

    /** Keys that have been selected for this filter. */
    private selectedKeys = new Map<string | null, (string[] | null)[]>();

    public isKeySelected(key: string[] | null): boolean {
        const groupKeys = this.getGroupKeys(this.selectedKeys, key);
        if (!groupKeys) {
            return false;
        }
        return this.hasGroupKeyInGroupKeys(groupKeys, key);
    }
    
    public selectKey(key: string[] | null): void {
        this.addGroupKey(this.selectedKeys, key);
    }
    
    public deselectKey(key: string[] | null): void {
        const groupKeys = this.getGroupKeys(this.selectedKeys, key);
        if (!groupKeys) {
            return;
        }
        const index = groupKeys.findIndex(groupKey => _.areEqual(groupKey, key));
        if (index >= 0) {
            if (groupKeys.length === 1) {
                this.selectedKeys.delete(this.getChildKey(key));
            } else {
                groupKeys.splice(index, 1);
            }
        }
    }
    
    public getSelectedKeyCount(): number {
        let count = 0;
        this.selectedKeys.forEach(groupKeys => {
            count += groupKeys.length;
        });
        return count;
    }
    
    public selectAll(): void {
        this.setSelectedKeys(this.allValues);
    }
    
    public clearSelectedKeys(): void {
        this.selectedKeys.clear();
    }
    
    public getSelectedKeys(): (string[] | null)[] {
        return this.flattenGroupKeys(this.selectedKeys);
    }
    
    public setSelectedKeys(keys: Iterable<string[] | null>): void {
        this.setGroupKeys(this.selectedKeys, keys);
    }
    
    public setSelectedKeysThatExist(keys: (string[] | null)[]): void {
        this.clearSelectedKeys();

        const existingKeys = new Map<string | null, (string[] | null)[]>();
        this.allValues.forEach(key => this.addGroupKey(existingKeys, key));

        keys.forEach(key => {
            if (this.hasGroupKey(existingKeys, key)) {
                this.selectKey(key);
            }
        });
    }
    
    public getKeys(): (string[] | null)[] {
        return [...this.allValues];
    }
    
    public getAllKeyCount(): number {
        return this.allValues.length;
    }
    
    public getValues(): (V | null)[] {
        return this.getKeys() as any;
    }
    
    public getValue(key: string[] | null): V | null {
        return key as any;
    }
    
    public uniqueValues(values: (V | null)[]): (string[] | null)[] {
        return values as any;
    }

    public setAllValues(allValues: (string[] | null)[] | null): void {
        this.allValues = allValues ?? [];
    }

    public getValuesFromRows(clientSideValuesExtractor: ClientSideValuesExtractor<V>, predicate: (node: RowNode<any>) => boolean): (string[] | null)[] {
        return clientSideValuesExtractor.extractTreeValues(predicate);
    }

    public sortKeys(values: (string[] | null)[] | null): (string[] | null)[] {
        // TODO should we support sorting?
        return values ?? [];
    }
    
    public isKeyAvailable(key: string[] | null): boolean {
        return this.hasGroupKey(this.availableKeys, key);
    }
    
    public setAvailableKeys(keys: Iterable<string[] | null>): void {
        this.setGroupKeys(this.availableKeys, keys);
    }

    public getAvailableKeys(): Iterable<string[] | null> {
        return this.flattenGroupKeys(this.availableKeys);
    }

    private getChildKey(key: string[] | null): string | null {
        return key ? _.last(key) : null;
    }

    private getGroupKeys(keys: Map<string | null, (string[] | null)[]>, key: string[] | null): (string[] | null)[] | undefined {
        return keys.get(this.getChildKey(key));
    }

    private putIfAbsentGroupKeys(keys: Map<string | null, (string[] | null)[]>, key: string[] | null): (string[] | null)[] {
        const childKey = this.getChildKey(key);
        let groupKeys = keys.get(childKey);
        if (!groupKeys) {
            groupKeys = [];
            keys.set(childKey, groupKeys);
        }
        return groupKeys;
    }

    private addGroupKey(keys: Map<string | null, (string[] | null)[]>, key: string[] | null): void {
        const groupKeys = this.putIfAbsentGroupKeys(keys, key);
        if (!this.hasGroupKeyInGroupKeys(groupKeys, key)) {
            groupKeys.push(key);
        }
    }

    private hasGroupKeyInGroupKeys(groupKeys: (string[] | null)[], key: string[] | null) {
        return groupKeys.some(groupKey => _.areEqual(groupKey, key))
    }

    private hasGroupKey(keys: Map<string | null, (string[] | null)[]>, key: string[] | null): boolean {
        const groupKeys = this.getGroupKeys(keys, key);
        if (!groupKeys) {
            return false;
        }
        return this.hasGroupKeyInGroupKeys(groupKeys, key);
    }

    private setGroupKeys(keys: Map<string | null, (string[] | null)[]>, newKeys: Iterable<string[] | null>): void {
        keys.clear();
        for (let key of newKeys) {
            this.addGroupKey(keys, key);
        }
    }

    private flattenGroupKeys(keys: Map<string | null, (string[] | null)[]>): (string[] | null)[] {
        const flattenedKeys: (string[] | null)[] = [];
        keys.forEach(groupKeys => {
            flattenedKeys.push(...groupKeys);
        });
        return flattenedKeys;
    }
}


/** @param V type of value in the Set Filter */
export class SetValueModel<K extends string | string[], V> implements IEventEmitter {
    public static EVENT_AVAILABLE_VALUES_CHANGED = 'availableValuesChanged';

    private readonly localEventService = new EventService();
    private readonly formatter: TextFormatter;
    private readonly clientSideValuesExtractor: ClientSideValuesExtractor<V>;
    private readonly column: Column;
    private readonly doesRowPassOtherFilters: (node: RowNode) => boolean;
    private readonly suppressSorting: boolean;
    private readonly convertValuesToStrings: boolean;
    private readonly caseSensitive: boolean;
    private readonly displayValueModel: ISetDisplayValueModel<K, V>
    private readonly modelValues: SetFilterModelValues<K, V, any>;

    private valuesType: SetFilterModelValuesType;
    private miniFilterText: string | null = null;

    /** Values provided to the filter for use. */
    private providedValues: SetFilterValues<any, V> | null = null;

    /** Values can be loaded asynchronously, so wait on this promise if you need to ensure values have been loaded. */
    private allValuesPromise: AgPromise<(K | null)[]>;

    private initialised: boolean = false;

    constructor(
        private readonly filterParams: ISetFilterParams<any, V>,
        private readonly setIsLoading: (loading: boolean) => void,
        private readonly valueFormatterService: ValueFormatterService,
        private readonly translate: (key: keyof ISetFilterLocaleText) => string,
        private readonly caseFormat: <T extends string | null>(valueToFormat: T) => typeof valueToFormat,
        private readonly createKey: (value: V | null, node?: RowNode) => string | null,
        private readonly valueFormatter: (params: ValueFormatterParams) => string,
        usingComplexObjects: boolean,
        private readonly gridOptionsService: GridOptionsService,
        columnModel: ColumnModel,
        valueService: ValueService,
        treeDataTreeList: boolean,
        groupingTreeList: boolean
    ) {
        const {
            column,
            colDef,
            textFormatter,
            doesRowPassOtherFilter,
            suppressSorting,
            comparator,
            rowModel,
            values,
            caseSensitive,
            convertValuesToStrings,
            treeList,
            treeListPathGetter,
        } = filterParams;

        this.column = column;
        this.formatter = textFormatter || TextFilter.DEFAULT_FORMATTER;
        this.doesRowPassOtherFilters = doesRowPassOtherFilter;
        this.suppressSorting = suppressSorting || false;
        this.convertValuesToStrings = !!convertValuesToStrings;
        const keyComparator = comparator ?? colDef.comparator as (a: any, b: any) => number;
        this.caseSensitive = !!caseSensitive
        const getDataPath = this.gridOptionsService.get('getDataPath');

        if (rowModel.getType() === Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
            this.clientSideValuesExtractor = new ClientSideValuesExtractor(
                rowModel as IClientSideRowModel,
                this.filterParams,
                this.createKey,
                this.caseFormat,
                columnModel,
                valueService,
                treeDataTreeList,
                getDataPath
            );
        }

        if (values == null) {
            this.valuesType = SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES;
        } else {
            this.valuesType = Array.isArray(values) ?
                SetFilterModelValuesType.PROVIDED_LIST :
                SetFilterModelValuesType.PROVIDED_CALLBACK;

            this.providedValues = values;
        }

        this.displayValueModel = treeList ? new TreeSetDisplayValueModel(
            this.formatter,
            treeListPathGetter,
            treeDataTreeList || groupingTreeList
        ) : new FlatSetDisplayValueModel<V>(
            this.valueFormatterService,
            this.valueFormatter,
            this.formatter,
            this.column
        ) as any;

        this.modelValues = treeDataTreeList || groupingTreeList ? new TreeSetFilterModelValues<V>() : new FlatSetFilterModelValues<V>(
            this.suppressSorting,
            keyComparator,
            !!this.filterParams.excelMode,
            this.caseFormat,
            (value) => this.convertAndGetKey(value),
            usingComplexObjects
        ) as any;

        this.updateAllValues().then(updatedKeys => this.resetSelectionState(updatedKeys || []));
    }

    public addEventListener(eventType: string, listener: Function, async?: boolean): void {
        this.localEventService.addEventListener(eventType, listener, async);
    }

    public removeEventListener(eventType: string, listener: Function, async?: boolean): void {
        this.localEventService.removeEventListener(eventType, listener, async);
    }

    /**
     * Re-fetches the values used in the filter from the value source.
     * If keepSelection is false, the filter selection will be reset to everything selected,
     * otherwise the current selection will be preserved.
     */
    public refreshValues(): AgPromise<void> {
        const currentModel = this.getModel();

        this.updateAllValues();

        // ensure model is updated for new values
        return this.setModel(currentModel);
    }

    /**
     * Overrides the current values being used for the set filter.
     * If keepSelection is false, the filter selection will be reset to everything selected,
     * otherwise the current selection will be preserved.
     */
    public overrideValues(valuesToUse: (V | null)[]): AgPromise<void> {
        return new AgPromise<void>(resolve => {
            // wait for any existing values to be populated before overriding
            this.allValuesPromise.then(() => {
                this.valuesType = SetFilterModelValuesType.PROVIDED_LIST;
                this.providedValues = valuesToUse;
                this.refreshValues().then(() => resolve());
            });
        });
    }

    /** @return has anything been updated */
    public refreshAfterAnyFilterChanged(): AgPromise<boolean> {
        if (this.showAvailableOnly()) {
            return this.allValuesPromise.then(keys => {
                this.updateAvailableKeys(keys ?? []);
                return true;
            });
        }
        return AgPromise.resolve(false);
    }

    public isInitialised(): boolean {
        return this.initialised;
    }

    private updateAllValues(): AgPromise<(K | null)[]> {
        this.allValuesPromise = new AgPromise<(K | null)[]>(resolve => {
            switch (this.valuesType) {
                case SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES:
                case SetFilterModelValuesType.PROVIDED_LIST: {
                    resolve(this.processAllKeys(this.valuesType === SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES, this.providedValues as (V | null)[]));

                    break;
                }

                case SetFilterModelValuesType.PROVIDED_CALLBACK: {
                    this.setIsLoading(true);

                    const callback = this.providedValues as SetFilterValuesFunc<any, V>;
                    const { columnApi, api, context, column, colDef } = this.filterParams;
                    const params: SetFilterValuesFuncParams<any, V> = {
                        success: values => {
                            this.setIsLoading(false);

                            resolve(this.processAllKeys(false, values));
                        },
                        colDef,
                        column,
                        columnApi,
                        api,
                        context,

                    };

                    window.setTimeout(() => callback(params), 0);

                    break;
                }

                default:
                    throw new Error('Unrecognised valuesType');
            }
        });

        this.allValuesPromise.then(values => this.updateAvailableKeys(values || [], true)).then(() => this.initialised = true);

        return this.allValuesPromise;
    }

    private processAllKeys(getFromRows: boolean, providedValues?: (V | null)[] | undefined): (K | null)[] {
        const values = getFromRows ? this.getValuesFromRows(false) : this.modelValues.uniqueValues(providedValues as (V | null)[]);

        const sortedKeys = this.modelValues.sortKeys(values);

        this.modelValues.setAllValues(values);
        
        return sortedKeys;
    }

    public setValuesType(value: SetFilterModelValuesType) {
        this.valuesType = value;
    }

    public getValuesType(): SetFilterModelValuesType {
        return this.valuesType;
    }

    public isKeyAvailable(key: K | null): boolean {
        return this.modelValues.isKeyAvailable(key);
    }

    private showAvailableOnly(): boolean {
        return this.valuesType === SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES;
    }

    private updateAvailableKeys(allKeys: (K | null)[], isInitialLoad?: boolean): void {
        // on initial load no need to re-read from rows
        const availableKeys = this.showAvailableOnly() && !isInitialLoad ? this.modelValues.sortKeys(this.getValuesFromRows(true)) : allKeys;

        this.modelValues.setAvailableKeys(availableKeys);
        this.localEventService.dispatchEvent({ type: SetValueModel.EVENT_AVAILABLE_VALUES_CHANGED });

        this.updateDisplayedValues();
    }

    private getValuesFromRows(removeUnavailableValues = false): Map<string | null, V | null> | null {
        if (!this.clientSideValuesExtractor) {
            console.error('AG Grid: Set Filter cannot initialise because you are using a row model that does not contain all rows in the browser. Either use a different filter type, or configure Set Filter such that you provide it with values');
            return null;
        }

        const predicate = (node: RowNode) => (!removeUnavailableValues || this.doesRowPassOtherFilters(node));

        return this.modelValues.getValuesFromRows(this.clientSideValuesExtractor, predicate, removeUnavailableValues && !this.caseSensitive);
    }

    /** Sets mini filter value. Returns true if it changed from last value, otherwise false. */
    public setMiniFilter(value?: string | null): boolean {
        value = _.makeNull(value);

        if (this.miniFilterText === value) {
            //do nothing if filter has not changed
            return false;
        }

        this.miniFilterText = value;
        this.updateDisplayedValues(true);

        return true;
    }

    public getMiniFilter(): string | null {
        return this.miniFilterText;
    }

    public updateDisplayedValues(fromMiniFilter?: boolean, fromExpansion?: boolean): void {
        if (fromExpansion) {
            this.displayValueModel.refresh();
            return;
        }

        // if no filter, just display all available values
        if (this.miniFilterText == null) {
            this.displayValueModel.updateDisplayedValuesToAllAvailable((key: K | null) => this.modelValues.getValue(key)!, this.modelValues.getAvailableKeys());
            return;
        }

        // if filter present, we filter down the list
        // to allow for case insensitive searches, upper-case both filter text and value
        const formattedFilterText = this.caseFormat(this.formatter(this.miniFilterText) || '');

        const matchesFilter = (valueToCheck: string | null): boolean =>
            valueToCheck != null && this.caseFormat(valueToCheck).indexOf(formattedFilterText) >= 0;

        const nullMatchesFilter = !!this.filterParams.excelMode && matchesFilter(this.translate('blanks'));

        this.displayValueModel.updateDisplayedValuesToMatchMiniFilter(
            (key: K | null) => this.modelValues.getValue(key)!,
            this.modelValues.getAvailableKeys(),
            matchesFilter,
            nullMatchesFilter,
            fromMiniFilter);
    }

    public getDisplayedValueCount(): number {
        return this.displayValueModel.getDisplayedValueCount();
    }

    public getDisplayedItem(index: number): K | SetFilterModelTreeItem<K> | null {
        return this.displayValueModel.getDisplayedItem(index);
    }

    public hasSelections(): boolean {
        return this.filterParams.defaultToNothingSelected ?
            this.modelValues.getSelectedKeyCount() > 0 :
            this.modelValues.getAllKeyCount() !== this.modelValues.getSelectedKeyCount();
    }

    public getKeys(): SetFilterModelValue<K> {
        return this.modelValues.getKeys();
    }

    public getValues(): (V | null)[] {
        return this.modelValues.getValues();
    }

    public getValue(key: K | null): V | null {
        return this.modelValues.getValue(key);
    }

    public selectAllMatchingMiniFilter(clearExistingSelection = false): void {
        if (this.miniFilterText == null) {
            // ensure everything is selected
            this.modelValues.selectAll();
        } else {
            // ensure everything that matches the mini filter is selected
            if (clearExistingSelection) { this.modelValues.clearSelectedKeys(); }

            this.displayValueModel.forEachDisplayedKey(key => this.modelValues.selectKey(key));
        }
    }

    public deselectAllMatchingMiniFilter(): void {
        if (this.miniFilterText == null) {
            // ensure everything is deselected
            this.modelValues.clearSelectedKeys();
        } else {
            // ensure everything that matches the mini filter is deselected
            this.displayValueModel.forEachDisplayedKey(key => this.modelValues.deselectKey(key));
        }
    }

    public selectKey(key: K | null): void {
        this.modelValues.selectKey(key);
    }

    public deselectKey(key: K | null): void {
        if (this.filterParams.excelMode && this.isEverythingVisibleSelected()) {
            // ensure we're starting from the correct "everything selected" state
            this.resetSelectionState(this.displayValueModel.getDisplayedKeys());
        }

        this.modelValues.deselectKey(key);
    }

    public isKeySelected(key: K | null): boolean {
        return this.modelValues.isKeySelected(key);
    }

    public isEverythingVisibleSelected(): boolean {
        return !this.displayValueModel.someDisplayedKey(it => !this.isKeySelected(it));
    }

    public isNothingVisibleSelected(): boolean {
        return !this.displayValueModel.someDisplayedKey(it => this.isKeySelected(it));
    }

    public getModel(): SetFilterModelValue<K> | null {
        return this.hasSelections() ? this.modelValues.getSelectedKeys(): null;
    }

    public setModel(model: SetFilterModelValue<K> | null): AgPromise<void> {
        return this.allValuesPromise.then(keys => {
            if (model == null) {
                this.resetSelectionState(keys ?? []);
            } else {
                // select all values from the model that exist in the filter
                this.modelValues.setSelectedKeysThatExist(model);
            }
        });
    }

    private convertAndGetKey(value: V | null): string | null {
        return this.convertValuesToStrings ? value as any : this.createKey(value);
    }

    private resetSelectionState(keys: (K | null)[]): void {
        if (this.filterParams.defaultToNothingSelected) {
            this.modelValues.clearSelectedKeys;
        } else {
            this.modelValues.setSelectedKeys(keys);
        }
    }

    public hasGroups(): boolean {
        return this.displayValueModel.hasGroups();
    }
}
