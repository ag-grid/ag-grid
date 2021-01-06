import { StageExecuteParams, BeanStub } from "@ag-grid-community/core";
export declare class SortStage extends BeanStub {
    private sortService;
    private sortController;
    private columnController;
    execute(params: StageExecuteParams): void;
    private calculateDirtyNodes;
}
