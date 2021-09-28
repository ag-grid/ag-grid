import { IClientSideRowModel, IFilterParams, RowNode } from 'ag-grid-community';
export declare class ClientSideValuesExtractor {
    private readonly rowModel;
    private readonly filterParams;
    constructor(rowModel: IClientSideRowModel, filterParams: IFilterParams);
    extractUniqueValues(predicate: (node: RowNode) => boolean): (string | null)[];
}
