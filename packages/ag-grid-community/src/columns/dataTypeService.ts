import { KeyCode } from '../constants/keyCode';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { ColDef, SuppressKeyboardEventParams, ValueFormatterFunc, ValueFormatterParams } from '../entities/colDef';
import type {
    BaseCellDataType,
    CoreDataTypeDefinition,
    DataTypeDefinition,
    DataTypeFormatValueFunc,
    DateStringDataTypeDefinition,
    ValueFormatterLiteParams,
    ValueParserLiteParams,
} from '../entities/dataType';
import type { AgGridEvent, ColumnEventType } from '../events';
import type { GridOptionsService } from '../gridOptionsService';
import { _isClientSideRowModel } from '../gridOptionsUtils';
import type { IClientSideRowModel } from '../interfaces/iClientSideRowModel';
import type { ColumnEventName } from '../interfaces/iColumn';
import type { IEventListener } from '../interfaces/iEventEmitter';
import { _isValidDate, _isValidDateTime, _parseDateTimeFromString, _serialiseDate } from '../utils/date';
import { _toStringOrNull } from '../utils/generic';
import { _getValueUsingField } from '../utils/object';
import { _warn } from '../validation/logging';
import { _addColumnDefaultAndTypes } from './columnFactoryUtils';
import type { ColumnModel } from './columnModel';
import { _applyColumnState, getColumnStateFromColDef } from './columnStateUtils';
import type { ColumnState, ColumnStateParams } from './columnStateUtils';
import { convertColumnTypes } from './columnUtils';

interface GroupSafeValueFormatter {
    groupSafeValueFormatter?: ValueFormatterFunc;
}

type DataTypeDefinitions = {
    [cellDataType: BaseCellDataType | string]: (DataTypeDefinition | CoreDataTypeDefinition) & GroupSafeValueFormatter;
};
type CoreDataTypeDefMap = { [K in BaseCellDataType]: CoreDataTypeDefinition & { baseDataType: K } };

/**
 *  We are missing object and dateTime here.
 *  This is because dateTime has a lower priority than date and gives us no way to distinguish between the two, and
 *  object type is the default type for all other types.
 *
 *  dateTimeString has higher priority than dateString, since it includes serialized time and isValidDate() considers datetime a valid date.
 */
const SORTED_CELL_DATA_TYPES_FOR_MATCHING: readonly Exclude<BaseCellDataType, 'dateTime' | 'object'>[] = [
    'dateTimeString',
    'dateString',
    'text',
    'number',
    'boolean',
    'date',
] as const;

export class DataTypeService extends BeanStub implements NamedBean {
    beanName = 'dataTypeSvc' as const;

    private colModel: ColumnModel;

    public wireBeans(beans: BeanCollection): void {
        this.colModel = beans.colModel;
    }

    private dataTypeDefinitions: DataTypeDefinitions = {};
    private dataTypeMatchers: { [cellDataType: string]: ((value: any) => boolean) | undefined };
    private formatValueFuncs: { [cellDataType: string]: DataTypeFormatValueFunc };
    public isPendingInference: boolean = false;
    private hasObjectValueParser: boolean;
    private hasObjectValueFormatter: boolean;
    private initialData: any | null | undefined;
    private isColumnTypeOverrideInDataTypeDefinitions: boolean = false;
    // keep track of any column state updates whilst waiting for data types to be inferred
    private columnStateUpdatesPendingInference: { [colId: string]: Set<keyof ColumnStateParams> } = {};
    private columnStateUpdateListenerDestroyFuncs: (() => void)[] = [];

    public postConstruct(): void {
        this.processDataTypeDefinitions();

        this.addManagedPropertyListener('dataTypeDefinitions', (event) => {
            this.processDataTypeDefinitions();
            this.colModel.recreateColumnDefs(event);
        });
    }

