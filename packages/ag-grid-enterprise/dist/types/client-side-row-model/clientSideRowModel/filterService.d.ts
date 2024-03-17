import { ChangedPath, BeanStub } from "ag-grid-community";
export declare class FilterService extends BeanStub {
    private filterManager;
    filter(changedPath: ChangedPath): void;
    private filterNodes;
    private doingTreeDataFiltering;
}
