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
import { _, Autowired, Bean, BeanStub, ProvidedColumnGroup } from "@ag-grid-community/core";
var ToolPanelColDefService = /** @class */ (function (_super) {
    __extends(ToolPanelColDefService, _super);
    function ToolPanelColDefService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.isColGroupDef = function (colDef) { return colDef && typeof colDef.children !== 'undefined'; };
        _this.getId = function (colDef) {
            return _this.isColGroupDef(colDef) ? colDef.groupId : colDef.colId;
        };
        return _this;
    }
    ToolPanelColDefService.prototype.createColumnTree = function (colDefs) {
        var _this = this;
        var invalidColIds = [];
        var createDummyColGroup = function (abstractColDef, depth) {
            if (_this.isColGroupDef(abstractColDef)) {
                // creating 'dummy' group which is not associated with grid column group
                var groupDef = abstractColDef;
                var groupId = (typeof groupDef.groupId !== 'undefined') ? groupDef.groupId : groupDef.headerName;
                var group = new ProvidedColumnGroup(groupDef, groupId, false, depth);
                var children_1 = [];
                groupDef.children.forEach(function (def) {
                    var child = createDummyColGroup(def, depth + 1);
                    // check column exists in case invalid colDef is supplied for primary column
                    if (child) {
                        children_1.push(child);
                    }
                });
                group.setChildren(children_1);
                return group;
            }
            else {
                var colDef = abstractColDef;
                var key = colDef.colId ? colDef.colId : colDef.field;
                var column = _this.columnModel.getPrimaryColumn(key);
                if (!column) {
                    invalidColIds.push(colDef);
                }
                return column;
            }
        };
        var mappedResults = [];
        colDefs.forEach(function (colDef) {
            var result = createDummyColGroup(colDef, 0);
            if (result) {
                // only return correctly mapped colDef results
                mappedResults.push(result);
            }
        });
        if (invalidColIds.length > 0) {
            console.warn('AG Grid: unable to find grid columns for the supplied colDef(s):', invalidColIds);
        }
        return mappedResults;
    };
    ToolPanelColDefService.prototype.syncLayoutWithGrid = function (syncLayoutCallback) {
        // extract ordered list of leaf path trees (column group hierarchy for each individual leaf column)
        var leafPathTrees = this.getLeafPathTrees();
        // merge leaf path tree taking split column groups into account
        var mergedColumnTrees = this.mergeLeafPathTrees(leafPathTrees);
        // sync layout with merged column trees
        syncLayoutCallback(mergedColumnTrees);
    };
    ToolPanelColDefService.prototype.getLeafPathTrees = function () {
        // leaf tree paths are obtained by walking up the tree starting at a column until we reach the top level group.
        var getLeafPathTree = function (node, childDef) {
            var leafPathTree;
            // build up tree in reverse order
            if (node instanceof ProvidedColumnGroup) {
                if (node.isPadding()) {
                    // skip over padding groups
                    leafPathTree = childDef;
                }
                else {
                    var groupDef = Object.assign({}, node.getColGroupDef());
                    // ensure group contains groupId
                    groupDef.groupId = node.getGroupId();
                    groupDef.children = [childDef];
                    leafPathTree = groupDef;
                }
            }
            else {
                var colDef = Object.assign({}, node.getColDef());
                // ensure col contains colId
                colDef.colId = node.getColId();
                leafPathTree = colDef;
            }
            // walk tree
            var parent = node.getOriginalParent();
            if (parent) {
                // keep walking up the tree until we reach the root
                return getLeafPathTree(parent, leafPathTree);
            }
            else {
                // we have reached the root - exit with resulting leaf path tree
                return leafPathTree;
            }
        };
        // obtain a sorted list of all grid columns
        var allGridColumns = this.columnModel.getAllGridColumns();
        // only primary columns and non row group columns should appear in the tool panel
        var allPrimaryGridColumns = allGridColumns.filter(function (column) {
            var colDef = column.getColDef();
            return column.isPrimary() && !colDef.showRowGroup;
        });
        // construct a leaf path tree for each column
        return allPrimaryGridColumns.map(function (col) { return getLeafPathTree(col, col.getColDef()); });
    };
    ToolPanelColDefService.prototype.mergeLeafPathTrees = function (leafPathTrees) {
        var _this = this;
        var matchingRootGroupIds = function (pathA, pathB) {
            var bothPathsAreGroups = _this.isColGroupDef(pathA) && _this.isColGroupDef(pathB);
            return bothPathsAreGroups && _this.getId(pathA) === _this.getId(pathB);
        };
        var mergeTrees = function (treeA, treeB) {
            if (!_this.isColGroupDef(treeB)) {
                return treeA;
            }
            var mergeResult = treeA;
            var groupToMerge = treeB;
            if (groupToMerge.children && groupToMerge.groupId) {
                var added = _this.addChildrenToGroup(mergeResult, groupToMerge.groupId, groupToMerge.children[0]);
                if (added) {
                    return mergeResult;
                }
            }
            groupToMerge.children.forEach(function (child) { return mergeTrees(mergeResult, child); });
            return mergeResult;
        };
        // we can't just merge the leaf path trees as groups can be split apart - instead only merge if leaf
        // path groups with the same root group id are contiguous.
        var mergeColDefs = [];
        for (var i = 1; i <= leafPathTrees.length; i++) {
            var first = leafPathTrees[i - 1];
            var second = leafPathTrees[i];
            if (matchingRootGroupIds(first, second)) {
                leafPathTrees[i] = mergeTrees(first, second);
            }
            else {
                mergeColDefs.push(first);
            }
        }
        return mergeColDefs;
    };
    ToolPanelColDefService.prototype.addChildrenToGroup = function (tree, groupId, colDef) {
        var _this = this;
        var subGroupIsSplit = function (currentSubGroup, currentSubGroupToAdd) {
            var existingChildIds = currentSubGroup.children.map(_this.getId);
            var childGroupAlreadyExists = _.includes(existingChildIds, _this.getId(currentSubGroupToAdd));
            var lastChild = _.last(currentSubGroup.children);
            var lastChildIsDifferent = lastChild && _this.getId(lastChild) !== _this.getId(currentSubGroupToAdd);
            return childGroupAlreadyExists && lastChildIsDifferent;
        };
        if (!this.isColGroupDef(tree)) {
            return true;
        }
        var currentGroup = tree;
        var groupToAdd = colDef;
        if (subGroupIsSplit(currentGroup, groupToAdd)) {
            currentGroup.children.push(groupToAdd);
            return true;
        }
        if (currentGroup.groupId === groupId) {
            // add children that don't already exist to group
            var existingChildIds = currentGroup.children.map(this.getId);
            var colDefAlreadyPresent = _.includes(existingChildIds, this.getId(groupToAdd));
            if (!colDefAlreadyPresent) {
                currentGroup.children.push(groupToAdd);
                return true;
            }
        }
        // recurse until correct group is found to add children
        currentGroup.children.forEach(function (subGroup) { return _this.addChildrenToGroup(subGroup, groupId, colDef); });
        return false;
    };
    __decorate([
        Autowired('columnModel')
    ], ToolPanelColDefService.prototype, "columnModel", void 0);
    ToolPanelColDefService = __decorate([
        Bean('toolPanelColDefService')
    ], ToolPanelColDefService);
    return ToolPanelColDefService;
}(BeanStub));
export { ToolPanelColDefService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9vbFBhbmVsQ29sRGVmU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9zaWRlQmFyL2NvbW1vbi90b29sUGFuZWxDb2xEZWZTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFDSCxDQUFDLEVBRUQsU0FBUyxFQUNULElBQUksRUFDSixRQUFRLEVBS1IsbUJBQW1CLEVBRXRCLE1BQU0seUJBQXlCLENBQUM7QUFHakM7SUFBNEMsMENBQVE7SUFBcEQ7UUFBQSxxRUFnTUM7UUFMVyxtQkFBYSxHQUFHLFVBQUMsTUFBc0IsSUFBSyxPQUFBLE1BQU0sSUFBSSxPQUFRLE1BQXNCLENBQUMsUUFBUSxLQUFLLFdBQVcsRUFBakUsQ0FBaUUsQ0FBQztRQUU5RyxXQUFLLEdBQUcsVUFBQyxNQUFzQjtZQUNuQyxPQUFPLEtBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFFLE1BQXNCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBRSxNQUFpQixDQUFDLEtBQUssQ0FBQztRQUNuRyxDQUFDLENBQUE7O0lBQ0wsQ0FBQztJQTVMVSxpREFBZ0IsR0FBdkIsVUFBd0IsT0FBeUI7UUFBakQsaUJBZ0RDO1FBL0NHLElBQU0sYUFBYSxHQUFxQixFQUFFLENBQUM7UUFFM0MsSUFBTSxtQkFBbUIsR0FBRyxVQUFDLGNBQThCLEVBQUUsS0FBYTtZQUN0RSxJQUFJLEtBQUksQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLEVBQUU7Z0JBRXBDLHdFQUF3RTtnQkFDeEUsSUFBTSxRQUFRLEdBQUcsY0FBNkIsQ0FBQztnQkFDL0MsSUFBTSxPQUFPLEdBQUcsQ0FBQyxPQUFPLFFBQVEsQ0FBQyxPQUFPLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUM7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