// Type definitions for @ag-grid-community/core v28.1.1
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { IRowModel } from "./iRowModel";
import { IDatasource } from "./iDatasource";
export interface IInfiniteRowModel extends IRowModel {
    setDatasource(datasource: IDatasource | undefined): void;
    refreshCache(): void;
    purgeCache(): void;
    setRowCount(rowCount: number, maxRowFound?: boolean): void;
}
