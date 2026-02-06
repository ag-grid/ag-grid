import type { GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { RowGroupingModule, SetFilterModule, TreeDataModule } from 'ag-grid-enterprise';

import { TestGridsManager, applyTransactionChecked } from '../test-utils';
import { expect } from '../test-utils/matchers';

describe('IRowNode.getAggregatedChildren() with tree data', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, TreeDataModule, SetFilterModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('returns children for tree data group nodes', async () => {
        const gridOptions: GridOptions = {
            treeData: true,
            columnDefs: [{ field: 'name' }, { field: 'size', aggFunc: 'sum' }],
            autoGroupColumnDef: {
                headerName: 'File',
                cellRendererParams: { suppressCount: true },
            },
            getDataPath: (data) => data.path,
            getRowId: ({ data }) => data.id,
            groupDefaultExpanded: -1,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        applyTransactionChecked(api, {
            add: [
                { id: '1', path: ['Documents'], name: 'Documents', size: 0 },
                { id: '2', path: ['Documents', 'Work'], name: 'Work', size: 0 },
                { id: '3', path: ['Documents', 'Work', 'report.pdf'], name: 'report.pdf', size: 100 },
                { id: '4', path: ['Documents', 'Work', 'data.xlsx'], name: 'data.xlsx', size: 200 },
                { id: '5', path: ['Documents', 'Personal'], name: 'Personal', size: 0 },
                { id: '6', path: ['Documents', 'Personal', 'photo.jpg'], name: 'photo.jpg', size: 50 },
            ],
        });

        // Get the Documents folder
        const documentsNode = api.getRowNode('1');
        expect(documentsNode).toBeDefined();

        // getAggregatedChildren returns direct children (Work and Personal folders)
        // Pass 'size' column to verify column parameter works (non-pivot column returns all children)
        const docChildren = documentsNode!.getAggregatedChildren('size');
        expect(docChildren.length).toBe(2);
        expect(docChildren.map((n) => n.data?.name).sort()).toEqual(['Personal', 'Work']);

        // Get the Work folder
        const workNode = api.getRowNode('2');
        expect(workNode).toBeDefined();

        // getAggregatedChildren returns leaf files
        // Pass Column object to verify it works with Column instances
        const sizeCol = api.getColumn('size')!;
        const workChildren = workNode!.getAggregatedChildren(sizeCol);
        expect(workChildren.length).toBe(2);
        expect(workChildren.map((n) => n.data?.name).sort()).toEqual(['data.xlsx', 'report.pdf']);
    });

    test('tree data with filtering respects filter state', async () => {
        const gridOptions: GridOptions = {
            treeData: true,
            columnDefs: [
                { field: 'name', filter: 'agSetColumnFilter' },
                { field: 'size', aggFunc: 'sum' },
            ],
            autoGroupColumnDef: { headerName: 'File' },
            getDataPath: (data) => data.path,
            getRowId: ({ data }) => data.id,
            groupDefaultExpanded: -1,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        applyTransactionChecked(api, {
            add: [
                { id: '1', path: ['Folder'], name: 'Folder', size: 0 },
                { id: '2', path: ['Folder', 'file1.txt'], name: 'file1.txt', size: 10 },
                { id: '3', path: ['Folder', 'file2.txt'], name: 'file2.txt', size: 20 },
                { id: '4', path: ['Folder', 'image.png'], name: 'image.png', size: 30 },
            ],
        });

        const folderNode = api.getRowNode('1');
        expect(folderNode).toBeDefined();

        // Before filter: 3 children
        // Pass 'size' column to verify column parameter works with filtering
        let children = folderNode!.getAggregatedChildren('size');
        expect(children.length).toBe(3);

        // Filter to only show .txt files
        await api.setColumnFilterModel('name', { values: ['file1.txt', 'file2.txt'] });
        api.onFilterChanged();

        // After filter: 2 children
        children = folderNode!.getAggregatedChildren(null);
        expect(children.length).toBe(2);
        expect(children.map((n) => n.data?.name).sort()).toEqual(['file1.txt', 'file2.txt']);
    });
});
