import { Autowired, Bean, PostConstruct } from '../context/context';
import { BeanStub } from '../context/beanStub';
import { ColDef } from '../entities/colDef';
import {
    BooleanDataTypeDefinition,
    CoreDataTypeDefinition,
    DataTypeDefinition,
    DateDataTypeDefinition,
    DateStringDataTypeDefinition,
    DEFAULT_DATA_TYPES,
    NumberDataTypeDefinition,
    ObjectDataTypeDefinition,
    TextDataTypeDefinition,
} from '../entities/dataType';
import { IRowModel } from '../interfaces/iRowModel';
import { IClientSideRowModel } from '../interfaces/iClientSideRowModel';
import { Events } from '../eventKeys';
import { ColumnModel } from './columnModel';
import { iterateObject } from '../utils/object';

@Bean('dataTypeService')
export class DataTypeService extends BeanStub {
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('columnModel') private columnModel: ColumnModel;

    private dataTypeDefinitions: { [cellDataType: string]: DataTypeDefinition | CoreDataTypeDefinition } = {};

    @PostConstruct
    public init(): void {
        this.processDataTypeDefinitions();

        if (this.gridOptionsService.is('inferCellDataTypes') && !this.gridOptionsService.get('rowData')) {
            const destroyFunc = this.addManagedListener(this.eventService, Events.EVENT_ROW_DATA_UPDATED, () => {
                destroyFunc?.();
                setTimeout(() => {
                    // ensure event handled async
                    this.columnModel.recreateColumnDefs('rowDataUpdated');
                });
            });
        }
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
        if (this.isChildDataTypeDefinition(dataTypeDefinition)) {
            const extendsCellDataType = dataTypeDefinition.extends;
            if (dataTypeDefinition.extends === dataTypeDefinition.baseDataType) {
                const baseDataTypeDefinition = DEFAULT_DATA_TYPES[extendsCellDataType];
                if (
                    !baseDataTypeDefinition ||
                    baseDataTypeDefinition.baseDataType !== dataTypeDefinition.baseDataType
                ) {
                    // TODO - error
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
                    // TODO - error
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
        } else {
            // must be object
            mergedDataTypeDefinition = dataTypeDefinition;
        }

        return mergedDataTypeDefinition;
    }

    public updateColDefAndGetColumnType(
        colDef: ColDef,
        cellDataType: string | undefined,
        field: string | undefined
    ): string | string[] | undefined {
        if (!cellDataType) {
            if (this.gridOptionsService.is('inferCellDataTypes')) {
                cellDataType = this.inferCellDataType(field);
                if (!cellDataType) {
                    return undefined;
                }
            } else {
                return undefined;
            }
        }
        const dataTypeDefinition = this.dataTypeDefinitions[cellDataType];
        if (!dataTypeDefinition) {
            // TODO - warning
            return undefined;
        }
        colDef.cellDataType = cellDataType;
        if (dataTypeDefinition.valueFormatter) {
            colDef.valueFormatter = dataTypeDefinition.valueFormatter;
        }
        if (dataTypeDefinition.valueParser) {
            colDef.valueParser = dataTypeDefinition.valueParser;
        }
        return dataTypeDefinition.columnTypes;
    }

    private inferCellDataType(field: string | undefined): string | undefined {
        if (!field) {
            return undefined;
        }
        const rowData = this.gridOptionsService.get('rowData');
        let value: any;
        const hasValue = (rowValue: any) => {
            if (rowValue != null) {
                value = rowValue;
                return true;
            }
            return false;
        };
        if (rowData) {
            rowData.find((row) => hasValue(row[field]));
        } else if (this.rowModel.getType() === 'clientSide') {
            (this.rowModel as IClientSideRowModel)
                .getRootNode()
                .allLeafChildren?.find((rowNode) => hasValue(rowNode.data?.[field]));
        }
        if (value == null) {
            return undefined;
        } else if (typeof value === 'string') {
            const matcher = (this.dataTypeDefinitions.dateString as DateStringDataTypeDefinition).matcher!;
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
        return undefined;
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

    getConvertToDateFunction(): (value: string | undefined) => Date | undefined {
        return (this.dataTypeDefinitions.dateString as DateStringDataTypeDefinition).convertToDate!;
    }

    private isChildDataTypeDefinition<TData = any>(
        dataTypeDefinition: DataTypeDefinition<TData>
    ): dataTypeDefinition is
        | TextDataTypeDefinition<TData>
        | NumberDataTypeDefinition<TData>
        | BooleanDataTypeDefinition<TData>
        | DateDataTypeDefinition<TData>
        | DateStringDataTypeDefinition<TData> 
        | ObjectDataTypeDefinition<TData, any> {
        return (dataTypeDefinition as any).extends;
    }
}