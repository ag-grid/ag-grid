import { AgPromise, ColumnModel, GetDataPath, IClientSideRowModel, SetFilterParams, RowNode, ValueService } from 'ag-grid-community';
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
    private readonly getDataPath;
    private readonly groupAllowUnbalanced;
    private readonly addManagedListener;
    constructor(rowModel: IClientSideRowModel, filterParams: SetFilterParams<any, V>, createKey: (value: V | null | undefined, node?: RowNode) => string | null, caseFormat: <T extends string | null>(valueToFormat: T) => typeof valueToFormat, columnModel: ColumnModel, valueService: ValueService, treeDataOrGrouping: boolean, treeData: boolean, getDataPath: GetDataPath | undefined, groupAllowUnbalanced: boolean, addManagedListener: (event: string, listener: (event?: any) => void) => (() => null) | undefined);
    extractUniqueValuesAsync(predicate: (node: RowNode) => boolean, existingValues?: Map<string | null, V | null>): AgPromise<Map<string | null, V | null>>;
    extractUniqueValues(predicate: (node: RowNode) => boolean, existingValues?: Map<string | null, V | null>): Map<string | null, V | null>;
    private addValueForConvertValuesToString;
    private addValueForTreeDataOrGrouping;
    private getValue;
    private extractExistingFormattedKeys;
}