    private processDataTypeDefinitions(): void {
        const defaultDataTypes = this.getDefaultDataTypes();
        const newDataTypeDefinitions: DataTypeDefinitions = {};
        const newFormatValueFuncs: { [cellDataType: string]: DataTypeFormatValueFunc } = {};
        const generateFormatValueFunc = (
            dataTypeDefinition: (DataTypeDefinition | CoreDataTypeDefinition) & GroupSafeValueFormatter
        ): DataTypeFormatValueFunc => {
            return (params) => {
                const { column, node, value } = params;
                let valueFormatter = column.getColDef().valueFormatter;
                if (valueFormatter === dataTypeDefinition.groupSafeValueFormatter) {
                    valueFormatter = dataTypeDefinition.valueFormatter;
                }
                return this.beans.valueSvc.formatValue(column as AgColumn, node, value, valueFormatter as any)!;
            };
        };

        for (const cellDataType of Object.keys(defaultDataTypes) as BaseCellDataType[]) {
            const defaultDataTypeDef = defaultDataTypes[cellDataType];
            const mergedDataTypeDefinition = {
                ...defaultDataTypeDef,
                groupSafeValueFormatter: createGroupSafeValueFormatter(defaultDataTypeDef, this.gos),
            };
            newDataTypeDefinitions[cellDataType] = mergedDataTypeDefinition;
            newFormatValueFuncs[cellDataType] = generateFormatValueFunc(mergedDataTypeDefinition);
        }

        const userDataTypeDefs = this.gos.get('dataTypeDefinitions') ?? {};
        const newDataTypeMatchers = {} as { [cellDataType in BaseCellDataType]: ((value: any) => boolean) | undefined };

        for (const cellDataType of Object.keys(userDataTypeDefs) as BaseCellDataType[]) {
            const userDataTypeDef = userDataTypeDefs[cellDataType];
            const mergedDataTypeDefinition = this.processDataTypeDefinition(
                userDataTypeDef,
                userDataTypeDefs,
                [cellDataType],
                defaultDataTypes
            );
            if (mergedDataTypeDefinition) {
                newDataTypeDefinitions[cellDataType] = mergedDataTypeDefinition;
                if (userDataTypeDef.dataTypeMatcher) {
                    newDataTypeMatchers[cellDataType] = userDataTypeDef.dataTypeMatcher;
                }
                newFormatValueFuncs[cellDataType] = generateFormatValueFunc(mergedDataTypeDefinition);
            }
        }
        const { valueParser: defaultValueParser, valueFormatter: defaultValueFormatter } = defaultDataTypes.object;
        const { valueParser: userValueParser, valueFormatter: userValueFormatter } = newDataTypeDefinitions.object;

        this.hasObjectValueParser = userValueParser !== defaultValueParser;
        this.hasObjectValueFormatter = userValueFormatter !== defaultValueFormatter;
        this.formatValueFuncs = newFormatValueFuncs;
        this.dataTypeDefinitions = newDataTypeDefinitions;
        this.dataTypeMatchers = this.sortKeysInMatchers(newDataTypeMatchers, defaultDataTypes);
    }

    /**
     * Sorts the keys in the matchers object.
     * Does not mutate the original object, creates a copy of it with sorted keys instead.
     */
    private sortKeysInMatchers(matchers: Record<string, any>, dataTypes: CoreDataTypeDefMap) {
        const sortedMatchers = { ...matchers };
        for (const cellDataType of SORTED_CELL_DATA_TYPES_FOR_MATCHING) {
            delete sortedMatchers[cellDataType];
            sortedMatchers[cellDataType] = matchers[cellDataType] ?? dataTypes[cellDataType].dataTypeMatcher;
        }
        return sortedMatchers;
    }

