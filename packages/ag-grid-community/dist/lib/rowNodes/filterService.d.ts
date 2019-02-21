import { ChangedPath } from "../rowModels/clientSide/changedPath";
export declare class FilterService {
    private filterManager;
    private gridOptionsWrapper;
    private doingTreeData;
    private postConstruct;
    filter(changedPath: ChangedPath): void;
    private filterNode;
    private setAllChildrenCountTreeData;
    private setAllChildrenCountGridGrouping;
    private setAllChildrenCount;
}
