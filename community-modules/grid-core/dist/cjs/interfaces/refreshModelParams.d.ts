// Type definitions for @ag-grid-community/core v22.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { RowNodeTransaction } from "./rowNodeTransaction";
export interface RefreshModelParams {
    step: number;
    groupState?: any;
    keepRenderedRows?: boolean;
    animate?: boolean;
    keepEditingRows?: boolean;
    rowNodeTransactions?: (RowNodeTransaction | null)[];
    rowNodeOrder?: {
        [id: string]: number;
    };
    newData?: boolean;
    afterColumnsChanged?: boolean;
}
