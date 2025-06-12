import type {
    AgColumn,
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
    GROUP_AUTO_COLUMN_ID,
    _addGridCommonParams,
    _debounce,
    _error,
    _isClientSideRowModel,
    _last,
    _makeNull,
    _toStringOrNull,
} from 'ag-grid-community';

import { ClientSideValuesExtractor } from './clientSideValueExtractor';
import { SetFilterAppliedModel } from './setFilterAppliedModel';
import { processDataPath, translateForSetFilter } from './setFilterUtils';
import SetFilterModelValuesType, { SetValueModel } from './setValueModel';

export type SetFilterHandlerEventType = 'anyFilterChanged' | 'dataChanged' | 'destroyed';

export class SetFilterHandler<TValue = string>
    extends BeanStub<SetFilterHandlerEventType>
    implements FilterHandler<any, any, SetFilterModel, ISetFilterParams<any, TValue>>, ISetFilterHandler<TValue>
{
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
        const clientSideValuesExtractor = _isClientSideRowModel(gos, beans.rowModel)
            ? this.createManagedBean(
                  new ClientSideValuesExtractor<TValue>(
                      createKey,
                      caseFormat,
                      params.getValue,
                      isTreeDataOrGrouping,
                      isTreeData
                  )
              )
            : undefined;
        this.valueModel = this.createManagedBean(
            new SetValueModel(clientSideValuesExtractor, caseFormat, createKey, isTreeDataOrGrouping, {
                handlerParams: params,
                usingComplexObjects: !!(params.filterParams.keyCreator ?? params.colDef.keyCreator),
            })
        );

        this.appliedModel = new SetFilterAppliedModel(this.caseFormat.bind(this));

        this.appliedModel.update(params.model);

        this.validateModel(params);

        this.addEventListenersForDataChanges();
    }

    public refresh(params: FilterHandlerParams<any, any, SetFilterModel, ISetFilterParams<any, TValue>>): void {
        this.updateParams(params);
        this.valueModel.refresh({
            handlerParams: params,
            usingComplexObjects: !!(params.filterParams.keyCreator ?? params.colDef.keyCreator),
        });

        this.appliedModel.update(params.model);

        this.validateModel(params);
    }

    private updateParams(params: FilterHandlerParams<any, any, SetFilterModel, ISetFilterParams<any, TValue>>): void {
        this.params = params;
        const {
            column,
            colDef,
            filterParams: { caseSensitive, treeList, keyCreator, valueFormatter },
        } = params;
        this.caseSensitive = !!caseSensitive;
        const isGroupCol = column.getId().startsWith(GROUP_AUTO_COLUMN_ID);
        this.treeDataTreeList = this.gos.get('treeData') && !!treeList && isGroupCol;
        this.groupingTreeList = !!this.beans.rowGroupColsSvc?.columns.length && !!treeList && isGroupCol;
        const resolvedKeyCreator = keyCreator ?? colDef.keyCreator;
        this.createKey = this.generateCreateKey(resolvedKeyCreator, this.isTreeDataOrGrouping());
        this.setValueFormatter(valueFormatter, resolvedKeyCreator, !!treeList, !!colDef.refData);
    }

    public doesFilterPass(params: DoesFilterPassParams<any, SetFilterModel>): boolean {
        const { appliedModel, treeDataTreeList, groupingTreeList } = this;
        if (appliedModel.isNull()) {
            return true;
        }

        // optimisation - if nothing selected, don't need to check value
        if (appliedModel.isEmpty()) {
            return false;
        }

        const { node } = params;
        if (treeDataTreeList) {
            return this.doesFilterPassForTreeData(node);
        }
        if (groupingTreeList) {
            return this.doesFilterPassForGrouping(node);
        }

        const value = this.params.getValue(node);

        if (value != null && Array.isArray(value)) {
            if (value.length === 0) {
                return appliedModel.has(null);
            }
            return value.some((v) => appliedModel.has(this.createKey(v, node)));
        }

        return appliedModel.has(this.createKey(value, node));
    }

    private getFormattedValue(key: string | null): string | null {
        let value: TValue | string | null = this.valueModel.getValueForFormatter(key)!;
        if (this.noValueFormatterSupplied && this.isTreeDataOrGrouping() && Array.isArray(value)) {
            // essentially get back the cell value
            value = _last(value) as string;
        }

        const formattedValue = this.beans.valueSvc.formatValue(
            this.params.column as AgColumn,
            null,
            value,
            this.valueFormatter,
            false
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

    public refreshFilterValues(): void {
        // the model is still being initialised
        if (!this.valueModel.isInitialised()) {
            return;
        }
        this.valueModel.refreshAll().then(() => {
            this.dispatchLocalEvent({ type: 'dataChanged', hardRefresh: true });
            this.validateModel(this.params, undefined, true);
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
            const newValues: SetFilterModelValue = [];
            let updated = false;
            for (const unformattedKey of model.values) {
                const formattedKey = this.caseFormat(_makeNull(unformattedKey));
                const existingUnformattedKey = existingFormattedKeys.get(formattedKey);
                if (existingUnformattedKey !== undefined) {
                    newValues.push(existingUnformattedKey);
                } else {
                    updated = true;
                }
            }
            const numNewValues = newValues.length;
            if (numNewValues === 0 && params.filterParams.excelMode) {
                params.onModelChange(null, additionalEventAttributes);
                return;
            }
            if (updated) {
                // if all values selected, remove model
                const newModel = numNewValues === existingFormattedKeys.size ? null : { ...model, values: newValues };
                params.onModelChange(newModel, additionalEventAttributes);
                return;
            }
        });
    }

    private isValuesTakenFromGrid(): boolean {
        return this.valueModel.valuesType === SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES;
    }

    private doesFilterPassForTreeData(node: IRowNode): boolean {
        if (node.childrenAfterGroup?.length) {
            // only perform checking on leaves. The core filtering logic for tree data won't work properly otherwise
            return false;
        }
        const { gos, appliedModel } = this;
        return appliedModel.has(
            this.createKey(
                processDataPath(
                    (node as RowNode).getRoute() ?? [node.key ?? node.id!],
                    true,
                    gos.get('groupAllowUnbalanced')
                ) as any
            ) as any
        );
    }

    private doesFilterPassForGrouping(node: IRowNode): boolean {
        const {
            appliedModel,
            params,
            gos,
            beans: { rowGroupColsSvc, valueSvc },
        } = this;
        const dataPath = (rowGroupColsSvc?.columns ?? []).map((groupCol) => valueSvc.getKeyForNode(groupCol, node));
        dataPath.push(params.getValue(node));
        return appliedModel.has(
            this.createKey(processDataPath(dataPath, false, gos.get('groupAllowUnbalanced')) as any) as any
        );
    }

    private generateCreateKey(
        keyCreator: ((params: KeyCreatorParams<any, any>) => string) | undefined,
        treeDataOrGrouping: boolean
    ): (value: TValue | null | undefined, node?: IRowNode | null) => string | null {
        if (treeDataOrGrouping && !keyCreator) {
            _error(250);
            return () => null;
        }
        if (keyCreator) {
            return (value, node = null) => {
                const params = this.getKeyCreatorParams(value, node);
                return _makeNull(keyCreator!(params));
            };
        }
        return (value) => _makeNull(_toStringOrNull(value));
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
                _error(249);
                return;
            }
            this.noValueFormatterSupplied = true;
            // ref data is handled by ValueService
            if (!isRefData) {
                valueFormatter = (params) => _toStringOrNull(params.value)!;
            }
        }
        this.valueFormatter = valueFormatter;
    }

    public override destroy(): void {
        this.appliedModel.destroy();
        super.destroy();
        (this.valueModel as any) = undefined;
    }
}
