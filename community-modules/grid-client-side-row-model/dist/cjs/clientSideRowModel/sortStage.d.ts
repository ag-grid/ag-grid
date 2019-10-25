import { StageExecuteParams } from "@ag-community/grid-core";
export declare class SortStage {
    private gridOptionsWrapper;
    private sortService;
    private sortController;
    private columnController;
    execute(params: StageExecuteParams): void;
    private calculateDirtyNodes;
}
