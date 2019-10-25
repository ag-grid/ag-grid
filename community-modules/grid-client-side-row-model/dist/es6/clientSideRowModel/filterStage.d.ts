import { IRowNodeStage, StageExecuteParams } from "@ag-community/grid-core";
export declare class FilterStage implements IRowNodeStage {
    private gridOptionsWrapper;
    private selectableService;
    private filterService;
    execute(params: StageExecuteParams): void;
}
