import { RowDataTransaction } from "./rowDataTransaction";

export interface IImmutableService {
    setRowData(data: any[]): void;
    isActive(): boolean;
}