    private processDataTypeDefinition(
        userDataTypeDef: DataTypeDefinition,
        userDataTypeDefs: { [key: string]: DataTypeDefinition },
        alreadyProcessedDataTypes: string[],
        defaultDataTypes: CoreDataTypeDefMap
    ): (DataTypeDefinition & GroupSafeValueFormatter) | undefined {
        let mergedDataTypeDefinition: DataTypeDefinition;
        const extendsCellDataType = userDataTypeDef.extendsDataType;

        if (userDataTypeDef.columnTypes) {
            this.isColumnTypeOverrideInDataTypeDefinitions = true;
        }

        if (userDataTypeDef.extendsDataType === userDataTypeDef.baseDataType) {
            let baseDataTypeDefinition = defaultDataTypes[extendsCellDataType as BaseCellDataType];
            const overriddenBaseDataTypeDefinition = userDataTypeDefs[extendsCellDataType];
            if (baseDataTypeDefinition && overriddenBaseDataTypeDefinition) {
                // only if it's valid do we override with a provided one
                baseDataTypeDefinition = overriddenBaseDataTypeDefinition;
            }
            if (!validateDataTypeDefinition(userDataTypeDef, baseDataTypeDefinition, extendsCellDataType)) {
                return undefined;
            }
            mergedDataTypeDefinition = mergeDataTypeDefinitions(baseDataTypeDefinition, userDataTypeDef);
        } else {
            if (alreadyProcessedDataTypes.includes(extendsCellDataType)) {
                _warn(44);
                return undefined;
            }
            const extendedDataTypeDefinition = userDataTypeDefs[extendsCellDataType];
            if (!validateDataTypeDefinition(userDataTypeDef, extendedDataTypeDefinition, extendsCellDataType)) {
                return undefined;
            }
            const mergedExtendedDataTypeDefinition = this.processDataTypeDefinition(
                extendedDataTypeDefinition,
                userDataTypeDefs,
                [...alreadyProcessedDataTypes, extendsCellDataType],
                defaultDataTypes
            );
            if (!mergedExtendedDataTypeDefinition) {
                return undefined;
            }
            mergedDataTypeDefinition = mergeDataTypeDefinitions(mergedExtendedDataTypeDefinition, userDataTypeDef);
        }

        return {
            ...mergedDataTypeDefinition,
            groupSafeValueFormatter: createGroupSafeValueFormatter(mergedDataTypeDefinition, this.gos),
        };
    }

    public updateColDefAndGetColumnType(
        colDef: ColDef,
        userColDef: ColDef,
        colId: string
    ): string | string[] | undefined {
        let { cellDataType } = userColDef;
        const { field } = userColDef;
        if (cellDataType === undefined) {
            cellDataType = colDef.cellDataType;
        }
        if (cellDataType == null || cellDataType === true) {
            cellDataType = this.canInferCellDataType(colDef, userColDef) ? this.inferCellDataType(field, colId) : false;
        }
        if (!cellDataType) {
            colDef.cellDataType = false;
            return undefined;
        }
        const dataTypeDefinition = this.dataTypeDefinitions[cellDataType as string];
        if (!dataTypeDefinition) {
            _warn(47, { cellDataType });
            return undefined;
        }
        colDef.cellDataType = cellDataType;
        if (dataTypeDefinition.groupSafeValueFormatter) {
            colDef.valueFormatter = dataTypeDefinition.groupSafeValueFormatter;
        }
        if (dataTypeDefinition.valueParser) {
            colDef.valueParser = dataTypeDefinition.valueParser;
        }
        if (!dataTypeDefinition.suppressDefaultProperties) {
            this.setColDefPropertiesForBaseDataType(colDef, cellDataType, dataTypeDefinition, colId);
        }
        return dataTypeDefinition.columnTypes;
    }

    public addColumnListeners(column: AgColumn): void {
        if (!this.isPendingInference) {
            return;
        }
        const columnStateUpdates = this.columnStateUpdatesPendingInference[column.getColId()];
        if (!columnStateUpdates) {
            return;
        }
        const columnListener: IEventListener<ColumnEventName> = (
            event: AgGridEvent<any, any, ColumnEventName> & { key: keyof ColumnStateParams }
        ) => {
            columnStateUpdates.add(event.key);
        };
        column.__addEventListener('columnStateUpdated', columnListener);
        this.columnStateUpdateListenerDestroyFuncs.push(() =>
            column.__removeEventListener('columnStateUpdated', columnListener)
        );
    }

