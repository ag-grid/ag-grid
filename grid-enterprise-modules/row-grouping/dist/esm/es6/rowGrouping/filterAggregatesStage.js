var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Bean, BeanStub, } from "@ag-grid-community/core";
let FilterAggregatesStage = class FilterAggregatesStage extends BeanStub {
    execute(params) {
        const isPivotMode = this.columnModel.isPivotMode();
        const isAggFilterActive = this.filterManager.isAggregateFilterPresent()
            || this.filterManager.isAggregateQuickFilterPresent();
        // This is the default filter for applying only to leaf nodes, realistically this should not apply as primary agg columns,
        // should not be applied by the filterManager if getGroupAggFiltering is missing. Predicate will apply filters to leaf level.
        const defaultPrimaryColumnPredicate = (params) => !params.node.group;
        // Default secondary column predicate, selecting only leaf level groups.
        const defaultSecondaryColumnPredicate = ((params) => params.node.leafGroup);
        // The predicate to determine whether filters should apply to this row. Either defined by the user in groupAggFiltering or a default depending
        // on current pivot mode status.
        const applyFilterToNode = this.gridOptionsService.getGroupAggFiltering()
            || (isPivotMode ? defaultSecondaryColumnPredicate : defaultPrimaryColumnPredicate);
        const { changedPath } = params;
        const preserveChildren = (node, recursive = false) => {
            if (node.childrenAfterFilter) {
                node.childrenAfterAggFilter = node.childrenAfterFilter;
                if (recursive) {
                    node.childrenAfterAggFilter.forEach((child) => preserveChildren(child, recursive));
                }
                this.setAllChildrenCount(node);
            }
            if (node.sibling) {
                node.sibling.childrenAfterAggFilter = node.childrenAfterAggFilter;
            }
        };
        const filterChildren = (node) => {
            var _a;
            node.childrenAfterAggFilter = ((_a = node.childrenAfterFilter) === null || _a === void 0 ? void 0 : _a.filter((child) => {
                var _a;
                const shouldFilterRow = applyFilterToNode({ node: child });
                if (shouldFilterRow) {
                    const doesNodePassFilter = this.filterManager.doesRowPassAggregateFilters({ rowNode: child });
                    if (doesNodePassFilter) {
                        // Node has passed, so preserve children
                        preserveChildren(child, true);
                        return true;
                    }
                }
                const hasChildPassed = (_a = child.childrenAfterAggFilter) === null || _a === void 0 ? void 0 : _a.length;
                return hasChildPassed;
            })) || null;
            this.setAllChildrenCount(node);
            if (node.sibling) {
                node.sibling.childrenAfterAggFilter = node.childrenAfterAggFilter;
            }
        };
        changedPath.forEachChangedNodeDepthFirst(isAggFilterActive ? filterChildren : preserveChildren, true);
    }
    setAllChildrenCountTreeData(rowNode) {
        // for tree data, we include all children, groups and leafs
        let allChildrenCount = 0;
        rowNode.childrenAfterAggFilter.forEach((child) => {
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
        rowNode.childrenAfterAggFilter.forEach((child) => {
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
        if (!rowNode.hasChildren()) {
            rowNode.setAllChildrenCount(null);
            return;
        }
        if (this.gridOptionsService.isTreeData()) {
            this.setAllChildrenCountTreeData(rowNode);
        }
        else {
            this.setAllChildrenCountGridGrouping(rowNode);
        }
    }
};
__decorate([
    Autowired('filterManager')
], FilterAggregatesStage.prototype, "filterManager", void 0);
__decorate([
    Autowired('columnModel')
], FilterAggregatesStage.prototype, "columnModel", void 0);
FilterAggregatesStage = __decorate([
    Bean('filterAggregatesStage')
], FilterAggregatesStage);
export { FilterAggregatesStage };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsdGVyQWdncmVnYXRlc1N0YWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3Jvd0dyb3VwaW5nL2ZpbHRlckFnZ3JlZ2F0ZXNTdGFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPLEVBQ0gsU0FBUyxFQUNULElBQUksRUFHSixRQUFRLEdBSVgsTUFBTSx5QkFBeUIsQ0FBQztBQUdqQyxJQUFhLHFCQUFxQixHQUFsQyxNQUFhLHFCQUFzQixTQUFRLFFBQVE7SUFLeEMsT0FBTyxDQUFDLE1BQTBCO1FBQ3JDLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDbkQsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLHdCQUF3QixFQUFFO2VBQ2hFLElBQUksQ0FBQyxhQUFhLENBQUMsNkJBQTZCLEVBQUUsQ0FBQztRQUUxRCwwSEFBMEg7UUFDMUgsNkhBQTZIO1FBQzdILE1BQU0sNkJBQTZCLEdBQUcsQ0FBQyxNQUF5QixFQUFFLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBRXhGLHdFQUF3RTtRQUN4RSxNQUFNLCtCQUErQixHQUFHLENBQUMsQ0FBQyxNQUF5QixFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRS9GLDhJQUE4STtRQUM5SSxnQ0FBZ0M7UUFDaEMsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsb0JBQW9CLEVBQUU7ZUFDakUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLCtCQUErQixDQUFDLENBQUMsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO1FBRXZGLE1BQU0sRUFBRSxXQUFXLEVBQUUsR0FBRyxNQUFNLENBQUM7UUFFL0IsTUFBTSxnQkFBZ0IsR0FBRyxDQUFDLElBQWEsRUFBRSxTQUFTLEdBQUcsS0FB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