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
        const isAggFilterActive = this.filterManager.isAggregateFilterPresent();
        // This is the default filter for applying only to leaf nodes, realistically this should not apply as primary agg columns,
        // should not be applied by the filterManager if getGroupAggFiltering is missing. Predicate will apply filters to leaf level.
        const defaultPrimaryColumnPredicate = (params) => !params.node.group;
        // Default secondary column predicate, selecting only leaf level groups.
        const defaultSecondaryColumnPredicate = ((params) => params.node.leafGroup);
        // The predicate to determine whether filters should apply to this row. Either defined by the user in groupAggFiltering or a default depending
        // on current pivot mode status.
        const applyFilterToNode = this.gridOptionsWrapper.getGroupAggFiltering()
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
        if (this.gridOptionsWrapper.isTreeData()) {
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
