import { Autowired, Bean, PostConstruct } from '../context/context';
import { BeanStub } from '../context/beanStub';
import {
    ColDef,
    KeyCreatorParams,
    SuppressKeyboardEventParams,
    ValueFormatterFunc,
    ValueFormatterParams,
    ValueGetterParams,
} from '../entities/colDef';
import {
    BaseCellDataType,
    CoreDataTypeDefinition,
    DataTypeDefinition,
    DateStringDataTypeDefinition,
    ValueFormatterLiteParams,
    ValueParserLiteParams,
} from '../entities/dataType';
import { IRowModel } from '../interfaces/iRowModel';
import { IClientSideRowModel } from '../interfaces/iClientSideRowModel';
import { Events } from '../eventKeys';
import { ColumnModel, ColumnState, ColumnStateParams, convertSourceType } from './columnModel';
import { getValueUsingField } from '../utils/object';
import { ModuleRegistry } from '../modules/moduleRegistry';
import { ModuleNames } from '../modules/moduleNames';
import { ValueService } from '../valueService/valueService';
import { Column } from '../entities/column';
import { warnOnce } from '../utils/function';
import { KeyCode } from '../constants/keyCode';
import { exists, toStringOrNull } from '../utils/generic';
import { IRowNode } from '../interfaces/iRowNode';
import { parseDateTimeFromString, serialiseDate } from '../utils/date';
import { AgEventListener, AgGridEvent, DataTypesInferredEvent, RowDataUpdateStartedEvent } from '../events';
import { WithoutGridCommon } from '../interfaces/iCommon';

interface GroupSafeValueFormatter {
    groupSafeValueFormatter?: ValueFormatterFunc;
}

const MONTH_LOCALE_TEXT = {
    january: 'January',
    february: 'February',
    march: 'March',
    april: 'April',
    may: 'May',
    june: 'June',
    july: 'July',
    august: 'August',
    september: 'September',
    october: 'October',
    november: 'November',
    december: 'December'
};
const MONTH_KEYS: (keyof typeof MONTH_LOCALE_TEXT)[] = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

@Bean('dataTypeService')
export class DataTypeService extends BeanStub {
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('valueService') private valueService: ValueService;

    private dataTypeDefinitions: { [cellDataType: string]: (DataTypeDefinition | CoreDataTypeDefinition) & GroupSafeValueFormatter } = {};
    private dataTypeMatchers: { [cellDataType: string]: ((value: any) => boolean) | undefined };
    private isWaitingForRowData: boolean = false;
    private hasObjectValueParser: boolean;
    private hasObjectValueFormatter: boolean;
    private groupHideOpenParents: boolean;
    private initialData: any | null | undefined;
    private isColumnTypeOverrideInDataTypeDefinitions: boolean = false;
    // keep track of any column state updates whilst waiting for data types to be inferred
    private columnStateUpdatesPendingInference: { [colId: string]: Set<keyof ColumnStateParams> } = {};
    private columnStateUpdateListenerDestroyFuncs: (() => void)[] = [];

    @PostConstruct
    public init(): void {
        this.groupHideOpenParents = this.gos.get('groupHideOpenParents');
        this.addManagedPropertyListener('groupHideOpenParents', () => {
            this.groupHideOpenParents = this.gos.get('groupHideOpenParents');
        });
        this.processDataTypeDefinitions();

        this.addManagedPropertyListener('dataTypeDefinitions', (event) => {
            this.processDataTypeDefinitions();
            this.columnModel.recreateColumnDefs(convertSourceType(event.source));
        });
    }

