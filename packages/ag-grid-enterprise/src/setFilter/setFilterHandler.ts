import { _debounce, _last, _toStringOrNull } from 'ag-stack';

import type {
    AgColumn,
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
import { BeanStub, _addGridCommonParams, _isBlank, _isClientSideRowModel } from 'ag-grid-community';

import { CsrmValuesExtractor } from './csrmValueExtractor';
import type { SetFilterModelTreeItem } from './iSetDisplayValueModel';
import { SetFilterAppliedModel } from './setFilterAppliedModel';
import {
    processDataPath,
    setFilterFormattedValue,
    setFilterNullIfBlank,
    translateForSetFilter,
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
    public valueFormatter?: (params: ValueFormatterParams) => string;
    private noValueFormatterSupplied = false;

    public init(params: FilterHandlerParams<any, any, SetFilterModel, ISetFilterParams<any, TValue>>): void {
        this.updateParams(params);
        const isTreeDataOrGrouping = this.isTreeDataOrGrouping.bind(this);
        const isTreeData = () => this.treeDataTreeList;
        const createKey = this.createKey;
        const caseFormat = this.caseFormat.bind(this);
        const { gos, beans } = this;
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
            new SetValueModel(csrmValuesExtractor, caseFormat, createKey, isTreeDataOrGrouping, {
                handlerParams: params,
                ...resolveKeyCreatorFlags(this.beans, params),
            })
        );
        this.addManagedListeners(valueModel, {
            availableValuesChanged: params.onModelAsStringChange,
        });
        this.valueModel = valueModel;

        this.appliedModel = new SetFilterAppliedModel(this.caseFormat.bind(this));

        this.appliedModel.update(params.model);

        this.validateModel(params);

        this.addEventListenersForDataChanges();
    }

    public refresh(params: FilterHandlerParams<any, any, SetFilterModel, ISetFilterParams<any, TValue>>): void {
        this.updateParams(params);
        this.valueModel.refresh({
            handlerParams: params,
            ...resolveKeyCreatorFlags(this.beans, params),
        });

        this.appliedModel.update(params.model);

        this.validateModel(params);
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
            filterParams.textFormatter ?? ((value) => value ?? null),
            filterParams.treeListPathGetter,
            filterParams.treeListFormatter,
            this.isTreeDataOrGrouping()
        );
        model.updateDisplayedValuesToAllAvailable(
            (key) => this.valueModel.getValueForFormatter(key),
            keys,
            new Set(keys),
            'reload'
        );
        return model.getSelectAllItem().children!;
    }

    public getFormattedValue(key: string | null): string | null {
        let value: TValue | string | null = this.valueModel.getValueForFormatter(key);
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

        const availableKeys = this.valueModel.getAvailableKeys(values);
        const numValues = availableKeys.length;

        const numToDisplay = forToolPanel ? 3 : 10;

        const formattedValues = availableKeys.slice(0, numToDisplay).map((key) => this.getFormattedValue(key));

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
        this.syncAfterDataChange();
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
            this.validateModel(this.params, undefined, !suppressAvailableValuesCheck);
        });
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
        this.addManagedPropertyListeners(['groupAllowUnbalanced'], () => this.syncAfterDataChange());

        const syncAfterDataChangeDebounced = _debounce(this, this.syncAfterDataChange.bind(this), 0);
        this.addManagedEventListeners({
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
            this.validateModel(this.params, { afterDataChange: true });
        });
    }

    private validateModel(
        params: FilterHandlerParams<any, any, SetFilterModel, ISetFilterParams<any, TValue>>,
        additionalEventAttributes?: any,
        restrictToAvailableValues?: boolean
    ): void {
        const valueModel = this.valueModel;

        valueModel.allKeys.then(() => {
            const model = params.model;
            if (model == null) {
                return;
            }
            const existingFormattedKeys: Map<string | null, string | null> = new Map();
            const addKey = (key: string | null) => existingFormattedKeys.set(this.caseFormat(key), key);
            if (restrictToAvailableValues) {
                for (const key of valueModel.availableKeys) {
                    addKey(key);
                }
            } else {
                valueModel.allValues.forEach((_value, key) => addKey(key));
            }
            // An empty grid-derived value set means the values are not yet known (e.g. the filter was
            // instantiated before cellDataType inference populated the rows), not that everything is selected.
            // Reconciling now would discard the applied criteria; leave the model untouched until real values
            // arrive and re-reconcile then (via cellValueChanged / dataTypesInferred / onNewRowsLoaded).
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
        });
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
        return callback(createKey, valueModel.availableKeys, params.model?.values);
    }

    public override destroy(): void {
        this.appliedModel.destroy();
        super.destroy();
        (this.valueModel as any) = undefined;
    }
}
