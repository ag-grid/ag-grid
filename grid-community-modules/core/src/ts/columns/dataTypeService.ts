import { Autowired, Bean, PostConstruct } from '../context/context';
import { BeanStub } from '../context/beanStub';
import {
    ColDef,
    KeyCreatorParams,
    SuppressKeyboardEventParams,
    ValueFormatterParams,
    ValueGetterParams,
} from '../entities/colDef';
import {
    CoreDataTypeDefinition,
    DataTypeDefinition,
    DateStringDataTypeDefinition,
    DEFAULT_DATA_TYPES,
    DataTypeCheckerParams,
} from '../entities/dataType';
import { IRowModel } from '../interfaces/iRowModel';
import { IClientSideRowModel } from '../interfaces/iClientSideRowModel';
import { Events } from '../eventKeys';
import { ColumnModel } from './columnModel';
import { getValueUsingField, iterateObject } from '../utils/object';
import { ModuleRegistry } from '../modules/moduleRegistry';
import { ModuleNames } from '../modules/moduleNames';
import { ValueService } from '../valueService/valueService';
import { Column } from '../entities/column';
import { doOnce } from '../utils/function';
import { KeyCode } from '../constants/keyCode';

@Bean('dataTypeService')
export class DataTypeService extends BeanStub {
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('valueService') private valueService: ValueService;

    private dataTypeDefinitions: { [cellDataType: string]: DataTypeDefinition | CoreDataTypeDefinition } = {};
    private isWaitingForRowData = false;

    @PostConstruct
    public init(): void {
        this.processDataTypeDefinitions();

        this.addManagedPropertyListener('dataTypeDefinitions', () => {
            this.processDataTypeDefinitions();
            this.columnModel.recreateColumnDefs('gridOptionsChanged');
        });
    }

