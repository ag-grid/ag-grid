import {RowNodeTransaction} from "./rowNodeTransaction";

export interface RefreshModelParams {
    // how much of the pipeline to execute
    step: number;
    // what state to reset the groups back to after the refresh
    groupState?: any;
    // if NOT new data, then this flag tells grid to check if rows already
    // exist for the nodes (matching by node id) and reuses the row if it does.
    keepRenderedRows?: boolean;
    // if true, rows that are kept are animated to the new position
    animate?: boolean;
    // if true, then rows we are editing will be kept
    keepEditingRows?: boolean;
    // if doing delta updates, this has the changes that were done
    rowNodeTransactions?: (RowNodeTransaction | null)[];
    // if doing delta updates, this has the order of the nodes
    rowNodeOrder?: { [id: string]: number };
    // true user called setRowData() (or a new page in pagination). the grid scrolls
    // back to the top when this is true.
    newData?: boolean;
    // true if this update is due to columns changing, ie no rows were changed
    afterColumnsChanged?: boolean;
}
