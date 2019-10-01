import {
    _,
    AbstractColDef,
    Autowired,
    Bean,
    ColDef,
    ColGroupDef,
    Column,
    ColumnController,
    OriginalColumnGroup,
    OriginalColumnGroupChild
} from "ag-grid-community";

@Bean('toolPanelColDefService')
export class ToolPanelColDefService {

    @Autowired('columnController') private columnController: ColumnController;

    public createColumnTree(colDefs: AbstractColDef[]): OriginalColumnGroupChild[] {
        const invalidColIds: AbstractColDef[] = [];

        const createDummyColGroup = (abstractColDef: AbstractColDef, depth: number): OriginalColumnGroupChild => {
            if (this.isColGroupDef(abstractColDef)) {

                // creating 'dummy' group which is not associated with grid column group
                const groupDef = abstractColDef as ColGroupDef;
                const groupId = (typeof groupDef.groupId !== 'undefined') ? groupDef.groupId : groupDef.headerName;
                const group = new OriginalColumnGroup(groupDef, groupId as string, false, depth);
                const children: OriginalColumnGroupChild[] = [];
                groupDef.children.forEach(def => {
                    const child = createDummyColGroup(def, depth + 1);
                    // check column exists in case invalid colDef is supplied for primary column
                    if (child) {
                        children.push(child);
                    }
                });
                group.setChildren(children);

                return group;
            } else {
                const colDef = abstractColDef as ColDef;
                const key = colDef.colId ? colDef.colId : colDef.field as string;
                const column = this.columnController.getPrimaryColumn(key) as OriginalColumnGroupChild;

                if (!column) {
                    invalidColIds.push(colDef);
                }

                return column;
            }
        };

        const mappedResults: OriginalColumnGroupChild[] = [];
        colDefs.forEach(colDef => {
            const result = createDummyColGroup(colDef, 0);
            if (result) {
                // only return correctly mapped colDef results
                mappedResults.push(result);
            }
        });

        if (invalidColIds.length > 0) {
            console.warn('ag-Grid: unable to find grid columns for the supplied colDef(s):', invalidColIds);
        }

        return mappedResults;
    }

    public syncLayoutWithGrid(syncLayoutCallback: (colDefs: AbstractColDef[]) => void): void {
        const inPivotMode = this.columnController.isPivotMode();
        const pivotActive = this.columnController.isPivotActive();

        // don't update columns when grid is just showing secondary columns
        if (inPivotMode && pivotActive) return;

        // extract ordered list of leaf path trees (column group hierarchy for each individual leaf column)
        const leafPathTrees: AbstractColDef[] = this.getLeafPathTrees();

        // merge leaf path tree taking split column groups into account
        const mergedColumnTrees = this.mergeLeafPathTrees(leafPathTrees);

        // sync layout with merged column trees
        syncLayoutCallback(mergedColumnTrees);
    }

    private getLeafPathTrees(): AbstractColDef[] {

        // leaf tree paths are obtained by walking up the tree starting at a column until we reach the top level group.
        const getLeafPathTree = (node: Column | OriginalColumnGroup, childDef: AbstractColDef): AbstractColDef => {
            let leafPathTree: AbstractColDef;

            // build up tree in reverse order
            if (node instanceof OriginalColumnGroup) {
                if (node.isPadding()) {
                    // skip over padding groups
                    leafPathTree = childDef;
                } else {
                    const groupDef = _.assign({}, node.getColGroupDef());
                    // ensure group contains groupId
                    groupDef.groupId = node.getGroupId();
                    groupDef.children = [childDef];
                    leafPathTree = groupDef;
                }
            } else {
                const colDef = _.assign({}, node.getColDef());
                // ensure col contains colId
                colDef.colId = node.getColId();
                leafPathTree = colDef;
            }

            // walk tree
            const parent = node.getOriginalParent();
            if (parent) {
                // keep walking up the tree until we reach the root
                return getLeafPathTree(parent, leafPathTree);
            } else {
                // we have reached the root - exit with resulting leaf path tree
                return leafPathTree;
            }
        };

        // obtain a sorted list of all grid columns
        const allGridColumns = this.columnController.getAllGridColumns();

        // only primary columns and non row group columns should appear in the tool panel
        const allPrimaryGridColumns = allGridColumns.filter(column => {
            const colDef = column.getColDef();
            const rowGroupColumn = colDef.rowGroup || colDef.rowGroupIndex || colDef.showRowGroup;
            return column.isPrimary() && !rowGroupColumn;
        });

        // construct a leaf path tree for each column
        return allPrimaryGridColumns.map(col => getLeafPathTree(col, col.getColDef()));
    }

    private mergeLeafPathTrees(leafPathTrees: AbstractColDef[]) {
        const getLeafPathString = (leafPath: ColDef | ColGroupDef): string => {
            const group = leafPath as ColGroupDef;
            return group.children ? group.groupId + getLeafPathString(group.children[0]) : '';
        };

        const matchingRootGroupIds = (pathA: AbstractColDef, pathB: AbstractColDef) => {
            const bothPathsAreGroups = this.isColGroupDef(pathA) && this.isColGroupDef(pathB);
            return bothPathsAreGroups && this.getId(pathA) === this.getId(pathB);
        };

        const mergeTrees = (treeA: AbstractColDef, treeB: AbstractColDef): AbstractColDef => {
            if (!this.isColGroupDef(treeB)) return treeA;

            const mergeResult = treeA as AbstractColDef;
            const groupToMerge = treeB as ColGroupDef;

            if (groupToMerge.children && groupToMerge.groupId) {
                const added = this.addChildrenToGroup(mergeResult, groupToMerge.groupId, groupToMerge.children[0]);
                if (added) return mergeResult;
            }

            groupToMerge.children.forEach(child => mergeTrees(mergeResult, child));

            return mergeResult;
        };

        // we can't just merge the leaf path trees as groups can be split apart - instead only merge if leaf
        // path groups with the same root group id are contiguous.
        const mergeColDefs: AbstractColDef[] = [];
        for (let i = 1; i <= leafPathTrees.length; i++) {
            const first = leafPathTrees[i-1];
            const second = leafPathTrees[i];

            if (matchingRootGroupIds(first, second)) {
                leafPathTrees[i] = mergeTrees(first, second);
            } else {
                mergeColDefs.push(first);
            }
        }

        return mergeColDefs;
    }

    private addChildrenToGroup(tree: AbstractColDef, groupId: string, colDef: AbstractColDef): boolean {
        const subGroupIsSplit = (currentGroup: ColGroupDef, groupToAdd: ColGroupDef) => {
            const existingChildIds = currentGroup.children.map(this.getId);
            const childGroupAlreadyExists = _.includes(existingChildIds, this.getId(groupToAdd));
            const lastChild = _.last(currentGroup.children);
            const lastChildIsDifferent = lastChild && this.getId(lastChild) !== this.getId(groupToAdd);
            return childGroupAlreadyExists && lastChildIsDifferent;
        };

        if (!this.isColGroupDef(tree)) return true;

        const currentGroup = tree as ColGroupDef;
        const groupToAdd = colDef as ColGroupDef;

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

    private isColGroupDef = (colDef: AbstractColDef) => colDef && typeof (colDef as ColGroupDef).children !== 'undefined';

    private getId = (colDef: AbstractColDef): string | undefined => {
        return this.isColGroupDef(colDef) ? (colDef as ColGroupDef).groupId : (colDef as ColDef).colId;
    }
}
