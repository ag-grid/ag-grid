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
    CoreDataTypeDefinition,
    DataTypeDefinition,
    DateStringDataTypeDefinition,
    ValueFormatterLiteParams,
    ValueParserLiteParams,
} from '../entities/dataType';
import { IRowModel } from '../interfaces/iRowModel';
import { IClientSideRowModel } from '../interfaces/iClientSideRowModel';
import { Events } from '../eventKeys';
import { ColumnModel } from './columnModel';
import { getValueUsingField } from '../utils/object';
import { ModuleRegistry } from '../modules/moduleRegistry';
import { ModuleNames } from '../modules/moduleNames';
import { ValueService } from '../valueService/valueService';
import { Column } from '../entities/column';
import { doOnce } from '../utils/function';
import { KeyCode } from '../constants/keyCode';
import { exists, toStringOrNull } from '../utils/generic';
import { ValueFormatterService } from '../rendering/valueFormatterService';
import { IRowNode } from '../interfaces/iRowNode';
import { parseDateTimeFromString, serialiseDate } from '../utils/date';

interface GroupSafeValueFormatter {
    groupSafeValueFormatter?: ValueFormatterFunc;
}

@Bean('dataTypeService')
export class DataTypeService extends BeanStub {
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('valueFormatterService') private valueFormatterService: ValueFormatterService;

    private dataTypeDefinitions: { [cellDataType: string]: (DataTypeDefinition | CoreDataTypeDefinition) & GroupSafeValueFormatter } = {};
    private dataTypeMatchers: { [cellDataType: string]: ((value: any) => boolean) | undefined };
    private isWaitingForRowData: boolean = false;
    private hasObjectValueParser: boolean;
    private hasObjectValueFormatter: boolean;

