import { Autowired, Bean, PostConstruct } from "../context/context";
import { RowNode } from "../entities/rowNode";
import { FilterManager } from "../filter/filterManager";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { ChangedPath } from "../rowModels/clientSide/changedPath";

@Bean("filterService")
export class FilterService {

    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private doingTreeData: boolean;

    @PostConstruct
    private postConstruct(): void {
        this.doingTreeData = this.gridOptionsWrapper.isTreeData();
    }

    public filter(changedPath: ChangedPath): void {
        const filterActive: boolean = this.filterManager.isAnyFilterPresent();
        this.filterNodes(filterActive, changedPath);
    }

    private filterNodes(filterActive: boolean, changedPath: ChangedPath): void {

        const filterCallback = (rowNode: RowNode, includeChildNodes: boolean) => {
            // recursively get all children that are groups to also filter
            if (rowNode.hasChildren()) {

                // result of filter for this node. when filtering tree data, includeChildNodes = true when parent passes
                if (filterActive && !includeChildNodes) {
                    rowNode.childrenAfterFilter = rowNode.childrenAfterGroup.filter(childNode => {
                        // a group is included in the result if it has any children of it's own.
                        // by this stage, the child groups are already filtered
                        const passBecauseChildren = childNode.childrenAfterFilter && childNode.childrenAfterFilter.length > 0;

                        // both leaf level nodes and tree data nodes have data. these get added if
                        // the data passes the filter
                        const passBecauseDataPasses = childNode.data && this.filterManager.doesRowPassFilter(childNode);

                        // note - tree data nodes pass either if a) they pass themselves or b) any children of that node pass

                        return passBecauseChildren || passBecauseDataPasses;
                    });
                } else {
                    // if not filtering, the result is the original list
                    rowNode.childrenAfterFilter = rowNode.childrenAfterGroup;
                }

                this.setAllChildrenCount(rowNode);

            } else {
                rowNode.childrenAfterFilter = rowNode.childrenAfterGroup;
                rowNode.setAllChildrenCount(null);
            }
        };

        if (this.doingTreeDataFiltering()) {

            const treeDataDepthFirstFilter = (rowNode: RowNode, alreadyFoundInParent: boolean) => {
                // tree data filter traverses the hierarchy depth first and includes child nodes if parent passes
                // filter, and parent nodes will be include if any children exist.

                if (rowNode.childrenAfterGroup) {
                    for (let i = 0; i < rowNode.childrenAfterGroup.length; i++) {
                        const childNode = rowNode.childrenAfterGroup[i];

                        // first check if current node passes filter before invoking child nodes
                        const foundInParent = alreadyFoundInParent || this.filterManager.doesRowPassFilter(childNode);
                        if (childNode.childrenAfterGroup) {
                            treeDataDepthFirstFilter(rowNode.childrenAfterGroup[i], foundInParent);
                        } else {
                            filterCallback(childNode, foundInParent);
                        }
                    }
                }
                filterCallback(rowNode, alreadyFoundInParent);
            };

            const treeDataFilterCallback = (rowNode: RowNode) => treeDataDepthFirstFilter(rowNode, false);
            changedPath.executeFromRootNode(treeDataFilterCallback);
        } else {

            const defaultFilterCallback = (rowNode: RowNode) => filterCallback(rowNode, false);
            changedPath.forEachChangedNodeDepthFirst(defaultFilterCallback, true);
        }
    }

    private setAllChildrenCountTreeData(rowNode: RowNode) {
        // for tree data, we include all children, groups and leafs
        let allChildrenCount = 0;
        rowNode.childrenAfterFilter.forEach((child: RowNode) => {
            // include child itself
            allChildrenCount++;
            // include children of children
            allChildrenCount += child.allChildrenCount as any;
        });
        rowNode.setAllChildrenCount(allChildrenCount);
    }

    private setAllChildrenCountGridGrouping(rowNode: RowNode) {
        // for grid data, we only count the leafs
        let allChildrenCount = 0;
        rowNode.childrenAfterFilter.forEach((child: RowNode) => {
            if (child.group) {
                allChildrenCount += child.allChildrenCount as any;
            } else {
                allChildrenCount++;
            }
        });
        rowNode.setAllChildrenCount(allChildrenCount);
    }

    private setAllChildrenCount(rowNode: RowNode) {
        if (this.doingTreeData) {
            this.setAllChildrenCountTreeData(rowNode);
        } else {
            this.setAllChildrenCountGridGrouping(rowNode);
        }
    }

    private doingTreeDataFiltering() {
        return this.gridOptionsWrapper.isTreeData() && !this.gridOptionsWrapper.isExcludeChildrenWhenTreeDataFiltering();
    }
}