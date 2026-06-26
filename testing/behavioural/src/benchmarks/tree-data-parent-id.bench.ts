import { bench, suite } from 'vitest';

import type { GridApi } from 'ag-grid-community';
import { ClientSideRowModelApiModule, ClientSideRowModelModule, ValidationModule } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import { BenchGridsManager, SimplePRNG, benchDefaults } from './bench-utils';

suite('treeData with parentId', () => {
    const gridsManager = new BenchGridsManager({
        modules: [ValidationModule, ClientSideRowModelModule, ClientSideRowModelApiModule, TreeDataModule],
    });
    let api!: GridApi<TreeDataParentIdRow>;

    const rowData = buildRandomParentIdRows(12000);
    const rowData1 = buildUpdatedRowData(rowData);

    const options = benchDefaults({
        noiseFactor: 3,
        setup: () => {
            api ??= gridsManager.createGrid('G', {
                columnDefs: [{ field: 'label' }],
                autoGroupColumnDef: { headerName: 'Parent Id' },
                rowData: [],
                treeData: true,
                groupDefaultExpanded: -1,
                treeDataParentIdField: 'parentId',
                getRowId: ({ data }: { data: TreeDataParentIdRow }) => data.id,
            });
        },
        teardown: async () => {
            api = undefined!;
            await gridsManager.reset();
        },
    }); // noisy suite (~3.4% rme @1×)

    bench(
        'build from scratch ' + rowData.length + ' rows',
        () => {
            api.setGridOption('rowData', []);
            api.setGridOption('rowData', rowData);
        },
        options
    );

    let updateForward = true;
    bench(
        'update rowData ' + rowData1.length + ' rows',
        () => {
            api.setGridOption('rowData', updateForward ? rowData1 : rowData);
            updateForward = !updateForward;
        },
        options
    );
});

interface TreeDataParentIdRow {
    id: string;
    parentId?: string;
    label: string;
}

function buildRandomParentIdRows(
    numberOfRows: number,
    maxDepth: number = 8,
    prng = new SimplePRNG(0x1f3a7c5)
): TreeDataParentIdRow[] {
    const rows: TreeDataParentIdRow[] = [];
    const pathStack: { id: string; depth: number }[] = [];
    let idCounter = 0;

    const newId = () => 'N' + (idCounter++).toString(36) + '-' + prng.nextString(6);

    const maybePop = () => {
        for (let pop = 0; pop < 3; pop++) {
            if (pathStack.length === 0 || prng.nextFloat(0, 1) < 0.55) {
                break;
            }
            pathStack.pop();
        }
    };

    for (let i = 0; i < numberOfRows; i++) {
        maybePop();

        let parent: { id: string; depth: number } | undefined = pathStack[pathStack.length - 1];
        if (parent && parent.depth >= maxDepth - 1 && prng.nextFloat(0, 1) < 0.5) {
            parent = undefined;
        }

        const depth = parent ? parent.depth + 1 : 0;
        const row: TreeDataParentIdRow = {
            id: newId(),
            parentId: parent?.id,
            label: prng.nextString(prng.nextInt(6, 18)),
        };
        rows.push(row);

        if (depth < maxDepth - 1 && prng.nextFloat(0, 1) < 0.65) {
            pathStack.push({ id: row.id, depth });
        }
    }

    return rows;
}

