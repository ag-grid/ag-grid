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
