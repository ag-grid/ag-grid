var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Bean, BeanStub } from "@ag-grid-community/core";
let FilterService = class FilterService extends BeanStub {
    filter(changedPath) {
        const filterActive = this.filterManager.isColumnFilterPresent()
            || this.filterManager.isQuickFilterPresent()
            || this.filterManager.isExternalFilterPresent();
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
            }
            else {
                rowNode.childrenAfterFilter = rowNode.childrenAfterGroup;
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
    doingTreeDataFiltering() {
        return this.gridOptionsService.isTreeData() && !this.gridOptionsService.is('excludeChildrenWhenTreeDataFiltering');
    }
};
__decorate([
    Autowired('filterManager')
], FilterService.prototype, "filterManager", void 0);
FilterService = __decorate([
    Bean("filterService")
], FilterService);
export { FilterService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsdGVyU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jbGllbnRTaWRlUm93TW9kZWwvZmlsdGVyU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPLEVBQ0gsU0FBUyxFQUNULElBQUksRUFJSixRQUFRLEVBQ1gsTUFBTSx5QkFBeUIsQ0FBQztBQUdqQyxJQUFhLGFBQWEsR0FBMUIsTUFBYSxhQUFjLFNBQVEsUUFBUTtJQUloQyxNQUFNLENBQUMsV0FBd0I7UUFDbEMsTUFBTSxZQUFZLEdBQVksSUFBSSxDQUFDLGFBQWEsQ0FBQyxxQkFBcUIsRUFBRTtlQUN6QyxJQUFJLENBQUMsYUFBYSxDQUFDLG9CQUFvQixFQUFFO2VBQ3pDLElBQUksQ0FBQyxhQUFhLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztRQUM1RSxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksRUFBRSxXQUFXLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBRU8sV0FBVyxDQUFDLFlBQXFCLEVBQUUsV0FBd0I7UUFFL0QsTUFBTSxjQUFjLEdBQUcsQ0FBQyxPQUFnQixFQUFFLGlCQUEwQixFQUFFLEVBQUU7WUFDcEUsOERBQThEO1lBQzlELElBQUksT0FBTyxDQUFDLFdBQVcsRUFBRSxFQUFFO2dCQUV2Qix3R0FBd0c7Z0JBQ3hHLElBQUksWUFBWSxJQUFJLENBQUMsaUJBQWlCLEVBQUU7b0JBQ3BDLE9BQU8sQ0FBQyxtQkFBbUIsR0FBRyxPQUFPLENBQUMsa0JBQW1CLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFFO3dCQUN6RSx3RUFBd0U7d0JBQ3hFLHVEQUF1RDt3QkFDdkQsTUFBTSxtQkFBbUIsR0FBRyxTQUFTLENBQUMsbUJBQW1CLElBQUksU0FBUyxDQUFDLG1CQUFtQixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7d0JBRXRHLDBFQUEwRTt3QkFDMUUsNkJBQTZCO3dCQUM3QixNQUFNLHFCQUFxQixH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