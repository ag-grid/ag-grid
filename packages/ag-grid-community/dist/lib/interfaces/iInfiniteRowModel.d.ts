import { IRowModel } from "./iRowModel";
import { IDatasource } from "./iDatasource";
import { RowDataTransaction } from "./rowDataTransaction";
export interface IInfiniteRowModel extends IRowModel {
    setDatasource(datasource: IDatasource | undefined): void;
    updateRowData(transaction: RowDataTransaction): void;
    refreshCache(): void;
    purgeCache(): void;
    getVirtualRowCount(): number | null;
    isMaxRowFound(): boolean | undefined;
    setVirtualRowCount(rowCount: number, maxRowFound?: boolean): void;
    getBlockState(): any;
}
