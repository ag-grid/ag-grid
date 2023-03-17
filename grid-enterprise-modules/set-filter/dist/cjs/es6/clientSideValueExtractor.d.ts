import { ColumnModel, GetDataPath, IClientSideRowModel, SetFilterParams, RowNode, ValueService } from '@ag-grid-community/core';
/** @param V type of value in the Set Filter */
export declare class ClientSideValuesExtractor<V> {
    private readonly rowModel;
    private readonly filterParams;
    private readonly createKey;
    private readonly caseFormat;
    private readonly columnModel;
    private readonly valueService;
    private readonly treeDataOrGrouping;
    private readonly treeData;
    private readonly getDataPath?;
    constructor(rowModel: IClientSideRowModel, filterParams: SetFilterParams<any, V>, createKey: (value: V | null, node?: RowNode) => string | null, caseFormat: <T extends string | null>(valueToFormat: T) => typeof valueToFormat, columnModel: ColumnModel, valueService: ValueService, treeDataOrGrouping: boolean, treeData: boolean, getDataPath?: GetDataPath<any> | undefined);
    extractUniqueValues(predicate: (node: RowNode) => boolean, existingValues?: Map<string | null, V | null>): Map<string | null, V | null>;
    private addValueForConvertValuesToString;
    private addValueForTreeDataOrGrouping;
    private getValue;
    private extractExistingFormattedKeys;
}
