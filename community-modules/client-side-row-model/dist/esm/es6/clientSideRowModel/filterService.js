var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Bean, PostConstruct, BeanStub } from "@ag-grid-community/core";
let FilterService = class FilterService extends BeanStub {
    postConstruct() {
        this.doingTreeData = this.gridOptionsWrapper.isTreeData();
    }
    filter(changedPath) {
        const filterActive = this.filterManager.isAnyFilterPresent();
        this.filterNodes(filterActive, changedPath);
    }
    filterNodes(filterActive, changedPath) {
        const filterCallback = (rowNode, includeChildNodes) => {
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
                        const passBecauseDataPasses = childNode.data
                            && this.filterManager.doesRowPassFilter({ rowNode: childNode });
                        // note - tree data nodes pass either if a) they pass themselves or b) any children of that node pass
                        return passBecauseChildren || passBecauseDataPasses;
                    });
                }
                else {
                    // if not filtering, the result is the original list
                    rowNode.childrenAfterFilter = rowNode.childrenAfterGroup;
                }
                this.setAllChildrenCount(rowNode);
            }
            else {
                rowNode.childrenAfterFilter = rowNode.childrenAfterGroup;
                rowNode.setAllChildrenCount(null);
            }
            if (rowNode.sibling) {
                rowNode.sibling.childrenAfterFilter = rowNode.childrenAfterFilter;
            }
        };
        if (this.doingTreeDataFiltering()) {
            const treeDataDepthFirstFilter = (rowNode, alreadyFoundInParent) => {
                // tree data filter traverses the hierarchy depth first and includes child nodes if parent passes
                // filter, and parent nodes will be include if any children exist.
                if (rowNode.childrenAfterGroup) {
                    for (let i = 0; i < rowNode.childrenAfterGroup.length; i++) {
                        const childNode = rowNode.childrenAfterGroup[i];
                        // first check if current node passes filter before invoking child nodes
                        const foundInParent = alreadyFoundInParent
                            || this.filterManager.doesRowPassFilter({ rowNode: childNode });
                        if (childNode.childrenAfterGroup) {
                            treeDataDepthFirstFilter(rowNode.childrenAfterGroup[i], foundInParent);
                        }
                        else {
                            filterCallback(childNode, foundInParent);
                        }
                    }
                }
                filterCallback(rowNode, alreadyFoundInParent);
            };
            const treeDataFilterCallback = (rowNode) => treeDataDepthFirstFilter(rowNode, false);
            changedPath.executeFromRootNode(treeDataFilterCallback);
        }
        else {
            const defaultFilterCallback = (rowNode) => filterCallback(rowNode, false);
            changedPath.forEachChangedNodeDepthFirst(defaultFilterCallback, true);
        }
    }
    setAllChildrenCountTreeData(rowNode) {
        // for tree data, we include all children, groups and leafs
        let allChildrenCount = 0;
        rowNode.childrenAfterFilter.forEach((child) => {
            // include child itself
            allChildrenCount++;
            // include children of children
            allChildrenCount += child.allChildrenCount;
        });
        rowNode.setAllChildrenCount(allChildrenCount);
    }
    setAllChildrenCountGridGrouping(rowNode) {
        // for grid data, we only count the leafs
        let allChildrenCount = 0;
        rowNode.childrenAfterFilter.forEach((child) => {
            if (child.group) {
                allChildrenCount += child.allChildrenCount;
            }
            else {
                allChildrenCount++;
            }
        });
        rowNode.setAllChildrenCount(allChildrenCount);
    }
    setAllChildrenCount(rowNode) {
        if (this.doingTreeData) {
            this.setAllChildrenCountTreeData(rowNode);
        }
        else {
            this.setAllChildrenCountGridGrouping(rowNode);
        }
    }
    doingTreeDataFiltering() {
        return this.gridOptionsWrapper.isTreeData() && !this.gridOptionsWrapper.isExcludeChildrenWhenTreeDataFiltering();
    }
};
__decorate([
    Autowired('filterManager')
], FilterService.prototype, "filterManager", void 0);
__decorate([
    PostConstruct
], FilterService.prototype, "postConstruct", null);
FilterService = __decorate([
    Bean("filterService")
], FilterService);
export { FilterService };
//# sourceMappingURL=filterService.js.map