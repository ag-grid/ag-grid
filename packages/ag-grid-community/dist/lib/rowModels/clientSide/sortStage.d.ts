import { StageExecuteParams } from "../../interfaces/iRowNodeStage";
export declare class SortStage {
    private gridOptionsWrapper;
    private sortService;
    private sortController;
    private columnController;
    execute(params: StageExecuteParams): void;
    private calculateDirtyNodes;
}
