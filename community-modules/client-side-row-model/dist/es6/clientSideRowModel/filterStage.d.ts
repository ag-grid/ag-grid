import { IRowNodeStage, StageExecuteParams, BeanStub } from "@ag-grid-community/core";
export declare class FilterStage extends BeanStub implements IRowNodeStage {
    private gridOptionsWrapper;
    private selectableService;
    private filterService;
    execute(params: StageExecuteParams): void;
}