function buildUpdatedRowData(rows: TreeDataParentIdRow[], prng = new SimplePRNG(0x2374bf1)) {
    const updated = rows.map((row) => ({ ...row }));
    prng.shuffle(updated);

    const rowById = new Map(updated.map((row) => [row.id, row]));
    const positionById = new Map<string, number>();
    const childrenByParentId = new Map<string, Set<string>>();

    const syncPositions = () => {
        positionById.clear();
        for (let i = 0; i < updated.length; i++) {
            positionById.set(updated[i].id, i);
        }
    };

    const registerChild = (parentId: string | undefined, childId: string) => {
        if (!parentId) {
            return;
        }
        let children = childrenByParentId.get(parentId);
        if (!children) {
            children = new Set();
            childrenByParentId.set(parentId, children);
        }
        children.add(childId);
    };

    const unregisterChild = (parentId: string | undefined, childId: string) => {
        if (!parentId) {
            return;
        }
        const children = childrenByParentId.get(parentId);
        if (!children) {
            return;
        }
        children.delete(childId);
        if (children.size === 0) {
            childrenByParentId.delete(parentId);
        }
    };

    const removeRowFromArray = (rowId: string) => {
        const index = positionById.get(rowId);
        if (index === undefined) {
            return;
        }
        const lastIndex = updated.length - 1;
        if (index !== lastIndex) {
            const lastRow = updated[lastIndex];
            updated[index] = lastRow;
            positionById.set(lastRow.id, index);
        }
        updated.pop();
        positionById.delete(rowId);
    };

    const deleteRowAndDescendants = (rowId: string) => {
        const stack = [rowId];
        while (stack.length) {
            const id = stack.pop()!;
            const row = rowById.get(id);
            if (!row) {
                continue;
            }

            rowById.delete(id);
            unregisterChild(row.parentId, row.id);

            const childSet = childrenByParentId.get(id);
            if (childSet) {
                for (const childId of childSet) {
                    stack.push(childId);
                }
                childrenByParentId.delete(id);
            }

            removeRowFromArray(id);
        }
    };

    const setParent = (row: TreeDataParentIdRow, parentId: string | undefined) => {
        if (row.parentId === parentId) {
            return;
        }
        unregisterChild(row.parentId, row.id);
        row.parentId = parentId;
        registerChild(parentId, row.id);
    };

    syncPositions();
    for (const row of updated) {
        registerChild(row.parentId, row.id);
    }

    let rowCount = updated.length;

    const maxDeletes = Math.floor(rowCount * 0.08);
    for (let i = 0; i < maxDeletes && rowCount > 0; i++) {
        const index = prng.nextInt(0, rowCount - 1);
        const rowId = updated[index].id;
        deleteRowAndDescendants(rowId);
        rowCount = updated.length;
    }

    const maxMoves = Math.floor(rowCount * 0.18);
    for (let i = 0; i < maxMoves && rowCount > 1; i++) {
        const indexToMove = prng.nextInt(0, rowCount - 1);
        const newParentIndex = prng.nextInt(0, rowCount - 1);
        const rowToMove = updated[indexToMove];
        const parentCandidate = updated[newParentIndex];

        if (!parentCandidate || prng.nextFloat(0, 1) < 0.15) {
            setParent(rowToMove, undefined);
            continue;
        }

        if (wouldCreateCycle(rowById, rowToMove.id, parentCandidate.id)) {
            setParent(rowToMove, undefined);
            continue;
        }

        setParent(rowToMove, parentCandidate.id);
    }

    const maxAdds = Math.floor(rowCount * 0.12);
    for (let i = 0; i < maxAdds; i++) {
        const parentIndex = rowCount ? prng.nextInt(0, rowCount - 1) : -1;
        const parentRow = parentIndex >= 0 ? updated[parentIndex] : undefined;

        const newRow: TreeDataParentIdRow = {
            id: generateUniqueId(rowById, prng),
            parentId: parentRow?.id,
            label: prng.nextString(10) + '+',
        };
        updated.push(newRow);
        rowById.set(newRow.id, newRow);
        positionById.set(newRow.id, updated.length - 1);
        registerChild(newRow.parentId, newRow.id);
        rowCount = updated.length;
    }

    return updated;
}

function wouldCreateCycle(
    rowById: Map<string, TreeDataParentIdRow>,
    movingRowId: string,
    candidateParentId: string
): boolean {
    if (movingRowId === candidateParentId) {
        return true;
    }

    let cursor = rowById.get(candidateParentId);
    while (cursor) {
        if (cursor.id === movingRowId) {
            return true;
        }
        cursor = cursor.parentId ? rowById.get(cursor.parentId) : undefined;
    }

    return false;
}

function generateUniqueId(rowById: Map<string, TreeDataParentIdRow>, prng: SimplePRNG): string {
    let id: string;
    do {
        id = 'N' + prng.nextInt(0, 0xfffffff).toString(16) + '-' + prng.nextString(5);
    } while (rowById.has(id));
    return id;
}
