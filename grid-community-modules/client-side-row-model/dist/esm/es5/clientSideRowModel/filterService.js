var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Bean, BeanStub } from "@ag-grid-community/core";
var FilterService = /** @class */ (function (_super) {
    __extends(FilterService, _super);
    function FilterService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FilterService.prototype.filter = function (changedPath) {
        var filterActive = this.filterManager.isColumnFilterPresent()
            || this.filterManager.isQuickFilterPresent()
            || this.filterManager.isExternalFilterPresent();
        this.filterNodes(filterActive, changedPath);
    };
    FilterService.prototype.filterNodes = function (filterActive, changedPath) {
        var _this = this;
        var filterCallback = function (rowNode, includeChildNodes) {
            // recursively get all children that are groups to also filter
            if (rowNode.hasChildren()) {
                // result of filter for this node. when filtering tree data, includeChildNodes = true when parent passes
                if (filterActive && !includeChildNodes) {
                    rowNode.childrenAfterFilter = rowNode.childrenAfterGroup.filter(function (childNode) {
                        // a group is included in the result if it has any children of it's own.
                        // by this stage, the child groups are already filtered
                        var passBecauseChildren = childNode.childrenAfterFilter && childNode.childrenAfterFilter.length > 0;
                        // both leaf level nodes and tree data nodes have data. these get added if
                        // the data passes the filter
                        var passBecauseDataPasses = childNode.data
                            && _this.filterManager.doesRowPassFilter({ rowNode: childNode });
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
            var treeDataDepthFirstFilter_1 = function (rowNode, alreadyFoundInParent) {
                // tree data filter traverses the hierarchy depth first and includes child nodes if parent passes
                // filter, and parent nodes will be include if any children exist.
                if (rowNode.childrenAfterGroup) {
                    for (var i = 0; i < rowNode.childrenAfterGroup.length; i++) {
                        var childNode = rowNode.childrenAfterGroup[i];
                        // first check if current node passes filter before invoking child nodes
                        var foundInParent = alreadyFoundInParent
                            || _this.filterManager.doesRowPassFilter({ rowNode: childNode });
                        if (childNode.childrenAfterGroup) {
                            treeDataDepthFirstFilter_1(rowNode.childrenAfterGroup[i], foundInParent);
                        }
                        else {
                            filterCallback(childNode, foundInParent);
                        }
                    }
                }
                filterCallback(rowNode, alreadyFoundInParent);
            };
            var treeDataFilterCallback = function (rowNode) { return treeDataDepthFirstFilter_1(rowNode, false); };
            changedPath.executeFromRootNode(treeDataFilterCallback);
        }
        else {
            var defaultFilterCallback = function (rowNode) { return filterCallback(rowNode, false); };
            changedPath.forEachChangedNodeDepthFirst(defaultFilterCallback, true);
        }
    };
    FilterService.prototype.doingTreeDataFiltering = function () {
        return this.gridOptionsService.isTreeData() && !this.gridOptionsService.is('excludeChildrenWhenTreeDataFiltering');
    };
    __decorate([
        Autowired('filterManager')
    ], FilterService.prototype, "filterManager", void 0);
    FilterService = __decorate([
        Bean("filterService")
    ], FilterService);
    return FilterService;
}(BeanStub));
export { FilterService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsdGVyU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jbGllbnRTaWRlUm93TW9kZWwvZmlsdGVyU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQ0gsU0FBUyxFQUNULElBQUksRUFJSixRQUFRLEVBQ1gsTUFBTSx5QkFBeUIsQ0FBQztBQUdqQztJQUFtQyxpQ0FBUTtJQUEzQzs7SUFrRkEsQ0FBQztJQTlFVSw4QkFBTSxHQUFiLFVBQWMsV0FBd0I7UUFDbEMsSUFBTSxZQUFZLEdBQVksSUFBSSxDQUFDLGFBQWEsQ0FBQyxxQkFBcUIsRUFBRTtlQUN6QyxJQUFJLENBQUMsYUFBYSxDQUFDLG9CQUFvQixFQUFFO2VBQ3pDLElBQUksQ0FBQyxhQUFhLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztRQUM1RSxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksRUFBRSxXQUFXLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBRU8sbUNBQVcsR0FBbkIsVUFBb0IsWUFBcUIsRUFBRSxXQUF3QjtRQUFuRSxpQkFrRUM7UUFoRUcsSUFBTSxjQUFjLEdBQUcsVUFBQyxPQUFnQixFQUFFLGlCQUEwQjtZQUNoRSw4REFBOEQ7WUFDOUQsSUFBSSxPQUFPLENBQUMsV0FBVyxFQUFFLEVBQUU7Z0JBRXZCLHdHQUF3RztnQkFDeEcsSUFBSSxZQUFZLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtvQkFDcEMsT0FBTyxDQUFDLG1CQUFtQixHQUFHLE9BQU8sQ0FBQyxrQkFBbUIsQ0FBQyxNQUFNLENBQUMsVUFBQSxTQUFTO3dCQUN0RSx3RUFBd0U7d0JBQ3hFLHVEQUF1RDt3QkFDdkQsSUFBTSxtQkFBbUIsR0FBRyxTQUFTLENBQUMsbUJBQW1CLElBQUksU0FBUyxDQUFDLG1CQUFtQixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7d0JBRXRHLDBFQUEwRTt3QkFDMUUsNkJBQTZCO3dCQUM3QixJQUFNLHFCQUFxQixHQUFHLFNBQVMsQ0FBQyxJQUFJOytCQUNyQyxLQUFJLENBQUMsYUFBYSxDQUFDLGlCQUFpQixDQUFDLEVBQUMsT0FBTyxFQUFFLFNBQVMsRUFBQyxDQUFDLENBQUM7d0JBRWxFLHFHQUFxRzt3QkFFckcsT0FBTyxtQkFBbUIsSUFBSSxxQkFBcUIsQ0FBQztvQkFDeEQsQ0FBQyxDQUFDLENBQUM7aUJBQ047cUJBQU07b0JBQ0gsb0RBQW9EO29CQUNwRCxPQUFPLENBQUMsbUJBQW1CLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDO2lCQUM1RDthQUVKO2lCQUFNO2dCQUNILE9BQU8sQ0FBQyxtQkFBbUIsR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUM7YUFDNUQ7WUFFRCxJQUFJLE9BQU8sQ0FBQyxPQUFPLEVBQUU7Z0JBQ2pCLE9BQU8sQ0FBQyxPQUFPLENBQUMsbUJBQW1CLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDO2FBQ3JFO1FBQ0wsQ0FBQyxDQUFDO1FBRUYsSUFBSSxJQUFJLENBQUMsc0JBQXNCLEVBQUUsRUFBRTtZQUUvQixJQUFNLDBCQUF3QixHQUFHLFVBQUMsT0FBZ0IsRUFBRSxvQkFBNkI7Z0JBQzdFLGlHQUFpRztnQkFDakcsa0VBQWtFO2dCQUVsRSxJQUFJLE9BQU8sQ0FBQyxrQkFBa0IsRUFBRTtvQkFDNUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7d0JBQ3hELElBQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFFaEQsd0VBQXdFO3dCQUN4RSxJQUFNLGFBQWEsR0FBRyxvQkFBb0I7K0JBQ25DLEtBQUksQ0FBQyxhQUFhLENBQUMsaUJBQWlCLENBQUMsRUFBQyxPQUFPLEVBQUUsU0FBUyxFQUFDLENBQUMsQ0FBQzt3QkFDbEUsSUFBSSxTQUFTLENBQUMsa0JBQWtCLEVBQUU7NEJBQzlCLDBCQUF3QixDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxhQUFhLENBQUMsQ0FBQzt5QkFDMUU7NkJBQU07NEJBQ0gsY0FBYyxDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQzt5QkFDNUM7cUJBQ0o7aUJBQ0o7Z0JBQ0QsY0FBYyxDQUFDLE9BQU8sRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBQ2xELENBQUMsQ0FBQztZQUVGLElBQU0sc0JBQXNCLEdBQUcsVUFBQyxPQUFnQixJQUFLLE9BQUEsMEJBQXdCLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxFQUF4QyxDQUF3QyxDQUFDO1lBQzlGLFdBQVcsQ0FBQyxtQkFBbUIsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1NBQzNEO2FBQU07WUFFSCxJQUFNLHFCQUFxQixHQUFHLFVBQUMsT0FBZ0IsSUFBSyxPQUFBLGNBQWMsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLEVBQTlCLENBQThCLENBQUM7WUFDbkYsV0FBVyxDQUFDLDRCQUE0QixDQUFDLHFCQUFxQixFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ3pFO0lBQ0wsQ0FBQztJQUVPLDhDQUFzQixHQUE5QjtRQUNJLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO0lBQ3ZILENBQUM7SUEvRTJCO1FBQTNCLFNBQVMsQ0FBQyxlQUFlLENBQUM7d0RBQXNDO0lBRnhELGFBQWE7UUFEekIsSUFBSSxDQUFDLGVBQWUsQ0FBQztPQUNULGFBQWEsQ0FrRnpCO0lBQUQsb0JBQUM7Q0FBQSxBQWxGRCxDQUFtQyxRQUFRLEdBa0YxQztTQWxGWSxhQUFhIn0=