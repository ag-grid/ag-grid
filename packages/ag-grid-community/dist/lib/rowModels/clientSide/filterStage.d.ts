import { IRowNodeStage, StageExecuteParams } from "../../interfaces/iRowNodeStage";
export declare class FilterStage implements IRowNodeStage {
    private gridOptionsWrapper;
    private selectableService;
    private filterService;
    execute(params: StageExecuteParams): void;
}
