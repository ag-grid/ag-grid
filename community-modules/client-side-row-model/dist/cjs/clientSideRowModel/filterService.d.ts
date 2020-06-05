import { ChangedPath, BeanStub } from "@ag-grid-community/core";
export declare class FilterService extends BeanStub {
    private filterManager;
    private gridOptionsWrapper;
    private doingTreeData;
    private postConstruct;
    filter(changedPath: ChangedPath): void;
    private filterNodes;
    private setAllChildrenCountTreeData;
    private setAllChildrenCountGridGrouping;
    private setAllChildrenCount;
    private doingTreeDataFiltering;
}
