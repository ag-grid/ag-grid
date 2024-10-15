import type { AbstractColDef, ColDef, ColGroupDef } from 'ag-grid-community';
import { _last } from 'ag-grid-community';

export function isColGroupDef(colDef: AbstractColDef): colDef is ColGroupDef {
    return !!colDef && typeof (colDef as ColGroupDef).children !== 'undefined';
}

function getId(colDef: AbstractColDef): string | undefined {
    return isColGroupDef(colDef) ? colDef.groupId : (colDef as ColDef).colId;
}

function addChildrenToGroup(tree: AbstractColDef, groupId: string, colDef: AbstractColDef): boolean {
    const subGroupIsSplit = (currentSubGroup: ColGroupDef, currentSubGroupToAdd: ColGroupDef) => {
        const existingChildIds = currentSubGroup.children.map(getId);
        const childGroupAlreadyExists = existingChildIds.includes(getId(currentSubGroupToAdd));
        const lastChild = _last(currentSubGroup.children);
        const lastChildIsDifferent = lastChild && getId(lastChild) !== getId(currentSubGroupToAdd);
        return childGroupAlreadyExists && lastChildIsDifferent;
    };

    if (!isColGroupDef(tree)) {
        return true;
    }

    const currentGroup = tree;
    const groupToAdd = colDef as ColGroupDef;

    if (subGroupIsSplit(currentGroup, groupToAdd)) {
        currentGroup.children.push(groupToAdd);
        return true;
    }

    if (currentGroup.groupId === groupId) {
        // add children that don't already exist to group
        const existingChildIds = currentGroup.children.map(getId);
        const colDefAlreadyPresent = existingChildIds.includes(getId(groupToAdd));
        if (!colDefAlreadyPresent) {
            currentGroup.children.push(groupToAdd);
            return true;
        }
    }

    // recurse until correct group is found to add children
    for (let i = currentGroup.children.length - 1; i >= 0; i--) {
        if (addChildrenToGroup(currentGroup.children[i], groupId, colDef)) {
            break;
        }
    }
    return false;
}

export function mergeLeafPathTrees(leafPathTrees: AbstractColDef[]): AbstractColDef[] {
    const matchingRootGroupIds = (pathA: AbstractColDef, pathB: AbstractColDef) => {
        const bothPathsAreGroups = isColGroupDef(pathA) && isColGroupDef(pathB);
        return bothPathsAreGroups && getId(pathA) === getId(pathB);
    };

    const mergeTrees = (treeA: AbstractColDef, treeB: AbstractColDef): AbstractColDef => {
        if (!isColGroupDef(treeB)) {
            return treeA;
        }

        const mergeResult = treeA;
        const groupToMerge = treeB;

        if (groupToMerge.children && groupToMerge.groupId) {
            const added = addChildrenToGroup(mergeResult, groupToMerge.groupId, groupToMerge.children[0]);
            if (added) {
                return mergeResult;
            }
        }

        groupToMerge.children.forEach((child) => mergeTrees(mergeResult, child));

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
