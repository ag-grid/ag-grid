import { IClientSideRowModel, RowNode, ColDef } from '@ag-grid-community/core';
export declare class ClientSideValuesExtractor {
    private readonly rowModel;
    private readonly colDef;
    private readonly valueGetter;
    constructor(rowModel: IClientSideRowModel, colDef: ColDef, valueGetter: (node: RowNode) => string);
    extractUniqueValues(predicate: (node: RowNode) => boolean): string[];
}
