import { _debounce, _last, _toStringOrNull } from 'ag-stack';

import type {
    AgColumn,
    AgPromise,
    BeanCollection,
    DoesFilterPassParams,
    FilterHandler,
    FilterHandlerParams,
    IRowNode,
    SetFilterHandler as ISetFilterHandler,
    ISetFilterParams,
    KeyCreatorParams,
    RowNode,
    SetFilterModel,
    SetFilterModelValue,
    ValueFormatterParams,
} from 'ag-grid-community';
import {
    BeanStub,
    _addGridCommonParams,
    _bindFilterCallback,
    _isBlank,
    _isClientSideRowModel,
} from 'ag-grid-community';

import { CsrmValuesExtractor } from './csrmValueExtractor';
import type { SetFilterModelTreeItem } from './iSetDisplayValueModel';
import { SetFilterAppliedModel } from './setFilterAppliedModel';
import {
    processDataPath,
    setFilterFormattedValue,
    setFilterNullIfBlank,
    translateForSetFilter,
    unformattedSetFilterText,
} from './setFilterUtils';
import SetFilterModelValuesType, { SetValueModel } from './setValueModel';
import { TreeSetDisplayValueModel } from './treeSetDisplayValueModel';

type SetFilterHandlerEventType = 'anyFilterChanged' | 'dataChanged' | 'destroyed';

function resolveKeyCreatorFlags(
    beans: BeanCollection,
    params: FilterHandlerParams<any, any, SetFilterModel, ISetFilterParams<any, any>>
): { usingComplexObjects: boolean; userKeyCreator: boolean } {
    const { colDef, filterParams } = params;
    const keyCreator = filterParams.keyCreator ?? colDef.keyCreator;
    const cellDataType = colDef.cellDataType;
    // A data type installs its own formatter as the key creator, which says nothing about the values.
    const gridSupplied =
        typeof cellDataType === 'string' && keyCreator === beans.dataTypeSvc?.getFormatValue(cellDataType);
    return { usingComplexObjects: !!keyCreator, userKeyCreator: !!keyCreator && !gridSupplied };
}