    private canInferCellDataType(colDef: ColDef, userColDef: ColDef): boolean {
        const { gos } = this;
        if (!_isClientSideRowModel(gos)) {
            return false;
        }
        const propsToCheckForInference = { cellRenderer: true, valueGetter: true, valueParser: true, refData: true };
        if (doColDefPropsPreventInference(userColDef, propsToCheckForInference)) {
            return false;
        }
        const columnTypes = userColDef.type === null ? colDef.type : userColDef.type;
        if (columnTypes) {
            const columnTypeDefs = gos.get('columnTypes') ?? {};
            const hasPropsPreventingInference = convertColumnTypes(columnTypes).some((columnType) => {
                const columnTypeDef = columnTypeDefs[columnType.trim()];
                return columnTypeDef && doColDefPropsPreventInference(columnTypeDef, propsToCheckForInference);
            });
            if (hasPropsPreventingInference) {
                return false;
            }
        }
        return !doColDefPropsPreventInference(colDef, propsToCheckForInference);
    }

    private inferCellDataType(field: string | undefined, colId: string): string | undefined {
        if (!field) {
            return undefined;
        }
        let value: any;
        const initialData = this.getInitialData();
        if (initialData) {
            const fieldContainsDots = field.indexOf('.') >= 0 && !this.gos.get('suppressFieldDotNotation');
            value = _getValueUsingField(initialData, field, fieldContainsDots);
        } else {
            this.initWaitForRowData(colId);
        }
        if (value == null) {
            return undefined;
        }
        const matchedType = Object.keys(this.dataTypeMatchers).find((_cellDataType: BaseCellDataType) =>
            this.dataTypeMatchers[_cellDataType]!(value)
        );

        return matchedType ?? 'object';
    }

    private getInitialData(): any {
        const rowData = this.gos.get('rowData');
        if (rowData?.length) {
            return rowData[0];
        } else if (this.initialData) {
            return this.initialData;
        } else {
            const rowNodes = (this.beans.rowModel as IClientSideRowModel).rootNode?.allLeafChildren;
            if (rowNodes?.length) {
                return rowNodes[0].data;
            }
        }
        return null;
    }

    private initWaitForRowData(colId: string): void {
        this.columnStateUpdatesPendingInference[colId] = new Set();
        if (this.isPendingInference) {
            return;
        }
        this.isPendingInference = true;
        const columnTypeOverridesExist = this.isColumnTypeOverrideInDataTypeDefinitions;
        const { colAutosize, eventSvc } = this.beans;
        if (columnTypeOverridesExist && colAutosize) {
            colAutosize.shouldQueueResizeOperations = true;
        }
        const [destroyFunc] = this.addManagedEventListeners({
            rowDataUpdateStarted: (event) => {
                const { firstRowData } = event;
                if (!firstRowData) {
                    return;
                }
                destroyFunc?.();
                this.isPendingInference = false;
                this.processColumnsPendingInference(firstRowData, columnTypeOverridesExist);
                this.columnStateUpdatesPendingInference = {};
                if (columnTypeOverridesExist) {
                    colAutosize?.processResizeOperations();
                }
                eventSvc.dispatchEvent({
                    type: 'dataTypesInferred',
                });
            },
        });
    }

    private processColumnsPendingInference(firstRowData: any, columnTypeOverridesExist: boolean): void {
        this.initialData = firstRowData;
        const state: ColumnState[] = [];
        this.destroyColumnStateUpdateListeners();
        const newRowGroupColumnStateWithoutIndex: { [colId: string]: ColumnState } = {};
        const newPivotColumnStateWithoutIndex: { [colId: string]: ColumnState } = {};

        for (const colId of Object.keys(this.columnStateUpdatesPendingInference)) {
            const columnStateUpdates = this.columnStateUpdatesPendingInference[colId];
            const column = this.colModel.getCol(colId);
            if (!column) {
                return;
            }
            const oldColDef = column.getColDef();
            if (!this.resetColDefIntoCol(column, 'cellDataTypeInferred')) {
                return;
            }
            const newColDef = column.getColDef();
            if (columnTypeOverridesExist && newColDef.type && newColDef.type !== oldColDef.type) {
                const updatedColumnState = getUpdatedColumnState(column, columnStateUpdates);
                if (updatedColumnState.rowGroup && updatedColumnState.rowGroupIndex == null) {
                    newRowGroupColumnStateWithoutIndex[colId] = updatedColumnState;
                }
                if (updatedColumnState.pivot && updatedColumnState.pivotIndex == null) {
                    newPivotColumnStateWithoutIndex[colId] = updatedColumnState;
                }
                state.push(updatedColumnState);
            }
        }

        if (columnTypeOverridesExist) {
            state.push(
                ...this.generateColumnStateForRowGroupAndPivotIndexes(
                    newRowGroupColumnStateWithoutIndex,
                    newPivotColumnStateWithoutIndex
                )
            );
        }
        if (state.length) {
            _applyColumnState(this.beans, { state }, 'cellDataTypeInferred');
        }
        this.initialData = null;
    }

