import {
    _,
    AbstractColDef,
    Autowired,
    Bean,
    BeanStub,
    ColDef,
    ColGroupDef,
    Column,
    ColumnModel,
    ProvidedColumnGroup,
    IProvidedColumn
} from "@ag-grid-community/core";

@Bean('toolPanelColDefService')
export class ToolPanelColDefService extends BeanStub {

    @Autowired('columnModel') private columnModel: ColumnModel;

    public createColumnTree(colDefs: AbstractColDef[]): IProvidedColumn[] {
        const invalidColIds: AbstractColDef[] = [];

        const createDummyColGroup = (abstractColDef: AbstractColDef, depth: number): IProvidedColumn => {
            if (this.isColGroupDef(abstractColDef)) {

                // creating 'dummy' group which is not associated with grid column group
                const groupDef = abstractColDef as ColGroupDef;
                const groupId = (typeof groupDef.groupId !== 'undefined') ? groupDef.groupId : groupDef.headerName;
                const group = new ProvidedColumnGroup(groupDef, groupId!, false, depth);
                const children: IProvidedColumn[] = [];
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
                const key = colDef.colId ? colDef.colId : colDef.field;
                const column = this.columnModel.getPrimaryColumn(key!) as IProvidedColumn;

                if (!column) {
                    invalidColIds.push(colDef);
                }

                return column;
            }
        };

        const mappedResults: IProvidedColumn[] = [];
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

    public syncLayoutWithGrid(syncLayoutCallback: (colDefs: AbstractColDef[]) => void): void {
        // extract ordered list of leaf path trees (column group hierarchy for each individual leaf column)
        const leafPathTrees: AbstractColDef[] = this.getLeafPathTrees();

        // merge leaf path tree taking split column groups into account
        const mergedColumnTrees = this.mergeLeafPathTrees(leafPathTrees);

        // sync layout with merged column trees
        syncLayoutCallback(mergedColumnTrees);
    }

    private getLeafPathTrees(): AbstractColDef[] {

        // leaf tree paths are obtained by walking up the tree starting at a column until we reach the top level group.
        const getLeafPathTree = (node: Column | ProvidedColumnGroup, childDef: AbstractColDef): AbstractColDef => {
            let leafPathTree: AbstractColDef;

            // build up tree in reverse order
            if (node instanceof ProvidedColumnGroup) {
                if (node.isPadding()) {
                    // skip over padding groups
                    leafPathTree = childDef;
                } else {
                    const groupDef = Object.assign({}, node.getColGroupDef());
                    // ensure group contains groupId
                    groupDef.groupId = node.getGroupId();
                    groupDef.children = [childDef];
                    leafPathTree = groupDef;
                }
            } else {
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
            } else {
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

    private mergeLeafPathTrees(leafPathTrees: AbstractColDef[]) {
        const matchingRootGroupIds = (pathA: AbstractColDef, pathB: AbstractColDef) => {
            const bothPathsAreGroups = this.isColGroupDef(pathA) && this.isColGroupDef(pathB);
            return bothPathsAreGroups && this.getId(pathA) === this.getId(pathB);
        };

        const mergeTrees = (treeA: AbstractColDef, treeB: AbstractColDef): AbstractColDef => {
            if (!this.isColGroupDef(treeB)) { return treeA; }

            const mergeResult = treeA;
            const groupToMerge = treeB as ColGroupDef;

            if (groupToMerge.children && groupToMerge.groupId) {
                const added = this.addChildrenToGroup(mergeResult, groupToMerge.groupId, groupToMerge.children[0]);
                if (added) { return mergeResult; }
            }

            groupToMerge.children.forEach(child => mergeTrees(mergeResult, child));

            return mergeResult;
        };

        // we can't just merge the leaf path trees as groups can be split apart - instead only merge if leaf
        // path groups with the same root group id are contiguous.
        const mergeColDefs: AbstractColDef[] = [];
        for (let i = 1; i <= leafPathTrees.length; i++) {
            const first = leafPathTrees[i - 1];
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
        const subGroupIsSplit = (currentSubGroup: ColGroupDef, currentSubGroupToAdd: ColGroupDef) => {
            const existingChildIds = currentSubGroup.children.map(this.getId);
            const childGroupAlreadyExists = _.includes(existingChildIds, this.getId(currentSubGroupToAdd));
            const lastChild = _.last(currentSubGroup.children);
            const lastChildIsDifferent = lastChild && this.getId(lastChild) !== this.getId(currentSubGroupToAdd);
            return childGroupAlreadyExists && lastChildIsDifferent;
        };

        if (!this.isColGroupDef(tree)) { return true; }

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
