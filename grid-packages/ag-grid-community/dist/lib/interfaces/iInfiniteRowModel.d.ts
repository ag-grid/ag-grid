import { IRowModel } from "./iRowModel";
import { IDatasource } from "./iDatasource";
export interface IInfiniteRowModel extends IRowModel {
    setDatasource(datasource: IDatasource | undefined): void;
    refreshCache(): void;
    purgeCache(): void;
    setRowCount(rowCount: number, maxRowFound?: boolean): void;
}
