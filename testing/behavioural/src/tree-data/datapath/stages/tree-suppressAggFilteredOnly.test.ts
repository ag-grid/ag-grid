import { ClientSideRowModelModule, NumberFilterModule } from 'ag-grid-community';
import { RowGroupingModule, TreeDataModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, cachedJSONObjects } from '../../../test-utils';

describe('ag-grid tree data suppressAggFilteredOnly', () => {
    const gridsManager = new TestGridsManager({
        modules: [NumberFilterModule, ClientSideRowModelModule, RowGroupingModule, TreeDataModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('AG-17020 toggling suppressAggFilteredOnly with active filter on tree data', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '0', path: ['Documents'], size: null },
            { id: '1', path: ['Documents', 'report.pdf'], size: 5000 },
            { id: '2', path: ['Documents', 'notes.txt'], size: 2000 },
            { id: '3', path: ['Documents', 'Presentations'], size: null },
            { id: '4', path: ['Documents', 'Presentations', 'deck.pptx'], size: 1000 },
            { id: '5', path: ['Music'], size: null },
            { id: '6', path: ['Music', 'song.mp3'], size: 3000 },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'size', aggFunc: 'sum', filter: 'agNumberColumnFilter' }],
            autoGroupColumnDef: { headerName: 'Files' },
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            suppressAggFilteredOnly: true,
            rowData,
            getRowId: (params) => params.data.id,
            getDataPath: (data: any) => data.path,
        });

        // Apply filter that matches only report.pdf (size = 5000)
        api.setFilterModel({
            size: { filterType: 'number', type: 'equals', filter: 5000 },
        });

        // Step 1: suppressAggFilteredOnly=true — agg includes ALL children (8000) but only report.pdf matches filter
        await new GridRows(api, 'filtered, suppressAggFilteredOnly=true').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ Documents GROUP id:0 ag-Grid-AutoColumn:"Documents" size:8000
            · └── report.pdf LEAF id:1 ag-Grid-AutoColumn:"report.pdf" size:5000
        `);

        // Step 2: toggle suppressAggFilteredOnly OFF — agg now reflects only filtered children
        api.setGridOption('suppressAggFilteredOnly', false);

        await new GridRows(api, 'filtered, suppressAggFilteredOnly=false').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ Documents GROUP id:0 ag-Grid-AutoColumn:"Documents" size:5000
            · └── report.pdf LEAF id:1 ag-Grid-AutoColumn:"report.pdf" size:5000
        `);

        // Step 3: toggle suppressAggFilteredOnly ON again — back to all children agg
        api.setGridOption('suppressAggFilteredOnly', true);

        await new GridRows(api, 'filtered, suppressAggFilteredOnly=true again').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ Documents GROUP id:0 ag-Grid-AutoColumn:"Documents" size:8000
            · └── report.pdf LEAF id:1 ag-Grid-AutoColumn:"report.pdf" size:5000
        `);

        // Step 4: toggle suppressAggFilteredOnly OFF one more time
        api.setGridOption('suppressAggFilteredOnly', false);

        await new GridRows(api, 'filtered, suppressAggFilteredOnly=false final').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ Documents GROUP id:0 ag-Grid-AutoColumn:"Documents" size:5000
            · └── report.pdf LEAF id:1 ag-Grid-AutoColumn:"report.pdf" size:5000
        `);
    });

    test('AG-17020 filler node aggregate matches filter with suppressAggFilteredOnly', async () => {
        // Tree data with filler nodes (no explicit data rows for groups).
        // The filter matches a filler node's aggregate value, NOT any leaf value.
        const rowData = cachedJSONObjects.array([
            { id: '0', path: ['Docs', 'Work', 'Proposal.docx'], size: 5000 },
            { id: '1', path: ['Docs', 'Work', 'Budget.xlsx'], size: 3000 },
            { id: '2', path: ['Docs', 'Personal', 'Taxes.pdf'], size: 2000 },
            { id: '3', path: ['Music', 'song.mp3'], size: 4000 },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'size', aggFunc: 'sum', filter: 'agNumberColumnFilter' }],
            autoGroupColumnDef: { headerName: 'Files' },
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            suppressAggFilteredOnly: true,
            rowData,
            getDataPath: (data: any) => data.path,
        });

        // Work filler aggregate = 5000 + 3000 = 8000. No leaf has size=8000.
        api.setFilterModel({
            size: { filterType: 'number', type: 'equals', filter: 8000 },
        });

        // Step 1: suppressAggFilteredOnly=true, Work filler agg=8000 matches filter
        await new GridRows(api, 'filter=8000, suppressAggFilteredOnly=true').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ Docs filler id:row-group-0-Docs ag-Grid-AutoColumn:"Docs" size:10000
            · └─┬ Work filler id:row-group-0-Docs-1-Work ag-Grid-AutoColumn:"Work" size:8000
            · · ├── Proposal.docx LEAF id:0 ag-Grid-AutoColumn:"Proposal.docx" size:5000
            · · └── Budget.xlsx LEAF id:1 ag-Grid-AutoColumn:"Budget.xlsx" size:3000
        `);

        // Step 2: toggle suppressAggFilteredOnly OFF — Docs agg changes to 8000 (filtered only)
        api.setGridOption('suppressAggFilteredOnly', false);

        await new GridRows(api, 'filter=8000, suppressAggFilteredOnly=false').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ Docs filler id:row-group-0-Docs ag-Grid-AutoColumn:"Docs" size:8000
            · └─┬ Work filler id:row-group-0-Docs-1-Work ag-Grid-AutoColumn:"Work" size:8000
            · · ├── Proposal.docx LEAF id:0 ag-Grid-AutoColumn:"Proposal.docx" size:5000
            · · └── Budget.xlsx LEAF id:1 ag-Grid-AutoColumn:"Budget.xlsx" size:3000
        `);

        // Step 3: toggle suppressAggFilteredOnly ON — Docs agg returns to 10000
        api.setGridOption('suppressAggFilteredOnly', true);

        await new GridRows(api, 'filter=8000, suppressAggFilteredOnly=true again').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ Docs filler id:row-group-0-Docs ag-Grid-AutoColumn:"Docs" size:10000
            · └─┬ Work filler id:row-group-0-Docs-1-Work ag-Grid-AutoColumn:"Work" size:8000
            · · ├── Proposal.docx LEAF id:0 ag-Grid-AutoColumn:"Proposal.docx" size:5000
            · · └── Budget.xlsx LEAF id:1 ag-Grid-AutoColumn:"Budget.xlsx" size:3000
        `);
    });
});
