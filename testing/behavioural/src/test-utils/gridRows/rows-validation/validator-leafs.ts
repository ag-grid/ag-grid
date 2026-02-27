import { RowNode } from 'ag-grid-community';

import { rowIdAndIndexToString } from '../../grid-test-utils';
import type { GridRows } from '../gridRows';
import type { GridRowsErrors } from './gridRowsErrors';

export interface RowAllLeafs {
    row: RowNode;
    leafs: RowNode[];
    count: number | null;
    allLeafChildren: Set<RowNode>;
}

export function verifyLeafs(
    errors: GridRowsErrors,
    allLeafsMap: Map<RowNode, RowAllLeafs>,
    gridRows: GridRows,
    row: RowNode
): RowAllLeafs {
    let result = allLeafsMap.get(row);
    if (result !== undefined) {
        return result;
    }

    let count = 0;
    let duplicates = 0;
    const allChildrenSet = new Set<RowNode>();
    const allLeafChildrenSet = new Set<RowNode>();

    const array = Array.isArray(row.childrenAfterAggFilter) ? row.childrenAfterAggFilter : [];
    const length = array.length;
    const treeData = gridRows.treeData;
    for (let i = 0; i < length; ++i) {
        const child = array[i];
        if (!(child instanceof RowNode)) {
            continue;
        }
        if (child === row) {
            errors.add(row, 'Found self in allChildren');
            continue;
        }
        const childAllChildren = verifyLeafs(errors, allLeafsMap, gridRows, array[i]);
        for (const leaf of childAllChildren.leafs) {
            if (allChildrenSet.has(leaf)) {
                ++duplicates;
            } else {
                allChildrenSet.add(leaf);
            }
        }

        if (treeData || !child.group) {
            ++count;
        }

        count += childAllChildren.count ?? 0;
    }

    errors.add(row, allChildrenSet.has(row) && 'Found self building allChildren');
    errors.add(row, duplicates > 0 && 'Found ' + duplicates + ' duplicates building allChildren');

    let allLeafChildrenDuplicates = 0;
    for (const child of Array.isArray(row.allLeafChildren) ? row.allLeafChildren : []) {
        if (!(child instanceof RowNode)) {
            continue;
        }
        if (allLeafChildrenSet.has(child)) {
            ++allLeafChildrenDuplicates;
        } else {
            allLeafChildrenSet.add(child);
        }
    }

    errors.add(row, allLeafChildrenSet.has(row) && 'Found self building allLeafChildren');
    errors.add(
        row,
        allLeafChildrenDuplicates > 0 && 'Found ' + allLeafChildrenDuplicates + ' duplicates building allLeafChildren'
    );

    const allLeafChildren = new Set(Array.isArray(row.allLeafChildren) ? row.allLeafChildren : []);
    for (const child of allLeafChildren) {
        if (!allLeafChildrenSet.has(child)) {
            errors.add(row, 'Missing ' + rowIdAndIndexToString(child) + ' in allLeafChildren');
        }
    }
    for (const child of allLeafChildrenSet) {
        if (!allLeafChildren.has(child)) {
            errors.add(row, 'Extra ' + rowIdAndIndexToString(child) + ' in allLeafChildren');
        }
    }

    result = {
        row,
        leafs: Array.from(allChildrenSet),
        count: count === 0 && row.level >= 0 ? null : count,
        allLeafChildren: allChildrenSet,
    };
    allLeafsMap.set(row, result);
    return result;
}

export function verifyAllLeafChildrenWithChildrenAfterGroup(errors: GridRowsErrors, row: RowNode): void {
    const allLeafsSet = new Set<RowNode>();
    const processed = new Set<RowNode>();

    const traverse = (node: RowNode) => {
        if (!(node instanceof RowNode)) {
            errors.add(row, 'Invalid child in childrenAfterGroup');
            return;
        }
        if (processed.has(node)) {
            errors.add(row, 'Circular reference in childrenAfterGroup ' + node.id);
            return;
        }
        processed.add(node);
        if (node.data) {
            allLeafsSet.add(node); // Not a group, not a filler node
        }
        const nodeChildren = node.childrenAfterGroup;
        if (nodeChildren) {
            for (const child of nodeChildren) {
                traverse(child);
            }
        }
    };

    const childrenAfterGroup = row.childrenAfterGroup;
    if (childrenAfterGroup) {
        for (const child of childrenAfterGroup) {
            traverse(child);
        }
    }

    const allLeafChildren = row.allLeafChildren;
    const allLeafChildrenSet = new Set(allLeafChildren);

    errors.add(
        row,
        allLeafChildrenSet.size !== allLeafsSet.size &&
            'allLeafChildren does not match. ' +
                allLeafChildrenSet.size +
                '!==' +
                allLeafsSet.size +
                ' : [' +
                Array.from(allLeafChildrenSet)
                    .map((n) => n.id)
                    .join(', ') +
                '] !== [' +
                Array.from(allLeafsSet)
                    .map((n) => n.id)
                    .join(', ') +
                ']'
    );

    for (const child of allLeafChildrenSet) {
        if (!allLeafsSet.has(child)) {
            errors.add(row, 'allLeafChildren does not match childrenAfterGroup');
            break;
        }
    }

    for (const child of allLeafsSet) {
        if (!allLeafChildrenSet.has(child)) {
            errors.add(row, 'allLeafChildren does not match childrenAfterGroup');
            break;
        }
    }

    errors.add(
        row,
        row.level >= 0 && allLeafChildren?.length === 0 && 'allLeafChildren should not be zero, should be null'
    );
}