    private generateColumnStateForRowGroupAndPivotIndexes(
        updatedRowGroupColumnState: { [colId: string]: ColumnState },
        updatedPivotColumnState: { [colId: string]: ColumnState }
    ): ColumnState[] {
        // Generally columns should appear in the order they were before. For any new columns, these should appear in the original col def order.
        // The exception is for columns that were added via `addGroupColumns`. These should appear at the end.
        // We don't have to worry about full updates, as in this case the arrays are correct, and they won't appear in the updated lists.

        const existingColumnStateUpdates: { [colId: string]: ColumnState } = {};

        const { rowGroupColsSvc, pivotColsSvc } = this.beans;

        rowGroupColsSvc?.restoreColumnOrder(existingColumnStateUpdates, updatedRowGroupColumnState);
        pivotColsSvc?.restoreColumnOrder(existingColumnStateUpdates, updatedPivotColumnState);

        return Object.values(existingColumnStateUpdates);
    }

    private resetColDefIntoCol(column: AgColumn, source: ColumnEventType): boolean {
        const userColDef = column.getUserProvidedColDef();
        if (!userColDef) {
            return false;
        }
        const newColDef = _addColumnDefaultAndTypes(this.beans, userColDef, column.getColId());
        column.setColDef(newColDef, userColDef, source);
        return true;
    }

    private getDateStringTypeDefinition(column?: AgColumn | null): DateStringDataTypeDefinition {
        const { dateString } = this.dataTypeDefinitions;
        if (!column) {
            return dateString as DateStringDataTypeDefinition;
        }
        return (this.getDataTypeDefinition(column) ?? dateString) as DateStringDataTypeDefinition;
    }

    public getDateParserFunction(column?: AgColumn | null): (value: string | undefined) => Date | undefined {
        return this.getDateStringTypeDefinition(column).dateParser!;
    }

    public getDateFormatterFunction(column?: AgColumn | null): (value: Date | undefined) => string | undefined {
        return this.getDateStringTypeDefinition(column).dateFormatter!;
    }

    public getDateIncludesTimeFlag(cellDataType?: any): boolean {
        return cellDataType === 'dateTime' || cellDataType === 'dateTimeString';
    }

    public getDataTypeDefinition(column: AgColumn): DataTypeDefinition | CoreDataTypeDefinition | undefined {
        const colDef = column.getColDef();
        if (!colDef.cellDataType) {
            return undefined;
        }
        return this.dataTypeDefinitions[colDef.cellDataType as string];
    }

    public getBaseDataType(column: AgColumn): BaseCellDataType | undefined {
        return this.getDataTypeDefinition(column)?.baseDataType;
    }

    public checkType(column: AgColumn, value: any): boolean {
        if (value == null) {
            return true;
        }
        const dataTypeMatcher = this.getDataTypeDefinition(column)?.dataTypeMatcher;
        if (!dataTypeMatcher) {
            return true;
        }
        return dataTypeMatcher(value);
    }

    public validateColDef(colDef: ColDef): void {
        const warning = (property: 'Formatter' | 'Parser') => _warn(48, { property });
        if (colDef.cellDataType === 'object') {
            const { object } = this.dataTypeDefinitions;
            if (colDef.valueFormatter === object.groupSafeValueFormatter && !this.hasObjectValueFormatter) {
                warning('Formatter');
            }
            if (colDef.editable && colDef.valueParser === object.valueParser && !this.hasObjectValueParser) {
                warning('Parser');
            }
        }
    }

