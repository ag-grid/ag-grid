import type {
    AgColumn,
    FilterEvaluator,
    FilterEvaluatorFuncParams,
    FilterEvaluatorParams,
    IRowNode,
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
    _error,
    _isClientSideRowModel,
    _last,
    _makeNull,
    _toStringOrNull,
} from 'ag-grid-community';

import { ClientSideValuesExtractor } from './clientSideValueExtractor';
import SetFilterModelValuesType, { SetFilterAllValues } from './setFilterAllValues';
import { SetFilterAppliedModel } from './setFilterAppliedModel';
import { processDataPath, translateForSetFilter } from './setFilterUtils';
import type { SetValueModelParams } from './setValueModel';

export type SetFilterEvaluatorEventType = 'anyFilterChanged' | 'dataChanged' | 'destroyed';

export class SetFilterEvaluator<TValue = string>
    extends BeanStub<SetFilterEvaluatorEventType>
    implements FilterEvaluator<any, any, TValue, SetFilterModel, ISetFilterParams<any, TValue>>
{
    private params: FilterEvaluatorParams<any, any, TValue, SetFilterModel> & ISetFilterParams<any, TValue>;
    /**
     * Here we keep track of the keys that are currently being used for filtering.
     * In most cases, the filtering keys are the same as the selected keys,
     * but for the specific case when excelMode = 'windows' and the user has ticked 'Add current selection to filter',
     * the filtering keys can be different from the selected keys.
     */
    private appliedModel: SetFilterAppliedModel;
    public allValues: SetFilterAllValues<TValue>;
    private createKey: (value: TValue | null | undefined, node?: IRowNode | null) => string | null;
    private treeDataTreeList = false;
    private groupingTreeList = false;
    private caseSensitive: boolean = false;
    public valueFormatter?: (params: ValueFormatterParams) => string;
    private noValueFormatterSupplied = false;

    public init(params: FilterEvaluatorParams<any, any, TValue, SetFilterModel> & ISetFilterParams<any, TValue>): void {
        this.updateParams(params);
        const isTreeDataOrGrouping = () => this.treeDataTreeList || this.groupingTreeList;
        const isTreeData = () => this.treeDataTreeList;
        const createKey = (value: TValue | null | undefined, node?: IRowNode | null) => this.createKey(value, node);
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
        this.allValues = this.createManagedBean(
            new SetFilterAllValues(clientSideValuesExtractor, caseFormat, createKey, isTreeDataOrGrouping, {
                filterParams: params,
                usingComplexObjects: !!(params.keyCreator ?? params.colDef.keyCreator),
            })
        );

        this.appliedModel = new SetFilterAppliedModel(this.caseFormat.bind(this));

        this.appliedModel.update(params.model);

        this.validateModel(params);

        this.addEventListenersForDataChanges();
    }

    public refresh(
        params: FilterEvaluatorParams<any, any, TValue, SetFilterModel> & ISetFilterParams<any, TValue>
    ): void {
        this.updateParams(params);
        this.allValues.refresh({
            filterParams: params,
            usingComplexObjects: !!(params.keyCreator ?? params.colDef.keyCreator),
        });

        this.appliedModel.update(params.model);

        this.validateModel(params);
    }

    private updateParams(
        params: FilterEvaluatorParams<any, any, TValue, SetFilterModel> & ISetFilterParams<any, TValue>
    ): void {
        this.params = params;
        const { caseSensitive, treeList, column, colDef, keyCreator, valueFormatter } = params;
        this.caseSensitive = !!caseSensitive;
        const isGroupCol = column.getId().startsWith(GROUP_AUTO_COLUMN_ID);
        this.treeDataTreeList = this.gos.get('treeData') && !!treeList && isGroupCol;
        this.groupingTreeList = !!this.beans.rowGroupColsSvc?.columns.length && !!treeList && isGroupCol;
        const resolvedKeyCreator = keyCreator ?? colDef.keyCreator;
        this.createKey = this.generateCreateKey(resolvedKeyCreator, this.treeDataTreeList || this.groupingTreeList);
        this.setValueFormatter(valueFormatter, resolvedKeyCreator, !!treeList, !!colDef.refData);
    }

    public doesFilterPass(params: FilterEvaluatorFuncParams<any, SetFilterModel>): boolean {
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
        let value: TValue | string | null = this.allValues.getValueForFormatter(key)!;
        if (this.noValueFormatterSupplied && (this.treeDataTreeList || this.groupingTreeList) && Array.isArray(value)) {
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

    public getModelAsString(model: SetFilterModel | null): string {
        const { values } = model ?? {};

        if (values == null) {
            return '';
        }

        const availableKeys = this.allValues.getAvailableKeys(values);
        const numValues = availableKeys.length;

        const formattedValues = availableKeys.slice(0, 10).map((key) => this.getFormattedValue(key));

        return `(${numValues}) ${formattedValues.join(',')}${numValues > 10 ? ',...' : ''}`;
    }

    public getSetValueModelParams(): SetValueModelParams<TValue> {
        return {
            filterParams: this.params,
            translate: (key) => translateForSetFilter(this, key),
            caseFormat: (v) => this.caseFormat(v),
            getValueFormatter: () => this.valueFormatter,
            treeDataTreeList: this.treeDataTreeList,
            groupingTreeList: this.groupingTreeList,
            allValues: this.allValues,
        };
    }

    public onAnyFilterChanged(): void {
        // don't block the current action when updating the values for this filter
        window.setTimeout(() => {
            if (!this.isAlive()) {
                return;
            }
            this.allValues.refreshAvailable().then((updated) => {
                this.dispatchLocalEvent({ type: 'anyFilterChanged', updated: !!updated });
            });
        });
    }

    public onNewRowsLoaded(): void {
        this.syncAfterDataChange();
    }

    public resetValues(): void {
        this.allValues.valuesType = SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES;
        this.syncAfterDataChange();
    }

    private addEventListenersForDataChanges(): void {
        this.addManagedPropertyListeners(['groupAllowUnbalanced'], () => this.syncAfterDataChange());

        this.addManagedEventListeners({
            cellValueChanged: (event) => {
                // only interested in changes to do with this column
                if (event.column === this.params.column) {
                    this.syncAfterDataChange();
                }
            },
        });
    }

    private syncAfterDataChange(): void {
        if (!this.isValuesTakenFromGrid()) {
            return;
        }

        this.allValues.refreshAll().then(() => {
            this.dispatchLocalEvent({ type: 'dataChanged' });
            this.validateModel(this.params, { afterDataChange: true });
        });
    }

    private validateModel(
        params: FilterEvaluatorParams<any, any, TValue, SetFilterModel> & ISetFilterParams<any, TValue>,
        additionalEventAttributes?: any
    ): void {
        const allValues = this.allValues;

        allValues.allValuesPromise.then(() => {
            const model = params.model;
            if (model == null) {
                return;
            }
            const existingFormattedKeys: Map<string | null, string | null> = new Map();
            allValues.allValues.forEach((_value, key) => {
                existingFormattedKeys.set(this.caseFormat(key), key);
            });
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
            if (newValues.length === 0 && params.excelMode) {
                params.onModelChange(null, additionalEventAttributes);
                return;
            }
            if (updated) {
                params.onModelChange({ ...model, values: newValues }, additionalEventAttributes);
                return;
            }
        });
    }

    private isValuesTakenFromGrid(): boolean {
        return this.allValues.valuesType === SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES;
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

    private caseFormat<T extends string | number | null>(valueToFormat: T): typeof valueToFormat {
        if (valueToFormat == null || typeof valueToFormat !== 'string') {
            return valueToFormat;
        }
        return this.caseSensitive ? valueToFormat : (valueToFormat.toUpperCase() as T);
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
        return this.gos.addGridCommonParams({
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
    }
}
