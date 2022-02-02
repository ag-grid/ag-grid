import { IClientSideRowModel, ISetFilterParams, RowNode } from '@ag-grid-community/core';
export declare class ClientSideValuesExtractor {
    private readonly rowModel;
    private readonly filterParams;
    private readonly caseFormat;
    private readonly caseSensitive;
    constructor(rowModel: IClientSideRowModel, filterParams: ISetFilterParams, caseFormat: <T extends string | null>(valueToFormat: T) => typeof valueToFormat);
    extractUniqueValues(predicate: (node: RowNode) => boolean): (string | null)[];
}
