import type { BenchOptions } from 'vitest';
import { bench, suite } from 'vitest';

import type { GridApi } from 'ag-grid-community';
import { ClientSideRowModelApiModule, ClientSideRowModelModule } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import { SimplePRNG, TestGridsManager } from '../../../test-utils';

suite('treeData with getDataPath', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ClientSideRowModelApiModule, TreeDataModule],
    });

    let api!: GridApi<TreeDataPathData>;

    const rowData = buildRandomTreeDataPath(20000);
    const rowData1 = buildUpdatedRowData(rowData);

    const benchOptions: BenchOptions = {
        throws: true,
        setup: () => {
            api ??= gridsManager.createGrid('G', {
                columnDefs: [],
                autoGroupColumnDef: { headerName: 'Path' },
                rowData: [],
                treeData: true,
                groupDefaultExpanded: -1,
                getDataPath: (data: { path: string[] }) => data.path,
                getRowId: ({ data }: { data: { id: string } }) => data.id,
            });
        },
        teardown: () => {
            gridsManager.reset();
            api = undefined!;
        },
    };

    bench(
        'build from scratch',
        () => {
            console.error('build from scratch');
            api.setGridOption('rowData', []);
            api.setGridOption('rowData', rowData);
        },
        benchOptions
    );

    bench(
        'update rowData',
        () => {
            console.error('updt');
            api.setGridOption('rowData', rowData);
            api.setGridOption('rowData', rowData1);
        },
        benchOptions
    );
});

interface TreeDataPathData {
    id: string;
    path: string[];
}

/** Generate a random ag-grid tree getDataPath paths */
function buildRandomTreeDataPath(
    numberOfRows: number,
    maxDepth: number = 100,
    prng = new SimplePRNG(0x13d24a75)
): TreeDataPathData[] {
    const rows: TreeDataPathData[] = [];
    let keyCounter = 0;

    const newKey = () => keyCounter++ + '$' + prng.nextString(prng.nextInt(2, 30));
    const newFillerKey = () => prng.nextString(prng.nextInt(15, 30));

    const currentPath: string[] = [];

    const addRow = () => {
        for (let pop = 0; pop < 5; ++pop) {
            if (prng.nextFloat(0, 1) < 0.5) {
                break;
            }
            currentPath.pop();
        }

        const currentMaxDepth = prng.nextInt(1, maxDepth);

        if (prng.nextFloat(0, 1) < 0.5 && currentPath.length < currentMaxDepth) {
            currentPath.push(newKey());
            rows.push({ id: rows.length.toString(), path: currentPath.slice() });
        }

        const newPath = [...currentPath, newKey()];
        rows.push({ id: rows.length.toString(), path: newPath });

        if (prng.nextFloat(0, 1) < 0.5 && currentPath.length < currentMaxDepth - 1) {
            currentPath.push(newFillerKey());
            if (prng.nextFloat(0, 1) < 0.5 && currentPath.length < currentMaxDepth - 1) {
                currentPath.push(newFillerKey());
            }
        }
    };

    for (let i = 0; i < numberOfRows; i++) {
        addRow();
    }

    prng.shuffle(rows);
    return rows;
}

/** This adds some delete, add, update operations that affect the tree structure */
function buildUpdatedRowData(rows: TreeDataPathData[], prng = new SimplePRNG(0x3d24a75)) {
    rows = rows.slice();
    prng.shuffle(rows);

    let rowCount = rows.length;
    const maxDeletes = Math.floor(rowCount * 0.1);
    for (let i = 0; i < maxDeletes; i++) {
        rows.splice(prng.nextInt(0, rowCount - 1), 1);
    }
    rowCount = rows.length;

    const maxMove = Math.floor(rowCount * 0.1);
    for (let i = 0; i < maxMove; i++) {
        const indexToMove = prng.nextInt(0, rowCount - 1);
        const newParentRow = prng.nextInt(0, rowCount - 1);

        const rowToMove = rows[indexToMove];

        let key = rowToMove.path[rowToMove.path.length - 1];
        if (prng.nextFloat(0, 1) < 0.5) {
            key += '+' + i;
        }

        rows[indexToMove] = {
            ...rowToMove,
            path: [...rows[newParentRow].path, key],
        };
    }

    const maxAdds = Math.floor(rowCount * 0.1);
    for (let i = 0; i < maxAdds; i++) {
        const newParentRow = prng.nextInt(0, rowCount - 1);

        const path = rows[newParentRow].path;
        const newRow: TreeDataPathData = {
            id: rows.length.toString(),
            path: [...path, prng.nextString(12) + '+'],
        };
        rows.push(newRow);
    }

    return rows;
}
