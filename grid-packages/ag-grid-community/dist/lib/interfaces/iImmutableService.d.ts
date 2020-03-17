import { RowDataTransaction } from "./rowDataTransaction";
export interface IImmutableService {
    createTransactionForRowData(data: any[]): ([RowDataTransaction, {
        [id: string]: number;
    }]) | undefined;
}