    public postProcess(colDef: ColDef): void {
        const cellDataType = colDef.cellDataType;
        if (!cellDataType) {
            return;
        }
        const { dataTypeDefinitions, beans, formatValueFuncs } = this;
        const dataTypeDefinition = dataTypeDefinitions[cellDataType as string];
        beans.colFilter?.setColDefPropsForDataType(
            colDef,
            dataTypeDefinition,
            formatValueFuncs[cellDataType as string]
        );
    }

    // noinspection JSUnusedGlobalSymbols
    public getFormatValue(cellDataType: string): DataTypeFormatValueFunc | undefined {
        return this.formatValueFuncs[cellDataType];
    }

    public isColPendingInference(colId: string): boolean {
        return this.isPendingInference && !!this.columnStateUpdatesPendingInference[colId];
    }

    // using an object here to enforce dev to not forget to implement new types as they are added
    private columnDefinitionPropsPerDataType: Record<
        BaseCellDataType,
        (args: {
            colDef: ColDef;
            cellDataType: string;
            colModel: ColumnModel;
            dataTypeDefinition: (DataTypeDefinition | CoreDataTypeDefinition) & GroupSafeValueFormatter;
            colId: string;
            formatValue: DataTypeFormatValueFunc;
        }) => Partial<ColDef>
    > = {
        number() {
            return { cellEditor: 'agNumberCellEditor' };
        },
        boolean() {
            return {
                cellEditor: 'agCheckboxCellEditor',
                cellRenderer: 'agCheckboxCellRenderer',
                getFindText: () => null,
                suppressKeyboardEvent: (params: SuppressKeyboardEventParams<any, boolean>) =>
                    !!params.colDef.editable && params.event.key === KeyCode.SPACE,
            };
        },
        date({ formatValue }) {
            return { cellEditor: 'agDateCellEditor', keyCreator: formatValue };
        },
        dateString({ formatValue }) {
            return { cellEditor: 'agDateStringCellEditor', keyCreator: formatValue };
        },
        dateTime(args) {
            return this.date(args);
        },
        dateTimeString(args) {
            return this.dateString(args);
        },
        object({ formatValue, colModel, colId }) {
            return {
                cellEditorParams: {
                    useFormatter: true,
                },
                comparator: (a: any, b: any) => {
                    const column = colModel.getColDefCol(colId);
                    const colDef = column?.getColDef();
                    if (!column || !colDef) {
                        return 0;
                    }
                    const valA = a == null ? '' : formatValue({ column, node: null, value: a });
                    const valB = b == null ? '' : formatValue({ column, node: null, value: b });
                    if (valA === valB) return 0;
                    return valA > valB ? 1 : -1;
                },
                keyCreator: formatValue,
            };
        },
        text() {
            return {};
        },
    };

    private setColDefPropertiesForBaseDataType(
        colDef: ColDef,
        cellDataType: string,
        dataTypeDefinition: (DataTypeDefinition | CoreDataTypeDefinition) & GroupSafeValueFormatter,
        colId: string
    ): void {
        const formatValue = this.formatValueFuncs[cellDataType];
        const partialColDef = this.columnDefinitionPropsPerDataType[dataTypeDefinition.baseDataType]({
            colDef,
            cellDataType,
            colModel: this.colModel,
            dataTypeDefinition,
            colId,
            formatValue,
        });
        Object.assign(colDef, partialColDef);
    }

    private getDateObjectTypeDef<T extends 'date' | 'dateTime'>(baseDataType: T) {
        const translate = this.getLocaleTextFunc();
        const includeTime = this.getDateIncludesTimeFlag(baseDataType);
        return {
            baseDataType,
            valueParser: (params: ValueParserLiteParams<any, Date>) =>
                _parseDateTimeFromString(params.newValue && String(params.newValue)),
            valueFormatter: (params: ValueFormatterLiteParams<any, Date>) => {
                if (params.value == null) {
                    return '';
                }
                if (!(params.value instanceof Date) || isNaN(params.value.getTime())) {
                    return translate('invalidDate', 'Invalid Date');
                }
                return _serialiseDate(params.value, includeTime) ?? '';
            },
            dataTypeMatcher: (value: any) => value instanceof Date,
        };
    }