    @PostConstruct
    public init(): void {
        this.processDataTypeDefinitions();

        this.addManagedPropertyListener('dataTypeDefinitions', () => {
            this.processDataTypeDefinitions();
            this.columnModel.recreateColumnDefs('gridOptionsChanged');
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
        const dataTypeDefinitions = this.gridOptionsService.get('dataTypeDefinitions') ?? {};
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
        if (dataTypeDefinition.extendsDataType === dataTypeDefinition.baseDataType) {
            const baseDataTypeDefinition = defaultDataTypes[extendsCellDataType];
            if (!this.validateDataTypeDefinition(dataTypeDefinition, baseDataTypeDefinition, extendsCellDataType)) {
                return undefined;
            }
            mergedDataTypeDefinition = this.mergeDataTypeDefinitions(
                baseDataTypeDefinition,
                dataTypeDefinition
            );
        } else {
            if (alreadyProcessedDataTypes.includes(extendsCellDataType)) {
                doOnce(() => console.warn(
                    'AG Grid: Data type definition hierarchies (via the "extendsDataType" property) cannot contain circular references.'
                ), 'dataTypeExtendsCircularRef');
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
            doOnce(() => console.warn(
                `AG Grid: The data type definition ${parentCellDataType} does not exist.`
            ), 'dataTypeDefMissing' + parentCellDataType);
            return false;
        }
        if (parentDataTypeDefinition.baseDataType !== dataTypeDefinition.baseDataType) {
            doOnce(() => console.warn(
                'AG Grid: The "baseDataType" property of a data type definition must match that of its parent.'
            ), 'dataTypeBaseTypesMatch');
            return false;
        }
        return true;
    }

    private createGroupSafeValueFormatter(dataTypeDefinition: DataTypeDefinition | CoreDataTypeDefinition): ValueFormatterFunc | undefined {
        if (!dataTypeDefinition.valueFormatter) {
            return undefined;
        }
        return (params: ValueFormatterParams) => {
            if (params.node?.group || params.column.isRowGroupActive()) {
                const { aggFunc } = params.colDef;
                if (aggFunc && (
                    aggFunc === 'first' ||
                    aggFunc === 'last' ||
                    (
                        dataTypeDefinition.baseDataType === 'number' && (
                            aggFunc === 'sum' || aggFunc === 'min' || aggFunc === 'max' || aggFunc === 'avg'
                        )
                    )
                 )) {
                    return dataTypeDefinition.valueFormatter!(params);
                }
                return undefined as any;
            }
            return dataTypeDefinition.valueFormatter!(params);
        };
    }

    public updateColDefAndGetColumnType(
        colDef: ColDef,
        userColDef: ColDef,
        colId: string
    ): string[] | undefined {
        let { cellDataType } = userColDef;
        const { field } = userColDef;
        if (cellDataType === undefined) {
            cellDataType = colDef.cellDataType;
        }
        if ((cellDataType == null || cellDataType === true)) {
            cellDataType = this.canInferCellDataType(colDef, userColDef) ? this.inferCellDataType(field) : false;
        }
        if (!cellDataType) {
            colDef.cellDataType = false;
            return undefined;
        }
        const dataTypeDefinition = this.dataTypeDefinitions[cellDataType as string];
        if (!dataTypeDefinition) {
            doOnce(() => console.warn(
                `AG Grid: Missing data type definition - "${cellDataType}"`
            ), 'dataTypeMissing' + cellDataType);
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
        const columnTypes = userColDef.type ?? dataTypeDefinition.columnTypes ?? colDef.type;
        return columnTypes ? this.convertColumnTypes(columnTypes) : undefined;
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
            const columnTypeDefs = this.gridOptionsService.get('columnTypes') ?? {};
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

    private inferCellDataType(field: string | undefined): string | undefined {
        if (!field) {
            return undefined;
        }
        const rowData = this.gridOptionsService.get('rowData');
        let value: any;
        const fieldContainsDots = field.indexOf('.') >= 0 && !this.gridOptionsService.is('suppressFieldDotNotation');
        if (rowData?.length) {
            value = getValueUsingField(rowData[0], field, fieldContainsDots);
        } else {
            const rowNodes = (this.rowModel as IClientSideRowModel)
                .getRootNode()
                .allLeafChildren;
            if (rowNodes?.length) {
                value = getValueUsingField(rowNodes[0].data, field, fieldContainsDots);
            } else {
                this.initWaitForRowData();
            }
        }
        if (value == null) {
            return undefined;
        }
        const [cellDataType] = Object.entries(this.dataTypeMatchers).find(([_cellDataType, dataTypeMatcher]) => dataTypeMatcher!(value)) ?? ['object'];
        return cellDataType;
    }

    private initWaitForRowData(): void {
        if (this.isWaitingForRowData) {
            return;
        }
        this.isWaitingForRowData = true;
        const destroyFunc = this.addManagedListener(this.eventService, Events.EVENT_ROW_DATA_UPDATED, () => {
            destroyFunc?.();
            this.isWaitingForRowData = false;
            setTimeout(() => {
                // ensure event handled async
                this.columnModel.recreateColumnDefs('rowDataUpdated');
            });
        });
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
                console.warn("AG Grid: if colDef.type is supplied an array it should be of type 'string[]'");
            } else {
                typeKeys = type;
            }
        } else if (typeof type === 'string') {
            typeKeys = type.split(',');
        } else {
            console.warn("AG Grid: colDef.type should be of type 'string' | 'string[]'");
        }
        return typeKeys;
    }

    private getDateStringTypeDefinition(): DateStringDataTypeDefinition {
        return this.dataTypeDefinitions.dateString as DateStringDataTypeDefinition;
    }

    public getDateParserFunction(): (value: string | undefined) => Date | undefined {
        return this.getDateStringTypeDefinition().dateParser!;
    }

    public getDateFormatterFunction(): (value: Date | undefined) => string | undefined {
        return this.getDateStringTypeDefinition().dateFormatter!;
    }

    public checkType(column: Column, value: any): boolean {
        const colDef = column.getColDef();
        if (!colDef.cellDataType || value == null) {
            return true;
        }
        const dataTypeMatcher = this.dataTypeDefinitions[colDef.cellDataType as string]?.dataTypeMatcher;
        if (!dataTypeMatcher) {
            return true;
        }
        return dataTypeMatcher(value);
    }

    public validateColDef(colDef: ColDef): void {
        if (colDef.cellDataType === 'object') {
            if (colDef.valueFormatter === this.dataTypeDefinitions.object.groupSafeValueFormatter && !this.hasObjectValueFormatter) {
                doOnce(() => console.warn(
                    'AG Grid: Cell data type is "object" but no value formatter has been provided. Please either provide an object data type definition with a value formatter, or set "colDef.valueFormatter"'
                ), 'dataTypeObjectValueFormatter');
            }
            if (colDef.editable && colDef.valueParser === this.dataTypeDefinitions.object.valueParser && !this.hasObjectValueParser) {
                doOnce(() => console.warn(
                    'AG Grid: Cell data type is "object" but no value parser has been provided. Please either provide an object data type definition with a value parser, or set "colDef.valueParser"'
                ), 'dataTypeObjectValueParser');
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
            return this.valueFormatterService.formatValue(column, node, value, valueFormatter as any);
        }
        const usingSetFilter = ModuleRegistry.isRegistered(ModuleNames.SetFilterModule, this.context.getGridId());
        const translate = this.localeService.getLocaleTextFunc();
        colDef.useValueFormatterForExport = true;
        colDef.useValueParserForImport = true;
        switch (dataTypeDefinition.baseDataType) {
            case 'number': {
                colDef.cellEditor = 'agNumberCellEditor';
                if (usingSetFilter) {
                    colDef.filterParams = {
                        comparator: (a: string, b: string) => {
                            const valA = a == null ? 0 : parseInt(a);
                            const valB = b == null ? 0 : parseInt(b);
                            if (valA === valB) return 0;
                            return valA > valB ? 1 : -1;
                        },
                    };
                }
                break;
            }
            case 'boolean': {
                colDef.cellEditor = 'agCheckboxCellEditor';
                colDef.cellRenderer = 'agCheckboxCellRenderer';
                colDef.suppressKeyboardEvent = (params: SuppressKeyboardEventParams<any, boolean>) => !!params.colDef.editable && params.event.key === KeyCode.SPACE;
                if (usingSetFilter) {
                    colDef.filterParams = {
                        valueFormatter: (params: ValueFormatterParams) => {
                            if (!exists(params.value)) {
                                return translate('blanks', '(Blanks)');
                            }
                            return translate(String(params.value), params.value ? 'True' : 'False');
                        }
                    };
                } else {
                    colDef.filterParams = {
                        maxNumConditions: 1,
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
                    };
                }
                break;
            }
            case 'date': {
                colDef.cellEditor = 'agDateCellEditor';
                colDef.keyCreator = (params: KeyCreatorParams) => formatValue(params.column, params.node, params.value)!;
                if (usingSetFilter) {
                    colDef.filterParams = {
                        valueFormatter: (params: ValueFormatterParams) => {
                            const valueFormatted = formatValue(params.column, params.node, params.value);
                            return exists(valueFormatted) ? valueFormatted : translate('blanks', '(Blanks)');
                        }
                    };
                }
                break;
            }
            case 'dateString': {
                colDef.cellEditor = 'agDateStringCellEditor';
                colDef.keyCreator = (params: KeyCreatorParams) => formatValue(params.column, params.node, params.value)!;
                if (usingSetFilter) {
                    colDef.filterParams = {
                        valueFormatter: (params: ValueFormatterParams) => {
                            const valueFormatted = formatValue(params.column, params.node, params.value);
                            return exists(valueFormatted) ? valueFormatted : translate('blanks', '(Blanks)');
                        }
                    };
                } else {
                    const convertToDate = this.getDateParserFunction();
                    colDef.filterParams = {
                        comparator: (filterDate: Date, cellValue: string | undefined) => {
                            const cellAsDate = convertToDate(cellValue)!;
                            if (cellValue == null || cellAsDate < filterDate) { return -1; }
                            if (cellAsDate > filterDate) { return 1; }
                            return 0;
                        }
                    };
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
                    colDef.filterParams = {
                        valueFormatter: (params: ValueFormatterParams) => {
                            const valueFormatted = formatValue(params.column, params.node, params.value);
                            return exists(valueFormatted) ? valueFormatted : translate('blanks', '(Blanks)');
                        }
                    };
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
        const defaultDateFormatMatcher = (value: string) => !!value.match('\\d{4}-\\d{2}-\\d{2}');
        const translate = this.localeService.getLocaleTextFunc();
        return {
            number: {
                baseDataType: 'number',
                valueParser: (params: ValueParserLiteParams<any, number>) => params.newValue === '' ? null : Number(params.newValue),
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
                valueParser: (params: ValueParserLiteParams<any, boolean>) => params.newValue === '' ? null : String(params.newValue).toLowerCase() === 'true',
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