export class SetFilterHandler<TValue = string>
    extends BeanStub<SetFilterHandlerEventType>
    implements FilterHandler<any, any, SetFilterModel, ISetFilterParams<any, TValue>>, ISetFilterHandler<TValue>
{
    /** Used to get the filter type for filter models. */
    public readonly filterType = 'set' as const;
    public params: FilterHandlerParams<any, any, SetFilterModel, ISetFilterParams<any, TValue>>;
    /**
     * Here we keep track of the keys that are currently being used for filtering.
     * In most cases, the filtering keys are the same as the selected keys,
     * but for the specific case when excelMode = 'windows' and the user has ticked 'Add current selection to filter',
     * the filtering keys can be different from the selected keys.
     */
    private appliedModel: SetFilterAppliedModel;
    public valueModel: SetValueModel<TValue>;
    private createKey: (value: TValue | null | undefined, node?: IRowNode | null) => string | null;
    private treeDataTreeList = false;
    private groupingTreeList = false;
    private caseSensitive: boolean = false;
    private keyShape = '';
    private keyCaseSensitive = false;
    public valueFormatter?: (params: ValueFormatterParams) => string;
    private noValueFormatterSupplied = false;

    public init(params: FilterHandlerParams<any, any, SetFilterModel, ISetFilterParams<any, TValue>>): void {
        this.updateParams(params);
        const isTreeDataOrGrouping = this.isTreeDataOrGrouping.bind(this);
        const isTreeData = () => this.treeDataTreeList;
        const createKey = this.createKey;
        const caseFormat = this.caseFormat.bind(this);
        const { gos, beans } = this;
        // Before the value model, whose first load evicts by what the model checks.
        this.appliedModel = new SetFilterAppliedModel(caseFormat);
        this.appliedModel.update(params.model);
        const csrmValuesExtractor = _isClientSideRowModel(gos, beans.rowModel)
            ? this.createManagedBean(
                  new CsrmValuesExtractor<TValue>(
                      createKey,
                      caseFormat,
                      params.getValue,
                      isTreeDataOrGrouping,
                      isTreeData
                  )
              )
            : undefined;
        const valueModel = this.createManagedBean(
            new SetValueModel(
                csrmValuesExtractor,
                caseFormat,
                createKey,
                isTreeDataOrGrouping,
                this.isKeyChecked.bind(this),
                {
                    handlerParams: params,
                    ...resolveKeyCreatorFlags(this.beans, params),
                }
            )
        );
        this.addManagedListeners(valueModel, {
            availableValuesChanged: params.onModelAsStringChange,
        });
        this.valueModel = valueModel;
        this.keyShape = this.getKeyShape();
        this.keyCaseSensitive = this.caseSensitive;

        this.validateModel();

        this.addEventListenersForDataChanges();
    }

    public refresh(params: FilterHandlerParams<any, any, SetFilterModel, ISetFilterParams<any, TValue>>): void {
        const valueModel = this.valueModel;
        const wasPreserving = valueModel.isPreserving();
        this.updateParams(params);
        // Before the values, whose reload may evict by what the model checks.
        this.appliedModel.update(params.model);
        const dropUnknownKeys = this.checkKeyRules(wasPreserving, !!params.filterParams.preservePreviousValues);
        const rekey = dropUnknownKeys !== undefined;
        const reloaded = valueModel.refresh(
            {
                handlerParams: params,
                ...resolveKeyCreatorFlags(this.beans, params),
            },
            rekey
        );

        if (rekey) {
            this.rekey(dropUnknownKeys, reloaded);
        } else {
            this.validateModel();
        }
    }

    /** How a tree list builds its path keys; the case rule only folds them. */
    private getKeyShape(): string {
        if (!this.isTreeDataOrGrouping()) {
            return '';
        }
        const groupColIds = this.groupingTreeList
            ? this.beans.rowGroupColsSvc!.columns.map((col) => col.getColId()).join()
            : '';
        return `${this.treeDataTreeList}${this.gos.get('groupAllowUnbalanced')}${groupColIds}`;
    }

    /**
     * Kept keys cannot be compared with keys made by other rules, or kept at all once the option is off.
     * Returns `undefined` when the kept keys stand, else whether model keys the next load lacks must go.
     */
    private checkKeyRules(wasPreserving: boolean, preserving: boolean): boolean | undefined {
        const keyShape = this.getKeyShape();
        // Provided values are keyed by the values alone, whatever the grouping.
        const reshaped = keyShape !== this.keyShape && this.isValuesTakenFromGrid();
        const refolded = this.caseSensitive !== this.keyCaseSensitive;
        this.keyShape = keyShape;
        this.keyCaseSensitive = this.caseSensitive;
        if (wasPreserving && !preserving) {
            this.clearMissing(false);
            return undefined;
        }
        if (!preserving || !(reshaped || refolded)) {
            return undefined;
        }
        // A refolded model key still names the same rows; a reshaped one names none.
        return reshaped;
    }

    /** Its own load replaces the kept keys, as validation queued on an earlier one may add stale keys back. */
    private rekey(dropUnknownKeys: boolean, reloaded: boolean): void {
        const valueModel = this.valueModel;
        const loaded = reloaded ? valueModel.allKeys : valueModel.refreshAll(true);
        loaded.then(() => {
            this.dispatchLocalEvent({ type: 'dataChanged' });
            this.keepModelKeys(undefined, dropUnknownKeys);
        });
    }

    /** A group column's tree list keys are paths over the grouping, which changes without a refresh. */
    private rekeyIfGroupingChanged(): boolean {
        const { colDef, filterParams } = this.params;
        if (!colDef.showRowGroup || !filterParams.treeList || !this.valueModel.isPreserving()) {
            return false;
        }
        this.updateParams(this.params);
        const dropUnknownKeys = this.checkKeyRules(true, true);
        if (dropUnknownKeys === undefined) {
            return false;
        }
        this.rekey(dropUnknownKeys, false);
        return true;
    }

    /** What eviction keeps: only model keys, so an inactive filter is bounded too. */
    private isKeyChecked(key: string | null): boolean {
        return this.appliedModel.has(key);
    }

    private updateParams(params: FilterHandlerParams<any, any, SetFilterModel, ISetFilterParams<any, TValue>>): void {
        this.params = params;
        const {
            colDef,
            filterParams: { caseSensitive, treeList, keyCreator, valueFormatter },
        } = params;
        this.caseSensitive = !!caseSensitive;
        const isGroupCol = !!colDef.showRowGroup;
        this.treeDataTreeList = this.gos.get('treeData') && !!treeList && isGroupCol;
        this.groupingTreeList = !!this.beans.rowGroupColsSvc?.columns.length && !!treeList && isGroupCol;
        const resolvedKeyCreator = keyCreator ?? colDef.keyCreator;
        this.createKey = this.generateCreateKey(resolvedKeyCreator, this.isTreeDataOrGrouping());
        this.setValueFormatter(valueFormatter, resolvedKeyCreator, !!treeList, !!colDef.refData);
    }

    public doesFilterPass(params: DoesFilterPassParams<any, SetFilterModel>): boolean {
        const appliedModel = this.appliedModel;
        if (appliedModel.isNull()) {
            return true;
        }

        // optimisation - if nothing selected, don't need to check value
        if (appliedModel.isEmpty()) {
            return false;
        }

        return this.matchesKeys(params.node, appliedModel) ?? false;
    }

    /**
     * The pass test for a selection this filter did not make, folded and matched by its own rules.
     * `undefined` is a node with no key to test, which a negating caller must not invert into a pass.
     */
    public createKeysMatcher(keys: SetFilterModelValue): (node: IRowNode) => boolean | undefined {
        const model = new SetFilterAppliedModel(this.caseFormat.bind(this));
        // The fold is part of the model's state: `update` applies it to the keys once, where `has` applies
        // it to each row's key live. A definition change flipping the rule leaves the two disagreeing, and
        // the caller cannot re-make the matcher: it is compiled into an expression it does not own.
        let foldedCaseSensitive = this.caseSensitive;
        model.update({ filterType: 'set', values: keys });
        return (node) => {
            if (foldedCaseSensitive !== this.caseSensitive) {
                foldedCaseSensitive = this.caseSensitive;
                model.update({ filterType: 'set', values: keys });
            }
            return this.matchesKeys(node, model);
        };
    }

    private matchesKeys(node: IRowNode, model: SetFilterAppliedModel): boolean | undefined {
        if (this.treeDataTreeList) {
            return this.doesFilterPassForTreeData(node, model);
        }
        if (this.groupingTreeList) {
            return this.doesFilterPassForGrouping(node, model);
        }

        const value = this.params.getValue(node);

        if (value != null && Array.isArray(value)) {
            if (value.length === 0) {
                return model.has(null);
            }
            return value.some((v) => model.has(this.createKey(v, node)));
        }

        return model.has(this.createKey(value, node));
    }

    /**
     * The display-value tree every key falls under, by root tree key, for a tree list column: without one
     * there is no path getter and every value flattens to `String(value)` with a warning. Built fresh rather
     * than shared with the UI's own model, whose contents track what the list is currently showing.
     */
    public createDisplayValueTree(keys: SetFilterModelValue): Map<string | null, SetFilterModelTreeItem> {
        const filterParams = this.params.filterParams;
        const model = new TreeSetDisplayValueModel<any>(
            this.beans.log,
            _bindFilterCallback(filterParams.textFormatter, this.beans.gos, this.params.column, 'columnFilter') ??
                unformattedSetFilterText,
            filterParams.treeListPathGetter,
            filterParams.treeListFormatter,
            this.isTreeDataOrGrouping(),
            (key) => this.valueModel.keyOnlyKeys.has(key)
        );
        model.updateDisplayedValuesToAllAvailable(
            (key) => this.valueModel.getValueForFormatter(key),
            keys,
            new Set(keys),
            'reload'
        );
        return model.getSelectAllItem().children!;
    }

    public getFormattedValue(key: string | null): string {
        const valueModel = this.valueModel;
        if (valueModel.keyOnlyKeys.has(key)) {
            return key ?? translateForSetFilter(this, 'blanks');
        }
        let value: TValue | string | null = valueModel.getValueForFormatter(key);
        if (this.noValueFormatterSupplied && this.isTreeDataOrGrouping() && Array.isArray(value)) {
            // essentially get back the cell value
            value = _last(value) as string;
        }

        const formattedValue = setFilterFormattedValue(
            this.beans,
            this.params.column as AgColumn,
            value,
            this.valueFormatter
        );

        return (
            (formattedValue == null ? _toStringOrNull(value) : formattedValue) ?? translateForSetFilter(this, 'blanks')
        );
    }

    public getModelAsString(model: SetFilterModel | null, source?: 'floating' | 'filterToolPanel'): string {
        const { values } = model ?? {};

        const forToolPanel = source === 'filterToolPanel';

        if (values == null) {
            return forToolPanel ? translateForSetFilter(this, 'filterSummaryListInactive') : '';
        }

        const displayedKeys = this.valueModel.getDisplayableKeys(values);
        const numValues = displayedKeys.length;

        const numToDisplay = forToolPanel ? 3 : 10;

        const formattedValues = displayedKeys.slice(0, numToDisplay).map((key) => this.getFormattedValue(key));

        if (forToolPanel) {
            const valueList = formattedValues.join(translateForSetFilter(this, 'filterSummaryListSeparator'));
            if (numValues > 3) {
                return translateForSetFilter(this, 'filterSummaryListLong', [valueList, String(numValues - 3)]);
            } else {
                return translateForSetFilter(this, 'filterSummaryListShort', [valueList]);
            }
        }

        return `(${numValues}) ${formattedValues.join(',')}${numValues > 10 ? ',...' : ''}`;
    }

    public onAnyFilterChanged(): void {
        // don't block the current action when updating the values for this filter
        window.setTimeout(() => {
            if (!this.isAlive()) {
                return;
            }
            this.valueModel.refreshAvailable().then((updated) => {
                this.dispatchLocalEvent({ type: 'anyFilterChanged', updated: !!updated });
            });
        });
    }

    public onNewRowsLoaded(): void {
        // Tree Data toggling reloads the rows before its property event, so the rekey has to happen here.
        if (!this.rekeyIfGroupingChanged()) {
            this.syncAfterDataChange();
        }
    }

    public setFilterValues(values: (TValue | null)[]): void {
        this.valueModel.overrideValues(values).then(() => {
            this.refreshFilterValues();
        });
    }

    public resetFilterValues(): void {
        this.valueModel.valuesType = SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES;
        this.syncAfterDataChange();
    }

    /**
     * @param suppressAvailableValuesCheck when refreshing values via the API, the model will be reset if all available values are selected.
     * When refreshing due to internal changes, set this to `true` to do the reset check based on all values instead.
     */
    public refreshFilterValues(suppressAvailableValuesCheck?: boolean): void {
        // the model is still being initialised
        if (!this.valueModel.isInitialised()) {
            return;
        }
        this.valueModel.refreshAll().then(() => {
            this.dispatchLocalEvent({ type: 'dataChanged', hardRefresh: true });
            this.validateModel(undefined, !suppressAvailableValuesCheck);
        });
    }

    public clearPreservedValues(onlyUnselected = false): void {
        this.clearMissing(onlyUnselected).then(() => {
            if (!onlyUnselected) {
                this.reconcileModel();
            }
        });
    }

    private clearMissing(onlyUnselected: boolean): AgPromise<unknown> {
        const valueModel = this.valueModel;
        const missingCount = valueModel.missingKeys.size;
        const cleared = valueModel.clearMissing(onlyUnselected);
        if (valueModel.missingKeys.size === missingCount) {
            return cleared;
        }
        return cleared.then(() => this.dispatchLocalEvent({ type: 'dataChanged', hardRefresh: true }));
    }

    public getFilterKeys(): SetFilterModelValue {
        return Array.from(this.valueModel.allValues.keys());
    }

    public getFilterValues(): (TValue | null)[] {
        return Array.from(this.valueModel.allValues.values());
    }

    public isTreeDataOrGrouping(): boolean {
        return this.treeDataTreeList || this.groupingTreeList;
    }

    public caseFormat<T extends string | number | null>(valueToFormat: T): T {
        if (valueToFormat == null || typeof valueToFormat !== 'string') {
            return valueToFormat;
        }
        return this.caseSensitive ? valueToFormat : (valueToFormat.toUpperCase() as T);
    }

    private addEventListenersForDataChanges(): void {
        this.addManagedPropertyListeners(['groupAllowUnbalanced'], () => {
            if (!this.rekeyIfGroupingChanged()) {
                this.syncAfterDataChange();
            }
        });

        const syncAfterDataChangeDebounced = _debounce(this, this.syncAfterDataChange.bind(this), 0);
        this.addManagedEventListeners({
            columnRowGroupChanged: () => {
                this.rekeyIfGroupingChanged();
            },
            cellValueChanged: (event) => {
                // only interested in changes to do with this column
                if (event.column === this.params.column) {
                    syncAfterDataChangeDebounced();
                }
            },
            // cellDataType inference resolves the value type and populates the grid values only once real data
            // arrives. Rebuild the value model then so the selection re-keys against the inferred type.
            dataTypesInferred: () => syncAfterDataChangeDebounced(),
        });
    }

    private syncAfterDataChange(): void {
        if (!this.isValuesTakenFromGrid()) {
            return;
        }

        this.valueModel.refreshAll().then(() => {
            this.dispatchLocalEvent({ type: 'dataChanged' });
            this.validateModel({ afterDataChange: true });
        });
    }

    /** Reads the params once the values load, as a refresh in the meantime supersedes the model. */
    private validateModel(additionalEventAttributes?: any, restrictToAvailableValues?: boolean): void {
        const valueModel = this.valueModel;
        valueModel.allKeys.then(() => {
            if (valueModel.isPreserving()) {
                this.keepModelKeys(additionalEventAttributes);
            } else {
                this.reconcileModel(additionalEventAttributes, restrictToAvailableValues);
            }
        });
    }

    /** Narrows the model to the keys the values hold, clearing it once it selects them all. */
    private reconcileModel(additionalEventAttributes?: any, restrictToAvailableValues?: boolean): void {
        const params = this.params;
        const model = params.model;
        if (model == null) {
            return;
        }
        const valueModel = this.valueModel;
        const existingFormattedKeys: Map<string | null, string | null> = new Map();
        const addKey = (key: string | null) => existingFormattedKeys.set(this.caseFormat(key), key);
        if (restrictToAvailableValues) {
            for (const key of valueModel.availableKeys) {
                addKey(key);
            }
        } else {
            valueModel.allValues.forEach((_value, key) => addKey(key));
        }
        // No grid values yet means they are not known (cellDataType inference pending), not that all are selected:
        // keep the model until they arrive and are reconciled then.
        const takenFromGrid = valueModel.valuesType === SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES;
        if (takenFromGrid && existingFormattedKeys.size === 0 && model.values.length > 0) {
            return;
        }
        const newValues: SetFilterModelValue = [];
        let updated = false;
        for (const unformattedKey of model.values) {
            const formattedKey = this.caseFormat(setFilterNullIfBlank(unformattedKey));
            const existingUnformattedKey = existingFormattedKeys.get(formattedKey);
            if (existingUnformattedKey !== undefined) {
                newValues.push(existingUnformattedKey);
                if (existingUnformattedKey !== unformattedKey) {
                    updated = true;
                }
            } else {
                updated = true;
            }
        }
        const numNewValues = newValues.length;
        const filterParams = params.filterParams;
        if (numNewValues === 0 && filterParams.excelMode) {
            params.onModelChange(null, additionalEventAttributes);
            return;
        }
        const clearOnAllSelected =
            !filterParams.defaultToNothingSelected &&
            (takenFromGrid || !filterParams.suppressClearModelOnRefreshValues);
        const allSelected = clearOnAllSelected && numNewValues === existingFormattedKeys.size;

        if (updated || !model.filterType || allSelected) {
            // if all values selected, remove model
            const newModel = allSelected ? null : { filterType: this.filterType, values: newValues };
            params.onModelChange(newModel, additionalEventAttributes);
        }
    }

    /** A preserved model is only folded to the kept keys' case; a key they lack joins them, or is dropped. */
    private keepModelKeys(additionalEventAttributes?: any, dropUnknownKeys?: boolean): void {
        const params = this.params;
        const model = params.model;
        if (model == null) {
            return;
        }
        const valueModel = this.valueModel;
        // By formatted key, so keys folding into one are kept once.
        const keptKeys = new Map<string | null, string | null>();
        let newKeys: SetFilterModelValue | undefined;
        let updated = false;
        const modelValues = model.values;
        for (let i = 0, len = modelValues.length; i < len; ++i) {
            const unformattedKey = modelValues[i];
            const key = setFilterNullIfBlank(unformattedKey);
            const formattedKey = this.caseFormat(key);
            if (keptKeys.has(formattedKey)) {
                updated = true;
                continue;
            }
            let existingKey = valueModel.findKey(key);
            if (existingKey === undefined) {
                if (dropUnknownKeys) {
                    updated = true;
                    continue;
                }
                existingKey = key;
                newKeys ??= [];
                newKeys.push(key);
            }
            keptKeys.set(formattedKey, existingKey);
            updated = updated || existingKey !== unformattedKey;
        }
        const newValues = Array.from(keptKeys.values());
        if (newKeys) {
            valueModel.addKeyOnlyKeys(newKeys);
            this.dispatchLocalEvent({ type: 'dataChanged' });
        }
        if (newValues.length === 0 && params.filterParams.excelMode) {
            params.onModelChange(null, additionalEventAttributes);
        } else if (updated || !model.filterType) {
            params.onModelChange({ filterType: this.filterType, values: newValues }, additionalEventAttributes);
        }
    }

    private isValuesTakenFromGrid(): boolean {
        return this.valueModel.valuesType === SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES;
    }

    private doesFilterPassForTreeData(node: IRowNode, model: SetFilterAppliedModel): boolean | undefined {
        if (node.childrenAfterGroup?.length) {
            // only perform checking on leaves. The core filtering logic for tree data won't work properly otherwise
            return undefined;
        }
        return model.has(
            this.createKey(
                processDataPath(
                    (node as RowNode).getRoute() ?? [node.key ?? node.id!],
                    true,
                    this.gos.get('groupAllowUnbalanced')
                ) as any
            ) as any
        );
    }

    private doesFilterPassForGrouping(node: IRowNode, model: SetFilterAppliedModel): boolean {
        const {
            params,
            gos,
            beans: { rowGroupColsSvc, valueSvc },
        } = this;
        const dataPath = (rowGroupColsSvc?.columns ?? []).map((groupCol) => valueSvc.getKeyForNode(groupCol, node));
        dataPath.push(params.getValue(node));
        return model.has(
            this.createKey(processDataPath(dataPath, false, gos.get('groupAllowUnbalanced')) as any) as any
        );
    }

    private generateCreateKey(
        keyCreator: ((params: KeyCreatorParams<any, any>) => string) | undefined,
        treeDataOrGrouping: boolean
    ): (value: TValue | null | undefined, node?: IRowNode | null) => string | null {
        if (treeDataOrGrouping && !keyCreator) {
            this.error(250);
            return () => null;
        }
        if (keyCreator) {
            return (value, node = null) => {
                const params = this.getKeyCreatorParams(value, node);
                return setFilterNullIfBlank(keyCreator(params));
            };
        }
        return (value) => setFilterNullIfBlank(_toStringOrNull(value));
    }

    private getKeyCreatorParams(value: TValue | null | undefined, node: IRowNode | null = null): KeyCreatorParams {
        const { colDef, column } = this.params;
        return _addGridCommonParams(this.gos, {
            value,
            colDef,
            column,
            node,
            data: node?.data,
        });
    }

    private setValueFormatter(
        providedValueFormatter: ((params: ValueFormatterParams) => string) | undefined,
        keyCreator: ((params: KeyCreatorParams<any, any>) => string) | undefined,
        treeList: boolean,
        isRefData: boolean
    ) {
        let valueFormatter = providedValueFormatter;
        if (!valueFormatter) {
            if (keyCreator && !treeList) {
                this.error(249);
                return;
            }
            this.noValueFormatterSupplied = true;
            // Naming the blank here, not at render time, is what keeps a supplied formatter able to override it.
            valueFormatter = (params) => {
                const value = params.value;
                if (_isBlank(value)) {
                    return translateForSetFilter(this, 'blanks');
                }
                // ref data is handled by ValueService
                return isRefData
                    ? this.beans.valueSvc.formatValue(params.column as AgColumn, null, value, undefined, false)!
                    : _toStringOrNull(value)!;
            };
        }
        this.valueFormatter = valueFormatter;
    }

    public getCrossFilterModel(
        callback: (
            createKey: (value: TValue | null | undefined) => string | null,
            availableKeys: Set<string | null>,
            existingValues: SetFilterModelValue | undefined
        ) => SetFilterModel
    ): SetFilterModel {
        const { createKey, valueModel, params } = this;
        return callback(createKey, valueModel.displayableKeys, params.model?.values);
    }

    public override destroy(): void {
        this.appliedModel.destroy();
        super.destroy();
        (this.valueModel as any) = undefined;
    }
}
