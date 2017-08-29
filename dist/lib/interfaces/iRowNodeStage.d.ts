// Type definitions for ag-grid v12.0.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { RowNode } from "../entities/rowNode";
import { RowNodeTransaction } from "../rowModels/inMemory/inMemoryRowModel";
import { ChangedPath } from "../rowModels/inMemory/changedPath";
export interface StageExecuteParams {
    rowNode: RowNode;
    rowNodeTransaction?: RowNodeTransaction;
    changedPath?: ChangedPath;
}
export interface IRowNodeStage {
    execute(params: StageExecuteParams): any;
}
