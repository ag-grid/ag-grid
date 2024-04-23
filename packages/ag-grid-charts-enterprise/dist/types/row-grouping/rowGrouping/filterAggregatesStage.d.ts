import { IRowNodeStage, StageExecuteParams, BeanStub } from "ag-grid-community";
export declare class FilterAggregatesStage extends BeanStub implements IRowNodeStage {
    private filterManager;
    private columnModel;
    execute(params: StageExecuteParams): void;
    private setAllChildrenCountTreeData;
    private setAllChildrenCountGridGrouping;
    private setAllChildrenCount;
}
