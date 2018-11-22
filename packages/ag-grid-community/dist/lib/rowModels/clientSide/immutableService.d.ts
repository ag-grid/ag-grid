// Type definitions for ag-grid-community v19.1.4
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { RowDataTransaction } from "./clientSideRowModel";
export declare class ImmutableService {
    private rowModel;
    private gridOptionsWrapper;
    private clientSideRowModel;
    private postConstruct;
    createTransactionForRowData(data: any[]): [RowDataTransaction, {
        [id: string]: number;
    }];
}
//# sourceMappingURL=immutableService.d.ts.map