    private processDataTypeDefinitions(): void {
        this.dataTypeDefinitions = { ...DEFAULT_DATA_TYPES };
        const dataTypeDefinitions = this.gridOptionsService.get('dataTypeDefinitions') ?? {};

        iterateObject(dataTypeDefinitions, (cellDataType: string, dataTypeDefinition: DataTypeDefinition) => {
            const mergedDataTypeDefinition = this.processDataTypeDefinition(dataTypeDefinition, dataTypeDefinitions);
            if (mergedDataTypeDefinition) {
                this.dataTypeDefinitions[cellDataType] = mergedDataTypeDefinition;
            }
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
        dataTypeDefinitions: { [key: string]: DataTypeDefinition }
    ): DataTypeDefinition | undefined {
        let mergedDataTypeDefinition: DataTypeDefinition;
        const extendsCellDataType = dataTypeDefinition.extends;
        if (dataTypeDefinition.extends === dataTypeDefinition.baseDataType) {
            const baseDataTypeDefinition = DEFAULT_DATA_TYPES[extendsCellDataType];
            if (
                !baseDataTypeDefinition ||
                baseDataTypeDefinition.baseDataType !== dataTypeDefinition.baseDataType
            ) {
                this.warnBaseDataTypesUnmatching();
                return undefined;
            }
            mergedDataTypeDefinition = this.mergeDataTypeDefinitions(
                baseDataTypeDefinition,
                dataTypeDefinition
            );
        } else {
            const extendedDataTypeDefinition = dataTypeDefinitions[extendsCellDataType];
            if (
                !extendedDataTypeDefinition ||
                extendedDataTypeDefinition.baseDataType !== dataTypeDefinition.baseDataType
            ) {
                this.warnBaseDataTypesUnmatching();
                return undefined;
            }
            const mergedExtendedDataTypeDefinition = this.processDataTypeDefinition(
                extendedDataTypeDefinition,
                dataTypeDefinitions
            );
            if (!mergedExtendedDataTypeDefinition) {
                return undefined;
            }
            mergedDataTypeDefinition = this.mergeDataTypeDefinitions(
                mergedExtendedDataTypeDefinition,
                dataTypeDefinition
            );
        }

        return mergedDataTypeDefinition;
    }

    private warnBaseDataTypesUnmatching(): void {
        doOnce(() => console.warn(
            'AG Grid: The "baseDataType" property of a data type definition must match that of its parent.'
        ), 'dataTypeBaseTypesMatch');
    }

    public updateColDefAndGetColumnType(
        colDef: ColDef,
        cellDataType: string | undefined,
        field: string | undefined
    ): string | string[] | undefined {
        cellDataType = cellDataType ?? colDef.cellDataType;
        if (!cellDataType) {
            return undefined;
        }
        if (cellDataType === 'auto') {
            cellDataType = this.inferCellDataType(field);
            if (!cellDataType) {
                return undefined;
            }
        }
        const dataTypeDefinition = this.dataTypeDefinitions[cellDataType];
        if (!dataTypeDefinition) {
            doOnce(() => console.warn(
                `AG Grid: Missing data type definition - "${cellDataType}"`
            ), 'dataTypeMissing' + cellDataType);
            return undefined;
        }
        colDef.cellDataType = cellDataType;
        if (dataTypeDefinition.valueFormatter) {
            colDef.valueFormatter = (params: ValueFormatterParams) => {
                return params.node?.group || params.column.isRowGroupActive() ? undefined as any : dataTypeDefinition.valueFormatter!(params as any);
            }
        }
        if (dataTypeDefinition.valueParser) {
            colDef.valueParser = dataTypeDefinition.valueParser;
        }
        if (!dataTypeDefinition.suppressDefaultProperties) {
            this.setColDefPropertiesForBaseDataType(colDef, dataTypeDefinition);
        }
        return dataTypeDefinition.columnTypes;
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
        } else if (this.rowModel.getType() === 'clientSide') {
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
        } else if (typeof value === 'string') {
            const matcher = (this.dataTypeDefinitions.dateString as DateStringDataTypeDefinition).dateMatcher!;
            if (matcher(value)) {
                return 'dateString';
            } else {
                return 'text';
            }
        } else if (typeof value === 'number') {
            return 'number';
        } else if (typeof value === 'boolean') {
            return 'boolean';
        } else if (value instanceof Date) {
            return 'date';
        }
        return 'object';
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
        if (!colDef.cellDataType) {
            return true;
        }
        const typeChecker = this.dataTypeDefinitions[colDef.cellDataType]?.dataTypeChecker;
        if (!typeChecker) {
            return true;
        }
        const params: DataTypeCheckerParams<any, any> = {
            value,
            colDef: column.getColDef(),
            column: column,
            api: this.gridOptionsService.api,
            columnApi: this.gridOptionsService.columnApi,
            context: this.gridOptionsService.context
        };
        return typeChecker(params);
    }

    private setColDefPropertiesForBaseDataType(colDef: ColDef, dataTypeDefinition: DataTypeDefinition | CoreDataTypeDefinition): void {
        const usingSetFilter = ModuleRegistry.isRegistered(ModuleNames.SetFilterModule);
        const translate = this.localeService.getLocaleTextFunc();
        switch (dataTypeDefinition.baseDataType) {
            case 'number': {
                colDef.headerClass = 'ag-right-aligned-header';
                colDef.cellClass = 'ag-right-aligned-cell';
                colDef.cellEditor = 'agNumberCellEditor';
                colDef.keyCreator = (params: KeyCreatorParams) => dataTypeDefinition.valueFormatter!(params);
                if (usingSetFilter) {
                    colDef.filterParams = {
                        valueFormatter: (params: ValueFormatterParams) => {
                            const valueFormatted = dataTypeDefinition.valueFormatter!(params);
                            return valueFormatted === '' ? translate('blanks', '(Blanks)') : valueFormatted;
                        }
                    };
                }
                colDef.useValueFormatterForExport = true;
                colDef.useValueParserForImport = true;
                break;
            }
            case 'boolean': {
                colDef.cellEditor = 'agCheckboxCellEditor';
                colDef.cellRenderer = 'agCheckboxCellRenderer';
                colDef.suppressKeyboardEvent = (params: SuppressKeyboardEventParams<any, boolean>) => !!params.colDef.editable && params.event.key === KeyCode.SPACE;
                if (usingSetFilter) {
                    colDef.filterParams = {
                        valueFormatter: (params: ValueFormatterParams) => {
                            if (params.value == null) {
                                return translate('blanks', '(Blanks)');
                            }
                            const value = String(params.value);
                            return translate(value, value);
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
                colDef.useValueFormatterForExport = true;
                colDef.useValueParserForImport = true;
                break;
            }
            case 'date': {
                colDef.cellEditor = 'agDateCellEditor';
                colDef.keyCreator = (params: KeyCreatorParams) => dataTypeDefinition.valueFormatter!(params);
                if (usingSetFilter) {
                    colDef.filterParams = {
                        valueFormatter: (params: ValueFormatterParams) => {
                            const valueFormatted = dataTypeDefinition.valueFormatter!(params);
                            return valueFormatted === '' ? translate('blanks', '(Blanks)') : valueFormatted;
                        }
                    };
                }
                colDef.useValueFormatterForExport = true;
                colDef.useValueParserForImport = true;
                break;
            }
            case 'dateString': {
                colDef.cellEditor = 'agDateStringCellEditor';
                colDef.keyCreator = (params: KeyCreatorParams) => dataTypeDefinition.valueFormatter!(params);
                if (usingSetFilter) {
                    colDef.filterParams = {
                        valueFormatter: (params: ValueFormatterParams) => {
                            const valueFormatted = dataTypeDefinition.valueFormatter!(params);
                            return valueFormatted === '' ? translate('blanks', '(Blanks)') : valueFormatted;
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
                colDef.useValueFormatterForExport = true;
                colDef.useValueParserForImport = true;
                break;
            }
            case 'object': {
                colDef.cellEditorParams = {
                    useFormatter: true,
                };
                colDef.keyCreator = (params: KeyCreatorParams) => dataTypeDefinition.valueFormatter!(params);
                if (usingSetFilter) {
                    colDef.filterParams = {
                        valueFormatter: (params: ValueFormatterParams) => {
                            const valueFormatted = dataTypeDefinition.valueFormatter!(params);
                            return valueFormatted === '' ? translate('blanks', '(Blanks)') : valueFormatted;
                        }
                    };
                } else {
                    colDef.filterValueGetter = (params: ValueGetterParams) => dataTypeDefinition.valueFormatter!({
                        ...params,
                        value: this.valueService.getValue(params.column, params.node)
                    });
                }
                colDef.useValueFormatterForExport = true;
                colDef.useValueParserForImport = true;
                break;
            }
        }
    }
}