    private processDataTypeDefinitions(): void {
        const defaultDataTypes = this.getDefaultDataTypes();
        this.dataTypeDefinitions = {};
        Object.entries(defaultDataTypes).forEach(([cellDataType, dataTypeDefinition]) => {
            this.dataTypeDefinitions[cellDataType] = {
                ...dataTypeDefinition,
                groupSafeValueFormatter: this.createGroupSafeValueFormatter(dataTypeDefinition)
            };
        });
        const dataTypeDefinitions = this.gos.get('dataTypeDefinitions') ?? {};
        this.dataTypeMatchers = {};

        Object.entries(dataTypeDefinitions).forEach(([cellDataType, dataTypeDefinition]) => {
            const mergedDataTypeDefinition = this.processDataTypeDefinition(dataTypeDefinition, dataTypeDefinitions, [cellDataType], defaultDataTypes);
            if (mergedDataTypeDefinition) {
                this.dataTypeDefinitions[cellDataType] = mergedDataTypeDefinition;
                if (dataTypeDefinition.dataTypeMatcher) {
                    this.dataTypeMatchers[cellDataType] = dataTypeDefinition.dataTypeMatcher;
                }
            }
        });
        this.checkObjectValueHandlers(defaultDataTypes);

        ['dateString', 'text', 'number', 'boolean', 'date'].forEach((cellDataType) => {
            const overriddenDataTypeMatcher = this.dataTypeMatchers[cellDataType];
            if (overriddenDataTypeMatcher) {
                // remove to maintain correct ordering
                delete this.dataTypeMatchers[cellDataType];
            }
            this.dataTypeMatchers[cellDataType] = overriddenDataTypeMatcher ?? defaultDataTypes[cellDataType].dataTypeMatcher;
        });
    }

