var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, Bean, BeanStub, ProvidedColumnGroup } from "@ag-grid-community/core";
let ToolPanelColDefService = class ToolPanelColDefService extends BeanStub {
    constructor() {
        super(...arguments);
        this.isColGroupDef = (colDef) => colDef && typeof colDef.children !== 'undefined';
        this.getId = (colDef) => {
            return this.isColGroupDef(colDef) ? colDef.groupId : colDef.colId;
        };
    }
    createColumnTree(colDefs) {
        const invalidColIds = [];
        const createDummyColGroup = (abstractColDef, depth) => {
            if (this.isColGroupDef(abstractColDef)) {
                // creating 'dummy' group which is not associated with grid column group
                const groupDef = abstractColDef;
                const groupId = (typeof groupDef.groupId !== 'undefined') ? groupDef.groupId : groupDef.headerName;
                const group = new ProvidedColumnGroup(groupDef, groupId, false, depth);
                const children = [];
                groupDef.children.forEach(def => {
                    const child = createDummyColGroup(def, depth + 1);
                    // check column exists in case invalid colDef is supplied for primary column
                    if (child) {
                        children.push(child);
                    }
                });
                group.setChildren(children);
                return group;
            }
            else {
                const colDef = abstractColDef;
                const key = colDef.colId ? colDef.colId : colDef.field;
                const column = this.columnModel.getPrimaryColumn(key);
                if (!column) {
                    invalidColIds.push(colDef);
                }
                return column;
            }
        };
        const mappedResults = [];
        colDefs.forEach(colDef => {
            const result = createDummyColGroup(colDef, 0);
            if (result) {
                // only return correctly mapped colDef results
                mappedResults.push(result);
            }
        });
        if (invalidColIds.length > 0) {
            console.warn('AG Grid: unable to find grid columns for the supplied colDef(s):', invalidColIds);
        }
        return mappedResults;
    }
    syncLayoutWithGrid(syncLayoutCallback) {
        // extract ordered list of leaf path trees (column group hierarchy for each individual leaf column)
        const leafPathTrees = this.getLeafPathTrees();
        // merge leaf path tree taking split column groups into account
        const mergedColumnTrees = this.mergeLeafPathTrees(leafPathTrees);
        // sync layout with merged column trees
        syncLayoutCallback(mergedColumnTrees);
    }
    getLeafPathTrees() {
        // leaf tree paths are obtained by walking up the tree starting at a column until we reach the top level group.
        const getLeafPathTree = (node, childDef) => {
            let leafPathTree;
            // build up tree in reverse order
            if (node instanceof ProvidedColumnGroup) {
                if (node.isPadding()) {
                    // skip over padding groups
                    leafPathTree = childDef;
                }
                else {
                    const groupDef = Object.assign({}, node.getColGroupDef());
                    // ensure group contains groupId
                    groupDef.groupId = node.getGroupId();
                    groupDef.children = [childDef];
                    leafPathTree = groupDef;
                }
            }
            else {
                const colDef = Object.assign({}, node.getColDef());
                // ensure col contains colId
                colDef.colId = node.getColId();
                leafPathTree = colDef;
            }
            // walk tree
            const parent = node.getOriginalParent();
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
        const allGridColumns = this.columnModel.getAllGridColumns();
        // only primary columns and non row group columns should appear in the tool panel
        const allPrimaryGridColumns = allGridColumns.filter(column => {
            const colDef = column.getColDef();
            return column.isPrimary() && !colDef.showRowGroup;
        });
        // construct a leaf path tree for each column
        return allPrimaryGridColumns.map(col => getLeafPathTree(col, col.getColDef()));
    }
    mergeLeafPathTrees(leafPathTrees) {
        const matchingRootGroupIds = (pathA, pathB) => {
            const bothPathsAreGroups = this.isColGroupDef(pathA) && this.isColGroupDef(pathB);
            return bothPathsAreGroups && this.getId(pathA) === this.getId(pathB);
        };
        const mergeTrees = (treeA, treeB) => {
            if (!this.isColGroupDef(treeB)) {
                return treeA;
            }
            const mergeResult = treeA;
            const groupToMerge = treeB;
            if (groupToMerge.children && groupToMerge.groupId) {
                const added = this.addChildrenToGroup(mergeResult, groupToMerge.groupId, groupToMerge.children[0]);
                if (added) {
                    return mergeResult;
                }
            }
            groupToMerge.children.forEach(child => mergeTrees(mergeResult, child));
            return mergeResult;
        };
        // we can't just merge the leaf path trees as groups can be split apart - instead only merge if leaf
        // path groups with the same root group id are contiguous.
        const mergeColDefs = [];
        for (let i = 1; i <= leafPathTrees.length; i++) {
            const first = leafPathTrees[i - 1];
            const second = leafPathTrees[i];
            if (matchingRootGroupIds(first, second)) {
                leafPathTrees[i] = mergeTrees(first, second);
            }
            else {
                mergeColDefs.push(first);
            }
        }
        return mergeColDefs;
    }
    addChildrenToGroup(tree, groupId, colDef) {
        const subGroupIsSplit = (currentSubGroup, currentSubGroupToAdd) => {
            const existingChildIds = currentSubGroup.children.map(this.getId);
            const childGroupAlreadyExists = _.includes(existingChildIds, this.getId(currentSubGroupToAdd));
            const lastChild = _.last(currentSubGroup.children);
            const lastChildIsDifferent = lastChild && this.getId(lastChild) !== this.getId(currentSubGroupToAdd);
            return childGroupAlreadyExists && lastChildIsDifferent;
        };
        if (!this.isColGroupDef(tree)) {
            return true;
        }
        const currentGroup = tree;
        const groupToAdd = colDef;
        if (subGroupIsSplit(currentGroup, groupToAdd)) {
            currentGroup.children.push(groupToAdd);
            return true;
        }
        if (currentGroup.groupId === groupId) {
            // add children that don't already exist to group
            const existingChildIds = currentGroup.children.map(this.getId);
            const colDefAlreadyPresent = _.includes(existingChildIds, this.getId(groupToAdd));
            if (!colDefAlreadyPresent) {
                currentGroup.children.push(groupToAdd);
                return true;
            }
        }
        // recurse until correct group is found to add children
        currentGroup.children.forEach(subGroup => this.addChildrenToGroup(subGroup, groupId, colDef));
        return false;
    }
};
__decorate([
    Autowired('columnModel')
], ToolPanelColDefService.prototype, "columnModel", void 0);
ToolPanelColDefService = __decorate([
    Bean('toolPanelColDefService')
], ToolPanelColDefService);
export { ToolPanelColDefService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9vbFBhbmVsQ29sRGVmU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9zaWRlQmFyL2NvbW1vbi90b29sUGFuZWxDb2xEZWZTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFDSCxDQUFDLEVBRUQsU0FBUyxFQUNULElBQUksRUFDSixRQUFRLEVBS1IsbUJBQW1CLEVBRXRCLE1BQU0seUJBQXlCLENBQUM7QUFHakMsSUFBYSxzQkFBc0IsR0FBbkMsTUFBYSxzQkFBdUIsU0FBUSxRQUFRO0lBQXBEOztRQTJMWSxrQkFBYSxHQUFHLENBQUMsTUFBc0IsRUFBRSxFQUFFLENBQUMsTUFBTSxJQUFJLE9BQVEsTUFBc0IsQ0FBQyxRQUFRLEtBQUssV0FBVyxDQUFDO1FBRTlHLFVBQUssR0FBRyxDQUFDLE1BQXNCLEVBQXNCLEVBQUU7WUFDM0QsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBRSxNQUFzQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUUsTUFBaUIsQ0FBQyxLQUFLLENBQUM7UUFDbkcsQ0FBQyxDQUFBO0lBQ0wsQ0FBQztJQTVMVSxnQkFBZ0IsQ0FBQyxPQUF5QjtRQUM3QyxNQUFNLGFBQWEsR0FBcUIsRUFBRSxDQUFDO1FBRTNDLE1BQU0sbUJBQW1CLEdBQUcsQ0FBQyxjQUE4QixFQUFFLEtBQWEsRUFBbUIsRUFBRTtZQUMzRixJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLEVBQUU7Z0JBRXBDLHdFQUF3RTtnQkFDeEUsTUFBTSxRQUFRLEdBQUcsY0FBNkIsQ0FBQztnQkFDL0MsTUFBTSxPQUFPLEdBQUcsQ0FBQyxPQUFPLFFBQVEsQ0FBQyxPQUFPLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUM7Z0JB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