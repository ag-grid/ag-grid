import { StageExecuteParams, BeanStub, IRowNodeStage } from "@ag-grid-community/core";
export declare class SortStage extends BeanStub implements IRowNodeStage {
    private sortService;
    private sortController;
    execute(params: StageExecuteParams): void;
}
