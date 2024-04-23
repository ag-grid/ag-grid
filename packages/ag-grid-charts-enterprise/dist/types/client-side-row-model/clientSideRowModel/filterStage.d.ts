import { IRowNodeStage, StageExecuteParams, BeanStub } from "ag-grid-community";
export declare class FilterStage extends BeanStub implements IRowNodeStage {
    private filterService;
    execute(params: StageExecuteParams): void;
}