    private getDateStringTypeDef<T extends 'dateString' | 'dateTimeString'>(baseDataType: T) {
        const includeTime = this.getDateIncludesTimeFlag(baseDataType);
        return {
            baseDataType,
            dateParser: (value: string | undefined) => _parseDateTimeFromString(value) ?? undefined,
            dateFormatter: (value: Date | undefined) => _serialiseDate(value ?? null, includeTime) ?? undefined,
            valueParser: (params: ValueParserLiteParams<any, string>) =>
                _isValidDate(String(params.newValue)) ? params.newValue : null,
            valueFormatter: (params: ValueFormatterLiteParams<any, string>) =>
                _isValidDate(String(params.value)) ? String(params.value) : '',
            dataTypeMatcher: (value: any) => typeof value === 'string' && _isValidDate(value),
        };
    }

    private getDefaultDataTypes(): CoreDataTypeDefMap {
        const translate = this.getLocaleTextFunc();

        return {
            number: {
                baseDataType: 'number',
                // can be empty space with legacy copy
                valueParser: (params: ValueParserLiteParams<any, number>) =>
                    params.newValue?.trim?.() === '' ? null : Number(params.newValue),
                valueFormatter: (params: ValueFormatterLiteParams<any, number>) => {
                    if (params.value == null) {
                        return '';
                    }
                    if (typeof params.value !== 'number' || isNaN(params.value)) {
                        return translate('invalidNumber', 'Invalid Number');
                    }
                    return String(params.value);
                },
                dataTypeMatcher: (value: any) => typeof value === 'number',
            },
            text: {
                baseDataType: 'text',
                valueParser: (params: ValueParserLiteParams<any, string>) =>
                    params.newValue === '' ? null : _toStringOrNull(params.newValue),
                dataTypeMatcher: (value: any) => typeof value === 'string',
            },
            boolean: {
                baseDataType: 'boolean',
                valueParser: (params: ValueParserLiteParams<any, boolean>) => {
                    if (params.newValue == null) {
                        return params.newValue;
                    }
                    // can be empty space with legacy copy
                    return params.newValue?.trim?.() === '' ? null : String(params.newValue).toLowerCase() === 'true';
                },
                valueFormatter: (params: ValueFormatterLiteParams<any, boolean>) =>
                    params.value == null ? '' : String(params.value),
                dataTypeMatcher: (value: any) => typeof value === 'boolean',
            },
            date: this.getDateObjectTypeDef('date'),
            dateString: this.getDateStringTypeDef('dateString'),
            dateTime: this.getDateObjectTypeDef('dateTime'),
            dateTimeString: {
                ...this.getDateStringTypeDef('dateTimeString'),
                dataTypeMatcher: (value: any) => typeof value === 'string' && _isValidDateTime(value),
            },
            object: {
                baseDataType: 'object',
                valueParser: () => null,
                valueFormatter: (params: ValueFormatterLiteParams<any, any>) => _toStringOrNull(params.value) ?? '',
            },
        };
    }

    private destroyColumnStateUpdateListeners(): void {
        this.columnStateUpdateListenerDestroyFuncs.forEach((destroyFunc) => destroyFunc());
        this.columnStateUpdateListenerDestroyFuncs = [];
    }

    public override destroy(): void {
        this.dataTypeDefinitions = {};
        this.dataTypeMatchers = {};
        this.formatValueFuncs = {};
        this.columnStateUpdatesPendingInference = {};
        this.destroyColumnStateUpdateListeners();
        super.destroy();
    }
}

function mergeDataTypeDefinitions(
    parentDataTypeDefinition: DataTypeDefinition | CoreDataTypeDefinition,
    childDataTypeDefinition: DataTypeDefinition
): DataTypeDefinition {
    const mergedDataTypeDefinition = {
        ...parentDataTypeDefinition,
        ...childDataTypeDefinition,
    } as DataTypeDefinition;
    if (
        parentDataTypeDefinition.columnTypes &&
        childDataTypeDefinition.columnTypes &&
        (childDataTypeDefinition as any).appendColumnTypes
    ) {
        mergedDataTypeDefinition.columnTypes = [
            ...convertColumnTypes(parentDataTypeDefinition.columnTypes),
            ...convertColumnTypes(childDataTypeDefinition.columnTypes),
        ];
    }
    return mergedDataTypeDefinition;
}

