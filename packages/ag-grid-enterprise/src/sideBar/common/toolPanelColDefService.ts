import type { AbstractColDef, AgColumn, BeanCollection, ColDef, ColumnModel } from 'ag-grid-community';
import { AgProvidedColumnGroup, isProvidedColumnGroup } from 'ag-grid-community';

import { isColGroupDef, mergeLeafPathTrees } from './sideBarUtils';

export function toolPanelCreateColumnTree(
    beans: BeanCollection,
    colDefs: AbstractColDef[]
): (AgColumn | AgProvidedColumnGroup)[] {
    const { colModel } = beans;
    const invalidColIds: AbstractColDef[] = [];

    const createDummyColGroup = (abstractColDef: AbstractColDef, depth: number): AgColumn | AgProvidedColumnGroup => {
        if (isColGroupDef(abstractColDef)) {
            // creating 'dummy' group which is not associated with grid column group
            const groupDef = abstractColDef;
            const groupId = typeof groupDef.groupId !== 'undefined' ? groupDef.groupId : groupDef.headerName;
            const group = new AgProvidedColumnGroup(groupDef, groupId!, false, depth);
            const children: (AgColumn | AgProvidedColumnGroup)[] = [];
            for (const def of groupDef.children) {
                const child = createDummyColGroup(def, depth + 1);
                // check column exists in case invalid colDef is supplied for primary column
                if (child) {
                    children.push(child);
                }
            }
            group.children = children;

            return group;
        } else {
            const colDef = abstractColDef as ColDef;
            const key = colDef.colId ? colDef.colId : colDef.field;
            const column = colModel.getNonPivotCol(key!)!;

            if (!column) {
                invalidColIds.push(colDef);
            }

            return column;
        }
    };

    const mappedResults: (AgColumn | AgProvidedColumnGroup)[] = [];
    for (const colDef of colDefs) {
        const result = createDummyColGroup(colDef, 0);
        if (result) {
            // only return correctly mapped colDef results
            mappedResults.push(result);
        }
    }

    if (invalidColIds.length > 0) {
        beans.log.warn(217, { invalidColIds });
    }

    return mappedResults;
}

export function syncLayoutWithGrid(
    colModel: ColumnModel,
    syncLayoutCallback: (colDefs: AbstractColDef[]) => void
): void {
    // extract ordered list of leaf path trees (column group hierarchy for each individual leaf column)
    const leafPathTrees: AbstractColDef[] = getLeafPathTrees(getGridPrimaryColumns(colModel));

    // merge leaf path tree taking split column groups into account
    const mergedColumnTrees = mergeLeafPathTrees(leafPathTrees);

    // sync layout with merged column trees
    syncLayoutCallback(mergedColumnTrees);
}

export function syncLayoutWithColumns(
    columns: AgColumn[],
    syncLayoutCallback: (colDefs: AbstractColDef[]) => void
): void {
    const leafPathTrees: AbstractColDef[] = getLeafPathTrees(columns);

    // merge leaf path tree taking split column groups into account
    const mergedColumnTrees = mergeLeafPathTrees(leafPathTrees);

    // sync layout with merged column trees
    syncLayoutCallback(mergedColumnTrees);
}

function getLeafPathTrees(columns: AgColumn[]): AbstractColDef[] {
    // leaf tree paths are obtained by walking up the tree starting at a column until we reach the top level group.
    const getLeafPathTree = (node: AgColumn | AgProvidedColumnGroup, childDef: AbstractColDef): AbstractColDef => {
        let leafPathTree: AbstractColDef;

        // build up tree in reverse order
        if (isProvidedColumnGroup(node)) {
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
            const colDef = Object.assign({}, node.colDef);
            // ensure col contains colId
            colDef.colId = node.colId;
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

    // construct a leaf path tree for each column
    return columns.map((col) => getLeafPathTree(col, col.colDef));
}

function getGridPrimaryColumns(colModel: ColumnModel): AgColumn[] {
    return colModel.colsList.filter((column) => {
        return column.primary && !column.showRowGroup;
    });
}