    private mergeDataTypeDefinitions(
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
                ...this.convertColumnTypes(parentDataTypeDefinition.columnTypes),
                ...this.convertColumnTypes(childDataTypeDefinition.columnTypes),
            ];
        }
        return mergedDataTypeDefinition;
    }

    private processDataTypeDefinition(
        dataTypeDefinition: DataTypeDefinition,
        dataTypeDefinitions: { [key: string]: DataTypeDefinition },
        alreadyProcessedDataTypes: string[],
        defaultDataTypes: { [key: string]: CoreDataTypeDefinition }
    ): DataTypeDefinition & GroupSafeValueFormatter | undefined {
        let mergedDataTypeDefinition: DataTypeDefinition;
        const extendsCellDataType = dataTypeDefinition.extendsDataType;

        if (dataTypeDefinition.columnTypes) {
            this.isColumnTypeOverrideInDataTypeDefinitions = true;
        }

        if (dataTypeDefinition.extendsDataType === dataTypeDefinition.baseDataType) {
            let baseDataTypeDefinition = defaultDataTypes[extendsCellDataType];
            const overriddenBaseDataTypeDefinition = dataTypeDefinitions[extendsCellDataType];
            if (baseDataTypeDefinition && overriddenBaseDataTypeDefinition) {
                // only if it's valid do we override with a provided one
                baseDataTypeDefinition = overriddenBaseDataTypeDefinition;
            }
            if (!this.validateDataTypeDefinition(dataTypeDefinition, baseDataTypeDefinition, extendsCellDataType)) {
                return undefined;
            }
            mergedDataTypeDefinition = this.mergeDataTypeDefinitions(
                baseDataTypeDefinition,
                dataTypeDefinition
            );
        } else {
            if (alreadyProcessedDataTypes.includes(extendsCellDataType)) {
                warnOnce('Data type definition hierarchies (via the "extendsDataType" property) cannot contain circular references.');
                return undefined;
            }
            const extendedDataTypeDefinition = dataTypeDefinitions[extendsCellDataType];
            if (!this.validateDataTypeDefinition(dataTypeDefinition, extendedDataTypeDefinition, extendsCellDataType)) {
                return undefined;
            }
            const mergedExtendedDataTypeDefinition = this.processDataTypeDefinition(
                extendedDataTypeDefinition,
                dataTypeDefinitions,
                [...alreadyProcessedDataTypes, extendsCellDataType],
                defaultDataTypes
            );
            if (!mergedExtendedDataTypeDefinition) {
                return undefined;
            }
            mergedDataTypeDefinition = this.mergeDataTypeDefinitions(
                mergedExtendedDataTypeDefinition,
                dataTypeDefinition
            );
        }

        return {
            ...mergedDataTypeDefinition,
            groupSafeValueFormatter: this.createGroupSafeValueFormatter(mergedDataTypeDefinition)
        };
    }

    private validateDataTypeDefinition(
        dataTypeDefinition: DataTypeDefinition,
        parentDataTypeDefinition: DataTypeDefinition | CoreDataTypeDefinition,
        parentCellDataType: string
    ): boolean {
        if (!parentDataTypeDefinition) {
            warnOnce(`The data type definition ${parentCellDataType} does not exist.`);
            return false;
        }
        if (parentDataTypeDefinition.baseDataType !== dataTypeDefinition.baseDataType) {
            warnOnce('The "baseDataType" property of a data type definition must match that of its parent.');
            return false;
        }
        return true;
    }

    private createGroupSafeValueFormatter(dataTypeDefinition: DataTypeDefinition | CoreDataTypeDefinition): ValueFormatterFunc | undefined {
        if (!dataTypeDefinition.valueFormatter) {
            return undefined;
        }
        return (params: ValueFormatterParams) => {
            if (params.node?.group) {
                const aggFunc = params.column.getAggFunc();
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
                }

                // we don't want to double format the value
                // as this is already formatted by using the valueFormatter as the keyCreator
                if (!this.gos.get('suppressGroupMaintainValueType')) {
                    return undefined as any;
                }
            } else if (this.groupHideOpenParents && params.column.isRowGroupActive()) {
                // `groupHideOpenParents` passes leaf values in the group column, so need to format still.
                // If it's not a string, we know it hasn't been formatted. Otherwise check the data type matcher.
                if (typeof params.value !== 'string' || dataTypeDefinition.dataTypeMatcher?.(params.value)) {
                    return dataTypeDefinition.valueFormatter!(params);
                }

                // we don't want to double format the value
                // as this is already formatted by using the valueFormatter as the keyCreator
                if (!this.gos.get('suppressGroupMaintainValueType')) {
                    return undefined as any;
                }
            }
            return dataTypeDefinition.valueFormatter!(params);
        };
    }

    private updateColDefAndGetDataTypeDefinitionColumnType(
        colDef: ColDef,
        userColDef: ColDef,
        colId: string
    ): string | string[] | undefined {
        let { cellDataType } = userColDef;
        const { field } = userColDef;
        if (cellDataType === undefined) {
            cellDataType = colDef.cellDataType;
        }
        if ((cellDataType == null || cellDataType === true)) {
            cellDataType = this.canInferCellDataType(colDef, userColDef) ? this.inferCellDataType(field, colId) : false;
        }
        if (!cellDataType) {
            colDef.cellDataType = false;
            return undefined;
        }
        const dataTypeDefinition = this.dataTypeDefinitions[cellDataType as string];
        if (!dataTypeDefinition) {
            warnOnce(`Missing data type definition - "${cellDataType}"`);
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
            this.setColDefPropertiesForBaseDataType(colDef, dataTypeDefinition, colId);
        }
        return dataTypeDefinition.columnTypes;
    }

    public updateColDefAndGetColumnType(
        colDef: ColDef,
        userColDef: ColDef,
        colId: string
    ): string[] | undefined {
        const dataTypeDefinitionColumnType = this.updateColDefAndGetDataTypeDefinitionColumnType(colDef, userColDef, colId);
        const columnTypes = userColDef.type ?? dataTypeDefinitionColumnType ?? colDef.type;
        colDef.type = columnTypes;
        return columnTypes ? this.convertColumnTypes(columnTypes) : undefined;
    }

    public addColumnListeners(column: Column): void {
        if (!this.isWaitingForRowData) { return; }
        const columnStateUpdates = this.columnStateUpdatesPendingInference[column.getColId()];
        if (!columnStateUpdates) { return; }
        const columnListener: AgEventListener = (event: AgGridEvent & { key: keyof ColumnStateParams }) => {
            columnStateUpdates.add(event.key);
        };
        column.addEventListener(Column.EVENT_STATE_UPDATED, columnListener);
        this.columnStateUpdateListenerDestroyFuncs.push(() => column.removeEventListener(Column.EVENT_STATE_UPDATED, columnListener));
    }

    private canInferCellDataType(colDef: ColDef, userColDef: ColDef): boolean {
        if (this.rowModel.getType() !== 'clientSide') {
            return false;
        }
        const propsToCheckForInference = { cellRenderer: true, valueGetter: true, valueParser: true, refData: true };
        if (this.doColDefPropsPreventInference(userColDef, propsToCheckForInference)) {
            return false;
        }
        const columnTypes = userColDef.type === null ? colDef.type : userColDef.type;
        if (columnTypes) {
            const columnTypeDefs = this.gos.get('columnTypes') ?? {};
            const hasPropsPreventingInference = this.convertColumnTypes(columnTypes).some(columnType => {
                const columnTypeDef = columnTypeDefs[columnType.trim()];
                return columnTypeDef && this.doColDefPropsPreventInference(columnTypeDef, propsToCheckForInference);
            });
            if (hasPropsPreventingInference) {
                return false;
            }
        }
        return !this.doColDefPropsPreventInference(colDef, propsToCheckForInference)
    }

    private doColDefPropsPreventInference(colDef: ColDef, propsToCheckForInference: { [key in keyof ColDef]: boolean }): boolean {
        return [
            ['cellRenderer', 'agSparklineCellRenderer'], ['valueGetter', undefined], ['valueParser', undefined], ['refData', undefined]
        ].some(([prop, comparisonValue]: [keyof ColDef, any]) => 
            this.doesColDefPropPreventInference(colDef, propsToCheckForInference, prop, comparisonValue));
    }

    private doesColDefPropPreventInference(
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

    private inferCellDataType(field: string | undefined, colId: string): string | undefined {
        if (!field) {
            return undefined;
        }
        let value: any;
        const initialData = this.getInitialData();
        if (initialData) {
            const fieldContainsDots = field.indexOf('.') >= 0 && !this.gos.get('suppressFieldDotNotation');
            value = getValueUsingField(initialData, field, fieldContainsDots);
        } else {
            this.initWaitForRowData(colId);
        }
        if (value == null) {
            return undefined;
        }
        const [cellDataType] = Object.entries(this.dataTypeMatchers).find(([_cellDataType, dataTypeMatcher]) => dataTypeMatcher!(value)) ?? ['object'];
        return cellDataType;
    }

    private getInitialData(): any {
        const rowData = this.gos.get('rowData');
        if (rowData?.length) {
            return rowData[0];
        } else if (this.initialData) {
            return this.initialData;
        } else {
            const rowNodes = (this.rowModel as IClientSideRowModel)
                .getRootNode()
                .allLeafChildren;
            if (rowNodes?.length) {
                return rowNodes[0].data;
            }
        }
        return null;
    }

    private initWaitForRowData(colId: string): void {
        this.columnStateUpdatesPendingInference[colId] = new Set();
        if (this.isWaitingForRowData) {
            return;
        }
        this.isWaitingForRowData = true;
        const columnTypeOverridesExist = this.isColumnTypeOverrideInDataTypeDefinitions;
        if (columnTypeOverridesExist) {
            this.columnModel.queueResizeOperations();
        }
        const destroyFunc = this.addManagedListener(this.eventService, Events.EVENT_ROW_DATA_UPDATE_STARTED, (event: RowDataUpdateStartedEvent) => {
            const { firstRowData } = event;
            if (!firstRowData) {
                return;
            }
            destroyFunc?.();
            this.isWaitingForRowData = false;
            this.processColumnsPendingInference(firstRowData, columnTypeOverridesExist);
            this.columnStateUpdatesPendingInference = {};
            if (columnTypeOverridesExist) {
                this.columnModel.processResizeOperations();
            }
            const dataTypesInferredEvent: WithoutGridCommon<DataTypesInferredEvent> = {
                type: Events.EVENT_DATA_TYPES_INFERRED
            }
            this.eventService.dispatchEvent(dataTypesInferredEvent);
        });
    }

    public isPendingInference(): boolean {
        return this.isWaitingForRowData;
    }

    private processColumnsPendingInference(firstRowData: any, columnTypeOverridesExist: boolean): void {
        this.initialData = firstRowData;
        const state: ColumnState[] = [];
        this.columnStateUpdateListenerDestroyFuncs.forEach(destroyFunc => destroyFunc());
        this.columnStateUpdateListenerDestroyFuncs = [];
        const newRowGroupColumnStateWithoutIndex: { [colId: string]: ColumnState } = {};
        const newPivotColumnStateWithoutIndex: { [colId: string]: ColumnState } = {};
        Object.entries(this.columnStateUpdatesPendingInference).forEach(([colId, columnStateUpdates]) => {
            const column = this.columnModel.getGridColumn(colId);
            if (!column) { return; }
            const oldColDef = column.getColDef();
            if (!this.columnModel.resetColumnDefIntoColumn(column, 'cellDataTypeInferred')) { return; }
            const newColDef = column.getColDef();
            if (columnTypeOverridesExist && newColDef.type && newColDef.type !== oldColDef.type) {
                const updatedColumnState = this.getUpdatedColumnState(column, columnStateUpdates);
                if (updatedColumnState.rowGroup && updatedColumnState.rowGroupIndex == null) {
                    newRowGroupColumnStateWithoutIndex[colId] = updatedColumnState;
                }
                if (updatedColumnState.pivot && updatedColumnState.pivotIndex == null) {
                    newPivotColumnStateWithoutIndex[colId] = updatedColumnState;
                }
                state.push(updatedColumnState);
            }
        });
        if (columnTypeOverridesExist) {
            state.push(...this.columnModel.generateColumnStateForRowGroupAndPivotIndexes(newRowGroupColumnStateWithoutIndex, newPivotColumnStateWithoutIndex));
        }
        if (state.length) {
            this.columnModel.applyColumnState({ state }, 'cellDataTypeInferred');
        }
        this.initialData = null;
    }

    private getUpdatedColumnState(column: Column, columnStateUpdates: Set<keyof ColumnStateParams>): ColumnState {
        const columnState = this.columnModel.getColumnStateFromColDef(column);
        columnStateUpdates.forEach(key => {
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

    private checkObjectValueHandlers(defaultDataTypes: { [key: string]: CoreDataTypeDefinition }): void {
        const resolvedObjectDataTypeDefinition = this.dataTypeDefinitions.object;
        const defaultObjectDataTypeDefinition = defaultDataTypes.object;
        this.hasObjectValueParser = resolvedObjectDataTypeDefinition.valueParser !== defaultObjectDataTypeDefinition.valueParser;
        this.hasObjectValueFormatter = resolvedObjectDataTypeDefinition.valueFormatter !== defaultObjectDataTypeDefinition.valueFormatter;
    }

    public convertColumnTypes(type: string | string[]): string[] {
        let typeKeys: string[] = [];

        if (type instanceof Array) {
            const invalidArray = type.some((a) => typeof a !== 'string');
            if (invalidArray) {
                console.warn("if colDef.type is supplied an array it should be of type 'string[]'");
            } else {
                typeKeys = type;
            }
        } else if (typeof type === 'string') {
            typeKeys = type.split(',');
        } else {
            console.warn("colDef.type should be of type 'string' | 'string[]'");
        }
        return typeKeys;
    }

    private getDateStringTypeDefinition(column?: Column | null): DateStringDataTypeDefinition {
        if (!column) {
            return this.dataTypeDefinitions.dateString as DateStringDataTypeDefinition;
        }
        return (this.getDataTypeDefinition(column) ?? this.dataTypeDefinitions.dateString) as DateStringDataTypeDefinition;
    }

    public getDateParserFunction(column?: Column | null): (value: string | undefined) => Date | undefined {
        return this.getDateStringTypeDefinition(column).dateParser!;
    }

    public getDateFormatterFunction(column?: Column | null): (value: Date | undefined) => string | undefined {
        return this.getDateStringTypeDefinition(column).dateFormatter!;
    }

    public getDataTypeDefinition(column: Column): DataTypeDefinition | CoreDataTypeDefinition | undefined {
        const colDef = column.getColDef();
        if (!colDef.cellDataType) { return undefined; }
        return this.dataTypeDefinitions[colDef.cellDataType as string];
    }

    public getBaseDataType(column: Column): BaseCellDataType | undefined {
        return this.getDataTypeDefinition(column)?.baseDataType;
    }

    public checkType(column: Column, value: any): boolean {
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
        if (colDef.cellDataType === 'object') {
            if (colDef.valueFormatter === this.dataTypeDefinitions.object.groupSafeValueFormatter && !this.hasObjectValueFormatter) {
                warnOnce('Cell data type is "object" but no value formatter has been provided. Please either provide an object data type definition with a value formatter, or set "colDef.valueFormatter"');
            }
            if (colDef.editable && colDef.valueParser === this.dataTypeDefinitions.object.valueParser && !this.hasObjectValueParser) {
                warnOnce('Cell data type is "object" but no value parser has been provided. Please either provide an object data type definition with a value parser, or set "colDef.valueParser"');
            }
        }
    }

    private setColDefPropertiesForBaseDataType(
        colDef: ColDef,
        dataTypeDefinition: (DataTypeDefinition | CoreDataTypeDefinition) & GroupSafeValueFormatter,
        colId: string
    ): void {
        const formatValue = (column: Column, node: IRowNode | null, value: any) => {
            let valueFormatter = column.getColDef().valueFormatter;
            if (valueFormatter === dataTypeDefinition.groupSafeValueFormatter) {
                valueFormatter = dataTypeDefinition.valueFormatter;
            }
            return this.valueService.formatValue(column, node, value, valueFormatter as any);
        }
        const usingSetFilter = ModuleRegistry.__isRegistered(ModuleNames.SetFilterModule, this.context.getGridId());
        const translate = this.localeService.getLocaleTextFunc();
        const mergeFilterParams = (params: any) => {
            const { filterParams } = colDef;
            colDef.filterParams = typeof filterParams === 'object' ? {
                ...filterParams,
                ...params
            } : params;
        }
        switch (dataTypeDefinition.baseDataType) {
            case 'number': {
                colDef.cellEditor = 'agNumberCellEditor';
                if (usingSetFilter) {
                    mergeFilterParams({
                        comparator: (a: string, b: string) => {
                            const valA = a == null ? 0 : parseInt(a);
                            const valB = b == null ? 0 : parseInt(b);
                            if (valA === valB) return 0;
                            return valA > valB ? 1 : -1;
                        },
                    });
                }
                break;
            }
            case 'boolean': {
                colDef.cellEditor = 'agCheckboxCellEditor';
                colDef.cellRenderer = 'agCheckboxCellRenderer';
                colDef.suppressKeyboardEvent = (params: SuppressKeyboardEventParams<any, boolean>) => !!params.colDef.editable && params.event.key === KeyCode.SPACE;
                if (usingSetFilter) {
                    mergeFilterParams({
                        valueFormatter: (params: ValueFormatterParams) => {
                            if (!exists(params.value)) {
                                return translate('blanks', '(Blanks)');
                            }
                            return translate(String(params.value), params.value ? 'True' : 'False');
                        }
                    });
                } else {
                    mergeFilterParams({
                        maxNumConditions: 1,
                        debounceMs: 0,
                        filterOptions: [
                            'empty',
                            {
                                displayKey: 'true',
                                displayName: 'True',
                                predicate: (_filterValues: any[], cellValue: any) => cellValue,
                                numberOfInputs: 0,
                            },
                            {
                                displayKey: 'false',
                                displayName: 'False',
                                predicate: (_filterValues: any[], cellValue: any) => cellValue === false,
                                numberOfInputs: 0,
                            },
                        ]
                    });
                }
                break;
            }
            case 'date': {
                colDef.cellEditor = 'agDateCellEditor';
                colDef.keyCreator = (params: KeyCreatorParams) => formatValue(params.column, params.node, params.value)!;
                if (usingSetFilter) {
                    mergeFilterParams({
                        valueFormatter: (params: ValueFormatterParams) => {
                            const valueFormatted = formatValue(params.column, params.node, params.value);
                            return exists(valueFormatted) ? valueFormatted : translate('blanks', '(Blanks)');
                        },
                        treeList: true,
                        treeListFormatter: (pathKey: string | null, level: number) => {
                            if (level === 1 && pathKey != null) {
                                const monthKey = MONTH_KEYS[Number(pathKey) - 1];
                                return translate(monthKey, MONTH_LOCALE_TEXT[monthKey]);
                            }
                            return pathKey ?? translate('blanks', '(Blanks)');
                        }
                    });
                }
                break;
            }
            case 'dateString': {
                colDef.cellEditor = 'agDateStringCellEditor';
                colDef.keyCreator = (params: KeyCreatorParams) => formatValue(params.column, params.node, params.value)!;
                const convertToDate = (dataTypeDefinition as DateStringDataTypeDefinition).dateParser!;
                if (usingSetFilter) {
                    mergeFilterParams({
                        valueFormatter: (params: ValueFormatterParams) => {
                            const valueFormatted = formatValue(params.column, params.node, params.value);
                            return exists(valueFormatted) ? valueFormatted : translate('blanks', '(Blanks)');
                        },
                        treeList: true,
                        treeListPathGetter: (value: string | null) => {
                            const date = convertToDate(value ?? undefined);
                            return date ? [String(date.getFullYear()), String(date.getMonth() + 1), String(date.getDate())] : null;
                        },
                        treeListFormatter: (pathKey: string | null, level: number) => {
                            if (level === 1 && pathKey != null) {
                                const monthKey = MONTH_KEYS[Number(pathKey) - 1];
                                return translate(monthKey, MONTH_LOCALE_TEXT[monthKey]);
                            }
                            return pathKey ?? translate('blanks', '(Blanks)');
                        }
                    });
                } else {
                    mergeFilterParams({
                        comparator: (filterDate: Date, cellValue: string | undefined) => {
                            const cellAsDate = convertToDate(cellValue)!;
                            if (cellValue == null || cellAsDate < filterDate) { return -1; }
                            if (cellAsDate > filterDate) { return 1; }
                            return 0;
                        }
                    });
                }
                break;
            }
            case 'object': {
                colDef.cellEditorParams = {
                    useFormatter: true,
                };
                colDef.comparator = (a: any, b: any) => {
                    const column = this.columnModel.getPrimaryColumn(colId);
                    const colDef = column?.getColDef();
                    if (!column || !colDef) {
                        return 0;
                    }
                    const valA = a == null ? '' : formatValue(column, null, a)!;
                    const valB = b == null ? '' : formatValue(column, null, b)!;
                    if (valA === valB) return 0;
                    return valA > valB ? 1 : -1;
                };
                colDef.keyCreator = (params: KeyCreatorParams) => formatValue(params.column, params.node, params.value)!;
                if (usingSetFilter) {
                    mergeFilterParams({
                        valueFormatter: (params: ValueFormatterParams) => {
                            const valueFormatted = formatValue(params.column, params.node, params.value);
                            return exists(valueFormatted) ? valueFormatted : translate('blanks', '(Blanks)');
                        }
                    });
                } else {
                    colDef.filterValueGetter = (params: ValueGetterParams) => formatValue(
                        params.column,
                        params.node,
                        this.valueService.getValue(params.column, params.node)
                    );
                }
                break;
            }
        }
    }

    private getDefaultDataTypes(): { [key: string]: CoreDataTypeDefinition } {
        const defaultDateFormatMatcher = (value: string) => !!value.match('^\\d{4}-\\d{2}-\\d{2}$');
        const translate = this.localeService.getLocaleTextFunc();
        return {
            number: {
                baseDataType: 'number',
                // can be empty space with legacy copy
                valueParser: (params: ValueParserLiteParams<any, number>) => params.newValue?.trim?.() === ''
                    ? null
                    : Number(params.newValue),
                valueFormatter: (params: ValueFormatterLiteParams<any, number>) => {
                    if (params.value == null) { return ''; }
                    if (typeof params.value !== 'number' || isNaN(params.value)) {
                        return translate('invalidNumber', 'Invalid Number');
                    }
                    return String(params.value);
                },
                dataTypeMatcher: (value: any) => typeof value === 'number',
            },
            text: {
                baseDataType: 'text',
                valueParser: (params: ValueParserLiteParams<any, string>) => params.newValue === '' ? null : toStringOrNull(params.newValue),
                dataTypeMatcher: (value: any) => typeof value === 'string',
            },
            boolean: {
                baseDataType: 'boolean',
                valueParser: (params: ValueParserLiteParams<any, boolean>) => {
                    if (params.newValue == null) {
                        return params.newValue;
                    }
                    // can be empty space with legacy copy
                    return params.newValue?.trim?.() === ''
                        ? null
                        : String(params.newValue).toLowerCase() === 'true'
                },
                valueFormatter: (params: ValueFormatterLiteParams<any, boolean>) => params.value == null ? '' : String(params.value),
                dataTypeMatcher: (value: any) => typeof value === 'boolean',
            },
            date: {
                baseDataType: 'date',
                valueParser: (params: ValueParserLiteParams<any, Date>) => parseDateTimeFromString(params.newValue == null ? null : String(params.newValue)),
                valueFormatter: (params: ValueFormatterLiteParams<any, Date>) => {
                    if (params.value == null) { return ''; }
                    if (!(params.value instanceof Date) || isNaN(params.value.getTime())) {
                        return translate('invalidDate', 'Invalid Date');
                    }
                    return serialiseDate(params.value, false) ?? '';
                },
                dataTypeMatcher: (value: any) => value instanceof Date,
            },
            dateString: {
                baseDataType: 'dateString',
                dateParser: (value: string | undefined) => parseDateTimeFromString(value) ?? undefined,
                dateFormatter: (value: Date | undefined) => serialiseDate(value ?? null, false) ?? undefined,
                valueParser: (params: ValueParserLiteParams<any, string>) => defaultDateFormatMatcher(String(params.newValue)) ? params.newValue : null,
                valueFormatter: (params: ValueFormatterLiteParams<any, string>) => defaultDateFormatMatcher(String(params.value)) ? params.value! : '',
                dataTypeMatcher: (value: any) => typeof value === 'string' && defaultDateFormatMatcher(value),
            },
            object: {
                baseDataType: 'object',
                valueParser: () => null,
                valueFormatter: (params: ValueFormatterLiteParams<any, any>) => toStringOrNull(params.value) ?? '',
            }
        }
    }
}