function validateDataTypeDefinition(
    dataTypeDefinition: DataTypeDefinition,
    parentDataTypeDefinition: DataTypeDefinition | CoreDataTypeDefinition,
    parentCellDataType: string
): boolean {
    if (!parentDataTypeDefinition) {
        _warn(45, { parentCellDataType });
        return false;
    }
    if (parentDataTypeDefinition.baseDataType !== dataTypeDefinition.baseDataType) {
        _warn(46);
        return false;
    }
    return true;
}

function createGroupSafeValueFormatter(
    dataTypeDefinition: DataTypeDefinition | CoreDataTypeDefinition,
    gos: GridOptionsService
): ValueFormatterFunc | undefined {
    if (!dataTypeDefinition.valueFormatter) {
        return undefined;
    }
    return (params: ValueFormatterParams) => {
        if (params.node?.group) {
            const aggFunc = (params.colDef.pivotValueColumn ?? params.column).getAggFunc();
            if (aggFunc) {
                // the resulting type of these will be the same, so we call valueFormatter anyway
                if (aggFunc === 'first' || aggFunc === 'last') {
                    return dataTypeDefinition.valueFormatter!(params);
                }

                if (dataTypeDefinition.baseDataType === 'number' && aggFunc !== 'count') {
                    if (typeof params.value === 'number') {
                        return dataTypeDefinition.valueFormatter!(params);
                    }

                    if (typeof params.value === 'object') {
                        if (!params.value) {
                            return undefined;
                        }

                        if ('toNumber' in params.value) {
                            return dataTypeDefinition.valueFormatter!({
                                ...params,
                                value: params.value.toNumber(),
                            });
                        }

                        if ('value' in params.value) {
                            return dataTypeDefinition.valueFormatter!({
                                ...params,
                                value: params.value.value,
                            });
                        }
                    }
                }

                // by default don't use value formatter for agg func as type may have changed
                return undefined as any;
            }

            // `groupRows` use the key as the value
            if (gos.get('groupDisplayType') === 'groupRows' && !gos.get('treeData')) {
                // we don't want to double format the value
                // as this is already formatted by using the valueFormatter as the keyCreator
                return undefined as any;
            }
        } else if (gos.get('groupHideOpenParents') && params.column.isRowGroupActive()) {
            // `groupHideOpenParents` passes leaf values in the group column, so need to format still.
            // If it's not a string, we know it hasn't been formatted. Otherwise check the data type matcher.
            if (typeof params.value === 'string' && !dataTypeDefinition.dataTypeMatcher?.(params.value)) {
                return undefined as any;
            }
        }
        return dataTypeDefinition.valueFormatter!(params);
    };
}

function doesColDefPropPreventInference(
    colDef: ColDef,
    checkProps: { [key in keyof ColDef]: boolean },
    prop: keyof ColDef,
    comparisonValue?: any
): boolean {
    if (!checkProps[prop]) {
        return false;
    }
    const value = colDef[prop];
    if (value === null) {
        checkProps[prop] = false;
        return false;
    } else {
        return comparisonValue === undefined ? !!value : value === comparisonValue;
    }
}

function doColDefPropsPreventInference(
    colDef: ColDef,
    propsToCheckForInference: { [key in keyof ColDef]: boolean }
): boolean {
    return [
        ['cellRenderer', 'agSparklineCellRenderer'],
        ['valueGetter', undefined],
        ['valueParser', undefined],
        ['refData', undefined],
    ].some(([prop, comparisonValue]: [keyof ColDef, any]) =>
        doesColDefPropPreventInference(colDef, propsToCheckForInference, prop, comparisonValue)
    );
}

function getUpdatedColumnState(column: AgColumn, columnStateUpdates: Set<keyof ColumnStateParams>): ColumnState {
    const columnState = getColumnStateFromColDef(column);
    columnStateUpdates.forEach((key) => {
        // if the column state has been updated, don't update again
        delete columnState[key];
        if (key === 'rowGroup') {
            delete columnState.rowGroupIndex;
        } else if (key === 'pivot') {
            delete columnState.pivotIndex;
        }
    });
    return columnState;
}
