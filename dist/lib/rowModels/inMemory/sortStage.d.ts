// Type definitions for ag-grid v15.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { StageExecuteParams } from "../../interfaces/iRowNodeStage";
export declare class SortStage {
    private gridOptionsWrapper;
    private sortService;
    execute(params: StageExecuteParams): void;
}
