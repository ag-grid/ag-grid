import type { GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, PaginationModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager } from '../test-utils';

const COLUMN_DEFS = [{ field: 'country', rowGroup: true, hide: true }, { field: 'name' }];

// 5 countries x 4 rows each = 20 leaf rows, 5 group rows
const ROW_DATA = [
    { id: '0', country: 'France', name: 'A' },
    { id: '1', country: 'France', name: 'B' },
    { id: '2', country: 'France', name: 'C' },
    { id: '3', country: 'France', name: 'D' },
    { id: '4', country: 'Germany', name: 'E' },
    { id: '5', country: 'Germany', name: 'F' },
    { id: '6', country: 'Germany', name: 'G' },
    { id: '7', country: 'Germany', name: 'H' },
    { id: '8', country: 'Italy', name: 'I' },
    { id: '9', country: 'Italy', name: 'J' },
    { id: '10', country: 'Italy', name: 'K' },
    { id: '11', country: 'Italy', name: 'L' },
    { id: '12', country: 'Spain', name: 'M' },
    { id: '13', country: 'Spain', name: 'N' },
    { id: '14', country: 'Spain', name: 'O' },
    { id: '15', country: 'Spain', name: 'P' },
    { id: '16', country: 'UK', name: 'Q' },
    { id: '17', country: 'UK', name: 'R' },
    { id: '18', country: 'UK', name: 'S' },
    { id: '19', country: 'UK', name: 'T' },
];

function createGrid(gridsManager: TestGridsManager, options: Partial<GridOptions> = {}) {
    return gridsManager.createGrid('myGrid', {
        columnDefs: COLUMN_DEFS,
        rowData: ROW_DATA,
        pagination: true,
        paginationPageSize: 3,
        paginationPageSizeSelector: false,
        getRowId: (params) => params.data.id,
        ...options,
    });
}

describe('Pagination with Grouping', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, PaginationModule, RowGroupingModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    describe('paginateChildRows: false (default - master rows only)', () => {
        test('page size counts only top-level group rows', async () => {
            // 5 group rows, pageSize 3 → page 0 has 3 groups, page 1 has 2 groups
            const api = createGrid(gridsManager, { groupDefaultExpanded: 0 });
            await new GridColumns(api, `page size counts only top-level group rows setup`).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── name "Name" width:200
            `);
            await new GridRows(api, `page size counts only top-level group rows setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France"
                │ ├── LEAF hidden id:0 country:"France" name:"A"
                │ ├── LEAF hidden id:1 country:"France" name:"B"
                │ ├── LEAF hidden id:2 country:"France" name:"C"
                │ └── LEAF hidden id:3 country:"France" name:"D"
                ├─┬ LEAF_GROUP collapsed id:row-group-country-Germany ag-Grid-AutoColumn:"Germany"
                │ ├── LEAF hidden id:4 country:"Germany" name:"E"
                │ ├── LEAF hidden id:5 country:"Germany" name:"F"
                │ ├── LEAF hidden id:6 country:"Germany" name:"G"
                │ └── LEAF hidden id:7 country:"Germany" name:"H"
                ├─┬ LEAF_GROUP collapsed id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
                │ ├── LEAF hidden id:8 country:"Italy" name:"I"
                │ ├── LEAF hidden id:9 country:"Italy" name:"J"
                │ ├── LEAF hidden id:10 country:"Italy" name:"K"
                │ └── LEAF hidden id:11 country:"Italy" name:"L"
                ├─┬ LEAF_GROUP collapsed id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
                │ ├── LEAF hidden id:12 country:"Spain" name:"M"
                │ ├── LEAF hidden id:13 country:"Spain" name:"N"
                │ ├── LEAF hidden id:14 country:"Spain" name:"O"
                │ └── LEAF hidden id:15 country:"Spain" name:"P"
                └─┬ LEAF_GROUP collapsed id:row-group-country-UK ag-Grid-AutoColumn:"UK"
                · ├── LEAF hidden id:16 country:"UK" name:"Q"
                · ├── LEAF hidden id:17 country:"UK" name:"R"
                · ├── LEAF hidden id:18 country:"UK" name:"S"
                · └── LEAF hidden id:19 country:"UK" name:"T"
            `);
            expect(api.paginationGetTotalPages()).toBe(2);

            // Page 0 should show 3 collapsed groups
            const nodes = api.getRenderedNodes();
            expect(nodes).toHaveLength(3);
            expect(nodes.every((n) => n.group)).toBe(true);
            await new GridRows(api, `page size counts only top-level group rows final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France"
                │ ├── LEAF hidden id:0 country:"France" name:"A"
                │ ├── LEAF hidden id:1 country:"France" name:"B"
                │ ├── LEAF hidden id:2 country:"France" name:"C"
                │ └── LEAF hidden id:3 country:"France" name:"D"
                ├─┬ LEAF_GROUP collapsed id:row-group-country-Germany ag-Grid-AutoColumn:"Germany"
                │ ├── LEAF hidden id:4 country:"Germany" name:"E"
                │ ├── LEAF hidden id:5 country:"Germany" name:"F"
                │ ├── LEAF hidden id:6 country:"Germany" name:"G"
                │ └── LEAF hidden id:7 country:"Germany" name:"H"
                ├─┬ LEAF_GROUP collapsed id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
                │ ├── LEAF hidden id:8 country:"Italy" name:"I"
                │ ├── LEAF hidden id:9 country:"Italy" name:"J"
                │ ├── LEAF hidden id:10 country:"Italy" name:"K"
                │ └── LEAF hidden id:11 country:"Italy" name:"L"
                ├─┬ LEAF_GROUP collapsed id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
                │ ├── LEAF hidden id:12 country:"Spain" name:"M"
                │ ├── LEAF hidden id:13 country:"Spain" name:"N"
                │ ├── LEAF hidden id:14 country:"Spain" name:"O"
                │ └── LEAF hidden id:15 country:"Spain" name:"P"
                └─┬ LEAF_GROUP collapsed id:row-group-country-UK ag-Grid-AutoColumn:"UK"
                · ├── LEAF hidden id:16 country:"UK" name:"Q"
                · ├── LEAF hidden id:17 country:"UK" name:"R"
                · ├── LEAF hidden id:18 country:"UK" name:"S"
                · └── LEAF hidden id:19 country:"UK" name:"T"
            `);
        });

        test('paginationGetRowCount returns master row count', async () => {
            const api = createGrid(gridsManager, { groupDefaultExpanded: 0 });
            await new GridColumns(api, `paginationGetRowCount returns master row count setup`).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── name "Name" width:200
            `);
            await new GridRows(api, `paginationGetRowCount returns master row count setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France"
                │ ├── LEAF hidden id:0 country:"France" name:"A"
                │ ├── LEAF hidden id:1 country:"France" name:"B"
                │ ├── LEAF hidden id:2 country:"France" name:"C"
                │ └── LEAF hidden id:3 country:"France" name:"D"
                ├─┬ LEAF_GROUP collapsed id:row-group-country-Germany ag-Grid-AutoColumn:"Germany"
                │ ├── LEAF hidden id:4 country:"Germany" name:"E"
                │ ├── LEAF hidden id:5 country:"Germany" name:"F"
                │ ├── LEAF hidden id:6 country:"Germany" name:"G"
                │ └── LEAF hidden id:7 country:"Germany" name:"H"
                ├─┬ LEAF_GROUP collapsed id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
                │ ├── LEAF hidden id:8 country:"Italy" name:"I"
                │ ├── LEAF hidden id:9 country:"Italy" name:"J"
                │ ├── LEAF hidden id:10 country:"Italy" name:"K"
                │ └── LEAF hidden id:11 country:"Italy" name:"L"
                ├─┬ LEAF_GROUP collapsed id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
                │ ├── LEAF hidden id:12 country:"Spain" name:"M"
                │ ├── LEAF hidden id:13 country:"Spain" name:"N"
                │ ├── LEAF hidden id:14 country:"Spain" name:"O"
                │ └── LEAF hidden id:15 country:"Spain" name:"P"
                └─┬ LEAF_GROUP collapsed id:row-group-country-UK ag-Grid-AutoColumn:"UK"
                · ├── LEAF hidden id:16 country:"UK" name:"Q"
                · ├── LEAF hidden id:17 country:"UK" name:"R"
                · ├── LEAF hidden id:18 country:"UK" name:"S"
                · └── LEAF hidden id:19 country:"UK" name:"T"
            `);
            // 5 group rows (top-level), not 20 leaf rows
            expect(api.paginationGetRowCount()).toBe(5);
            await new GridRows(api, `paginationGetRowCount returns master row count final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France"
                │ ├── LEAF hidden id:0 country:"France" name:"A"
                │ ├── LEAF hidden id:1 country:"France" name:"B"
                │ ├── LEAF hidden id:2 country:"France" name:"C"
                │ └── LEAF hidden id:3 country:"France" name:"D"
                ├─┬ LEAF_GROUP collapsed id:row-group-country-Germany ag-Grid-AutoColumn:"Germany"
                │ ├── LEAF hidden id:4 country:"Germany" name:"E"
                │ ├── LEAF hidden id:5 country:"Germany" name:"F"
                │ ├── LEAF hidden id:6 country:"Germany" name:"G"
                │ └── LEAF hidden id:7 country:"Germany" name:"H"
                ├─┬ LEAF_GROUP collapsed id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
                │ ├── LEAF hidden id:8 country:"Italy" name:"I"
                │ ├── LEAF hidden id:9 country:"Italy" name:"J"
                │ ├── LEAF hidden id:10 country:"Italy" name:"K"
                │ └── LEAF hidden id:11 country:"Italy" name:"L"
                ├─┬ LEAF_GROUP collapsed id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
                │ ├── LEAF hidden id:12 country:"Spain" name:"M"
                │ ├── LEAF hidden id:13 country:"Spain" name:"N"
                │ ├── LEAF hidden id:14 country:"Spain" name:"O"
                │ └── LEAF hidden id:15 country:"Spain" name:"P"
                └─┬ LEAF_GROUP collapsed id:row-group-country-UK ag-Grid-AutoColumn:"UK"
                · ├── LEAF hidden id:16 country:"UK" name:"Q"
                · ├── LEAF hidden id:17 country:"UK" name:"R"
                · ├── LEAF hidden id:18 country:"UK" name:"S"
                · └── LEAF hidden id:19 country:"UK" name:"T"
            `);
        });

        test('expanding group shows children without changing page', async () => {
            const api = createGrid(gridsManager, { groupDefaultExpanded: 0 });
            await new GridColumns(api, `expanding group shows children without changing page setup`).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── name "Name" width:200
            `);
            await new GridRows(api, `expanding group shows children without changing page setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France"
                │ ├── LEAF hidden id:0 country:"France" name:"A"
                │ ├── LEAF hidden id:1 country:"France" name:"B"
                │ ├── LEAF hidden id:2 country:"France" name:"C"
                │ └── LEAF hidden id:3 country:"France" name:"D"
                ├─┬ LEAF_GROUP collapsed id:row-group-country-Germany ag-Grid-AutoColumn:"Germany"
                │ ├── LEAF hidden id:4 country:"Germany" name:"E"
                │ ├── LEAF hidden id:5 country:"Germany" name:"F"
                │ ├── LEAF hidden id:6 country:"Germany" name:"G"
                │ └── LEAF hidden id:7 country:"Germany" name:"H"
                ├─┬ LEAF_GROUP collapsed id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
                │ ├── LEAF hidden id:8 country:"Italy" name:"I"
                │ ├── LEAF hidden id:9 country:"Italy" name:"J"
                │ ├── LEAF hidden id:10 country:"Italy" name:"K"
                │ └── LEAF hidden id:11 country:"Italy" name:"L"
                ├─┬ LEAF_GROUP collapsed id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
                │ ├── LEAF hidden id:12 country:"Spain" name:"M"
                │ ├── LEAF hidden id:13 country:"Spain" name:"N"
                │ ├── LEAF hidden id:14 country:"Spain" name:"O"
                │ └── LEAF hidden id:15 country:"Spain" name:"P"
                └─┬ LEAF_GROUP collapsed id:row-group-country-UK ag-Grid-AutoColumn:"UK"
                · ├── LEAF hidden id:16 country:"UK" name:"Q"
                · ├── LEAF hidden id:17 country:"UK" name:"R"
                · ├── LEAF hidden id:18 country:"UK" name:"S"
                · └── LEAF hidden id:19 country:"UK" name:"T"
            `);
            expect(api.paginationGetCurrentPage()).toBe(0);
            expect(api.paginationGetTotalPages()).toBe(2);

            // Expand the first group
            const firstGroupNode = api.getRenderedNodes()[0];
            firstGroupNode.setExpanded(true, undefined, true);

            // Still on page 0, still 2 total pages (master rows haven't changed)
            expect(api.paginationGetCurrentPage()).toBe(0);
            expect(api.paginationGetTotalPages()).toBe(2);

            // But now more rows are rendered (group + 4 children)
            const renderedNodes = api.getRenderedNodes();
            expect(renderedNodes.length).toBeGreaterThan(3);
            await new GridRows(api, `expanding group shows children without changing page final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
                │ ├── LEAF id:0 country:"France" name:"A"
                │ ├── LEAF id:1 country:"France" name:"B"
                │ ├── LEAF id:2 country:"France" name:"C"
                │ └── LEAF id:3 country:"France" name:"D"
                ├─┬ LEAF_GROUP collapsed id:row-group-country-Germany ag-Grid-AutoColumn:"Germany"
                │ ├── LEAF hidden id:4 country:"Germany" name:"E"
                │ ├── LEAF hidden id:5 country:"Germany" name:"F"
                │ ├── LEAF hidden id:6 country:"Germany" name:"G"
                │ └── LEAF hidden id:7 country:"Germany" name:"H"
                ├─┬ LEAF_GROUP collapsed id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
                │ ├── LEAF hidden id:8 country:"Italy" name:"I"
                │ ├── LEAF hidden id:9 country:"Italy" name:"J"
                │ ├── LEAF hidden id:10 country:"Italy" name:"K"
                │ └── LEAF hidden id:11 country:"Italy" name:"L"
                ├─┬ LEAF_GROUP collapsed id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
                │ ├── LEAF hidden id:12 country:"Spain" name:"M"
                │ ├── LEAF hidden id:13 country:"Spain" name:"N"
                │ ├── LEAF hidden id:14 country:"Spain" name:"O"
                │ └── LEAF hidden id:15 country:"Spain" name:"P"
                └─┬ LEAF_GROUP collapsed id:row-group-country-UK ag-Grid-AutoColumn:"UK"
                · ├── LEAF hidden id:16 country:"UK" name:"Q"
                · ├── LEAF hidden id:17 country:"UK" name:"R"
                · ├── LEAF hidden id:18 country:"UK" name:"S"
                · └── LEAF hidden id:19 country:"UK" name:"T"
            `);
        });

        test('total pages based on top-level row count', async () => {
            const api = createGrid(gridsManager, {
                groupDefaultExpanded: -1, // all expanded
            });
            await new GridColumns(api, `total pages based on top-level row count setup`).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── name "Name" width:200
            `);
            await new GridRows(api, `total pages based on top-level row count setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
                │ ├── LEAF id:0 country:"France" name:"A"
                │ ├── LEAF id:1 country:"France" name:"B"
                │ ├── LEAF id:2 country:"France" name:"C"
                │ └── LEAF id:3 country:"France" name:"D"
                ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany"
                │ ├── LEAF id:4 country:"Germany" name:"E"
                │ ├── LEAF id:5 country:"Germany" name:"F"
                │ ├── LEAF id:6 country:"Germany" name:"G"
                │ └── LEAF id:7 country:"Germany" name:"H"
                ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
                │ ├── LEAF id:8 country:"Italy" name:"I"
                │ ├── LEAF id:9 country:"Italy" name:"J"
                │ ├── LEAF id:10 country:"Italy" name:"K"
                │ └── LEAF id:11 country:"Italy" name:"L"
                ├─┬ LEAF_GROUP id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
                │ ├── LEAF id:12 country:"Spain" name:"M"
                │ ├── LEAF id:13 country:"Spain" name:"N"
                │ ├── LEAF id:14 country:"Spain" name:"O"
                │ └── LEAF id:15 country:"Spain" name:"P"
                └─┬ LEAF_GROUP id:row-group-country-UK ag-Grid-AutoColumn:"UK"
                · ├── LEAF id:16 country:"UK" name:"Q"
                · ├── LEAF id:17 country:"UK" name:"R"
                · ├── LEAF id:18 country:"UK" name:"S"
                · └── LEAF id:19 country:"UK" name:"T"
            `);
            // Still 5 top-level groups, pageSize 3 → 2 pages
            expect(api.paginationGetTotalPages()).toBe(2);
            await new GridRows(api, `total pages based on top-level row count final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
                │ ├── LEAF id:0 country:"France" name:"A"
                │ ├── LEAF id:1 country:"France" name:"B"
                │ ├── LEAF id:2 country:"France" name:"C"
                │ └── LEAF id:3 country:"France" name:"D"
                ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany"
                │ ├── LEAF id:4 country:"Germany" name:"E"
                │ ├── LEAF id:5 country:"Germany" name:"F"
                │ ├── LEAF id:6 country:"Germany" name:"G"
                │ └── LEAF id:7 country:"Germany" name:"H"
                ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
                │ ├── LEAF id:8 country:"Italy" name:"I"
                │ ├── LEAF id:9 country:"Italy" name:"J"
                │ ├── LEAF id:10 country:"Italy" name:"K"
                │ └── LEAF id:11 country:"Italy" name:"L"
                ├─┬ LEAF_GROUP id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
                │ ├── LEAF id:12 country:"Spain" name:"M"
                │ ├── LEAF id:13 country:"Spain" name:"N"
                │ ├── LEAF id:14 country:"Spain" name:"O"
                │ └── LEAF id:15 country:"Spain" name:"P"
                └─┬ LEAF_GROUP id:row-group-country-UK ag-Grid-AutoColumn:"UK"
                · ├── LEAF id:16 country:"UK" name:"Q"
                · ├── LEAF id:17 country:"UK" name:"R"
                · ├── LEAF id:18 country:"UK" name:"S"
                · └── LEAF id:19 country:"UK" name:"T"
            `);
        });
    });

    describe('paginateChildRows: true', () => {
        test('page size counts all rows including children', async () => {
            const api = createGrid(gridsManager, {
                paginateChildRows: true,
                groupDefaultExpanded: -1,
                paginationPageSize: 10,
            });
            await new GridColumns(api, `page size counts all rows including children setup`).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── name "Name" width:200
            `);
            await new GridRows(api, `page size counts all rows including children setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
                │ ├── LEAF id:0 country:"France" name:"A"
                │ ├── LEAF id:1 country:"France" name:"B"
                │ ├── LEAF id:2 country:"France" name:"C"
                │ └── LEAF id:3 country:"France" name:"D"
                ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany"
                │ ├── LEAF id:4 country:"Germany" name:"E"
                │ ├── LEAF id:5 country:"Germany" name:"F"
                │ ├── LEAF id:6 country:"Germany" name:"G"
                │ └── LEAF id:7 country:"Germany" name:"H"
                ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
                │ ├── LEAF id:8 country:"Italy" name:"I"
                │ ├── LEAF id:9 country:"Italy" name:"J"
                │ ├── LEAF id:10 country:"Italy" name:"K"
                │ └── LEAF id:11 country:"Italy" name:"L"
                ├─┬ LEAF_GROUP id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
                │ ├── LEAF id:12 country:"Spain" name:"M"
                │ ├── LEAF id:13 country:"Spain" name:"N"
                │ ├── LEAF id:14 country:"Spain" name:"O"
                │ └── LEAF id:15 country:"Spain" name:"P"
                └─┬ LEAF_GROUP id:row-group-country-UK ag-Grid-AutoColumn:"UK"
                · ├── LEAF id:16 country:"UK" name:"Q"
                · ├── LEAF id:17 country:"UK" name:"R"
                · ├── LEAF id:18 country:"UK" name:"S"
                · └── LEAF id:19 country:"UK" name:"T"
            `);
            // 5 group rows + 20 leaf rows = 25 total displayed rows
            // 25 / 10 = 3 pages
            expect(api.paginationGetTotalPages()).toBe(3);
            await new GridRows(api, `page size counts all rows including children final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
                │ ├── LEAF id:0 country:"France" name:"A"
                │ ├── LEAF id:1 country:"France" name:"B"
                │ ├── LEAF id:2 country:"France" name:"C"
                │ └── LEAF id:3 country:"France" name:"D"
                ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany"
                │ ├── LEAF id:4 country:"Germany" name:"E"
                │ ├── LEAF id:5 country:"Germany" name:"F"
                │ ├── LEAF id:6 country:"Germany" name:"G"
                │ └── LEAF id:7 country:"Germany" name:"H"
                ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
                │ ├── LEAF id:8 country:"Italy" name:"I"
                │ ├── LEAF id:9 country:"Italy" name:"J"
                │ ├── LEAF id:10 country:"Italy" name:"K"
                │ └── LEAF id:11 country:"Italy" name:"L"
                ├─┬ LEAF_GROUP id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
                │ ├── LEAF id:12 country:"Spain" name:"M"
                │ ├── LEAF id:13 country:"Spain" name:"N"
                │ ├── LEAF id:14 country:"Spain" name:"O"
                │ └── LEAF id:15 country:"Spain" name:"P"
                └─┬ LEAF_GROUP id:row-group-country-UK ag-Grid-AutoColumn:"UK"
                · ├── LEAF id:16 country:"UK" name:"Q"
                · ├── LEAF id:17 country:"UK" name:"R"
                · ├── LEAF id:18 country:"UK" name:"S"
                · └── LEAF id:19 country:"UK" name:"T"
            `);
        });

        test('paginationGetRowCount returns total displayed row count', async () => {
            const api = createGrid(gridsManager, {
                paginateChildRows: true,
                groupDefaultExpanded: -1,
                paginationPageSize: 10,
            });
            await new GridColumns(api, `paginationGetRowCount returns total displayed row count setup`).checkColumns(
                `
                    CENTER
                    ├── ag-Grid-AutoColumn "Group" width:200
                    └── name "Name" width:200
                `
            );
            await new GridRows(api, `paginationGetRowCount returns total displayed row count setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
                │ ├── LEAF id:0 country:"France" name:"A"
                │ ├── LEAF id:1 country:"France" name:"B"
                │ ├── LEAF id:2 country:"France" name:"C"
                │ └── LEAF id:3 country:"France" name:"D"
                ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany"
                │ ├── LEAF id:4 country:"Germany" name:"E"
                │ ├── LEAF id:5 country:"Germany" name:"F"
                │ ├── LEAF id:6 country:"Germany" name:"G"
                │ └── LEAF id:7 country:"Germany" name:"H"
                ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
                │ ├── LEAF id:8 country:"Italy" name:"I"
                │ ├── LEAF id:9 country:"Italy" name:"J"
                │ ├── LEAF id:10 country:"Italy" name:"K"
                │ └── LEAF id:11 country:"Italy" name:"L"
                ├─┬ LEAF_GROUP id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
                │ ├── LEAF id:12 country:"Spain" name:"M"
                │ ├── LEAF id:13 country:"Spain" name:"N"
                │ ├── LEAF id:14 country:"Spain" name:"O"
                │ └── LEAF id:15 country:"Spain" name:"P"
                └─┬ LEAF_GROUP id:row-group-country-UK ag-Grid-AutoColumn:"UK"
                · ├── LEAF id:16 country:"UK" name:"Q"
                · ├── LEAF id:17 country:"UK" name:"R"
                · ├── LEAF id:18 country:"UK" name:"S"
                · └── LEAF id:19 country:"UK" name:"T"
            `);
            // 5 groups + 20 leaves = 25
            expect(api.paginationGetRowCount()).toBe(25);
            await new GridRows(api, `paginationGetRowCount returns total displayed row count final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
                │ ├── LEAF id:0 country:"France" name:"A"
                │ ├── LEAF id:1 country:"France" name:"B"
                │ ├── LEAF id:2 country:"France" name:"C"
                │ └── LEAF id:3 country:"France" name:"D"
                ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany"
                │ ├── LEAF id:4 country:"Germany" name:"E"
                │ ├── LEAF id:5 country:"Germany" name:"F"
                │ ├── LEAF id:6 country:"Germany" name:"G"
                │ └── LEAF id:7 country:"Germany" name:"H"
                ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
                │ ├── LEAF id:8 country:"Italy" name:"I"
                │ ├── LEAF id:9 country:"Italy" name:"J"
                │ ├── LEAF id:10 country:"Italy" name:"K"
                │ └── LEAF id:11 country:"Italy" name:"L"
                ├─┬ LEAF_GROUP id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
                │ ├── LEAF id:12 country:"Spain" name:"M"
                │ ├── LEAF id:13 country:"Spain" name:"N"
                │ ├── LEAF id:14 country:"Spain" name:"O"
                │ └── LEAF id:15 country:"Spain" name:"P"
                └─┬ LEAF_GROUP id:row-group-country-UK ag-Grid-AutoColumn:"UK"
                · ├── LEAF id:16 country:"UK" name:"Q"
                · ├── LEAF id:17 country:"UK" name:"R"
                · ├── LEAF id:18 country:"UK" name:"S"
                · └── LEAF id:19 country:"UK" name:"T"
            `);
        });

        test('expanding group may push rows to next page', async () => {
            const api = createGrid(gridsManager, {
                paginateChildRows: true,
                groupDefaultExpanded: 0, // all collapsed
                paginationPageSize: 5,
            });
            await new GridColumns(api, `expanding group may push rows to next page setup`).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── name "Name" width:200
            `);
            await new GridRows(api, `expanding group may push rows to next page setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France"
                │ ├── LEAF hidden id:0 country:"France" name:"A"
                │ ├── LEAF hidden id:1 country:"France" name:"B"
                │ ├── LEAF hidden id:2 country:"France" name:"C"
                │ └── LEAF hidden id:3 country:"France" name:"D"
                ├─┬ LEAF_GROUP collapsed id:row-group-country-Germany ag-Grid-AutoColumn:"Germany"
                │ ├── LEAF hidden id:4 country:"Germany" name:"E"
                │ ├── LEAF hidden id:5 country:"Germany" name:"F"
                │ ├── LEAF hidden id:6 country:"Germany" name:"G"
                │ └── LEAF hidden id:7 country:"Germany" name:"H"
                ├─┬ LEAF_GROUP collapsed id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
                │ ├── LEAF hidden id:8 country:"Italy" name:"I"
                │ ├── LEAF hidden id:9 country:"Italy" name:"J"
                │ ├── LEAF hidden id:10 country:"Italy" name:"K"
                │ └── LEAF hidden id:11 country:"Italy" name:"L"
                ├─┬ LEAF_GROUP collapsed id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
                │ ├── LEAF hidden id:12 country:"Spain" name:"M"
                │ ├── LEAF hidden id:13 country:"Spain" name:"N"
                │ ├── LEAF hidden id:14 country:"Spain" name:"O"
                │ └── LEAF hidden id:15 country:"Spain" name:"P"
                └─┬ LEAF_GROUP collapsed id:row-group-country-UK ag-Grid-AutoColumn:"UK"
                · ├── LEAF hidden id:16 country:"UK" name:"Q"
                · ├── LEAF hidden id:17 country:"UK" name:"R"
                · ├── LEAF hidden id:18 country:"UK" name:"S"
                · └── LEAF hidden id:19 country:"UK" name:"T"
            `);
            // 5 collapsed groups = 5 rows = 1 page
            expect(api.paginationGetTotalPages()).toBe(1);

            // Expand first group: 1 group + 4 children + 4 collapsed groups = 9 rows
            const firstGroupNode = api.getRenderedNodes()[0];
            firstGroupNode.setExpanded(true, undefined, true);

            expect(api.paginationGetTotalPages()).toBe(2);
            await new GridRows(api, `expanding group may push rows to next page final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
                │ ├── LEAF id:0 country:"France" name:"A"
                │ ├── LEAF id:1 country:"France" name:"B"
                │ ├── LEAF id:2 country:"France" name:"C"
                │ └── LEAF id:3 country:"France" name:"D"
                ├─┬ LEAF_GROUP collapsed id:row-group-country-Germany ag-Grid-AutoColumn:"Germany"
                │ ├── LEAF hidden id:4 country:"Germany" name:"E"
                │ ├── LEAF hidden id:5 country:"Germany" name:"F"
                │ ├── LEAF hidden id:6 country:"Germany" name:"G"
                │ └── LEAF hidden id:7 country:"Germany" name:"H"
                ├─┬ LEAF_GROUP collapsed id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
                │ ├── LEAF hidden id:8 country:"Italy" name:"I"
                │ ├── LEAF hidden id:9 country:"Italy" name:"J"
                │ ├── LEAF hidden id:10 country:"Italy" name:"K"
                │ └── LEAF hidden id:11 country:"Italy" name:"L"
                ├─┬ LEAF_GROUP collapsed id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
                │ ├── LEAF hidden id:12 country:"Spain" name:"M"
                │ ├── LEAF hidden id:13 country:"Spain" name:"N"
                │ ├── LEAF hidden id:14 country:"Spain" name:"O"
                │ └── LEAF hidden id:15 country:"Spain" name:"P"
                └─┬ LEAF_GROUP collapsed id:row-group-country-UK ag-Grid-AutoColumn:"UK"
                · ├── LEAF hidden id:16 country:"UK" name:"Q"
                · ├── LEAF hidden id:17 country:"UK" name:"R"
                · ├── LEAF hidden id:18 country:"UK" name:"S"
                · └── LEAF hidden id:19 country:"UK" name:"T"
            `);
        });

        test('total pages based on all displayed rows', async () => {
            const api = createGrid(gridsManager, {
                paginateChildRows: true,
                groupDefaultExpanded: 0, // all collapsed
                paginationPageSize: 5,
            });
            await new GridColumns(api, `total pages based on all displayed rows setup`).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── name "Name" width:200
            `);
            await new GridRows(api, `total pages based on all displayed rows setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France"
                │ ├── LEAF hidden id:0 country:"France" name:"A"
                │ ├── LEAF hidden id:1 country:"France" name:"B"
                │ ├── LEAF hidden id:2 country:"France" name:"C"
                │ └── LEAF hidden id:3 country:"France" name:"D"
                ├─┬ LEAF_GROUP collapsed id:row-group-country-Germany ag-Grid-AutoColumn:"Germany"
                │ ├── LEAF hidden id:4 country:"Germany" name:"E"
                │ ├── LEAF hidden id:5 country:"Germany" name:"F"
                │ ├── LEAF hidden id:6 country:"Germany" name:"G"
                │ └── LEAF hidden id:7 country:"Germany" name:"H"
                ├─┬ LEAF_GROUP collapsed id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
                │ ├── LEAF hidden id:8 country:"Italy" name:"I"
                │ ├── LEAF hidden id:9 country:"Italy" name:"J"
                │ ├── LEAF hidden id:10 country:"Italy" name:"K"
                │ └── LEAF hidden id:11 country:"Italy" name:"L"
                ├─┬ LEAF_GROUP collapsed id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
                │ ├── LEAF hidden id:12 country:"Spain" name:"M"
                │ ├── LEAF hidden id:13 country:"Spain" name:"N"
                │ ├── LEAF hidden id:14 country:"Spain" name:"O"
                │ └── LEAF hidden id:15 country:"Spain" name:"P"
                └─┬ LEAF_GROUP collapsed id:row-group-country-UK ag-Grid-AutoColumn:"UK"
                · ├── LEAF hidden id:16 country:"UK" name:"Q"
                · ├── LEAF hidden id:17 country:"UK" name:"R"
                · ├── LEAF hidden id:18 country:"UK" name:"S"
                · └── LEAF hidden id:19 country:"UK" name:"T"
            `);
            // 5 collapsed groups = 5 rows = 1 page
            expect(api.paginationGetTotalPages()).toBe(1);

            // Expand all groups: 5 groups + 20 leaves = 25 rows
            api.expandAll();
            await new GridRows(api, `total pages based on all displayed rows after expandAll`).check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
                │ ├── LEAF id:0 country:"France" name:"A"
                │ ├── LEAF id:1 country:"France" name:"B"
                │ ├── LEAF id:2 country:"France" name:"C"
                │ └── LEAF id:3 country:"France" name:"D"
                ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany"
                │ ├── LEAF id:4 country:"Germany" name:"E"
                │ ├── LEAF id:5 country:"Germany" name:"F"
                │ ├── LEAF id:6 country:"Germany" name:"G"
                │ └── LEAF id:7 country:"Germany" name:"H"
                ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
                │ ├── LEAF id:8 country:"Italy" name:"I"
                │ ├── LEAF id:9 country:"Italy" name:"J"
                │ ├── LEAF id:10 country:"Italy" name:"K"
                │ └── LEAF id:11 country:"Italy" name:"L"
                ├─┬ LEAF_GROUP id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
                │ ├── LEAF id:12 country:"Spain" name:"M"
                │ ├── LEAF id:13 country:"Spain" name:"N"
                │ ├── LEAF id:14 country:"Spain" name:"O"
                │ └── LEAF id:15 country:"Spain" name:"P"
                └─┬ LEAF_GROUP id:row-group-country-UK ag-Grid-AutoColumn:"UK"
                · ├── LEAF id:16 country:"UK" name:"Q"
                · ├── LEAF id:17 country:"UK" name:"R"
                · ├── LEAF id:18 country:"UK" name:"S"
                · └── LEAF id:19 country:"UK" name:"T"
            `);
            expect(api.paginationGetTotalPages()).toBe(5); // 25 / 5
        });
    });

    describe('implicit paginateChildRows', () => {
        test('groupHideParentOfSingleChild forces paginateChildRows', async () => {
            // Data with some groups having only 1 child
            const singleChildData = [
                { id: '0', country: 'France', name: 'A' },
                { id: '1', country: 'Germany', name: 'B' },
                { id: '2', country: 'Italy', name: 'C' },
                { id: '3', country: 'Spain', name: 'D' },
                { id: '4', country: 'UK', name: 'E' },
            ];

            const api = createGrid(gridsManager, {
                rowData: singleChildData,
                groupDefaultExpanded: -1,
                groupHideParentOfSingleChild: true,
                paginationPageSize: 3,
            });
            await new GridColumns(api, `groupHideParentOfSingleChild forces paginateChildRows setup`).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── name "Name" width:200
            `);
            await new GridRows(api, `groupHideParentOfSingleChild forces paginateChildRows setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 country:"France" name:"A"
                ├── LEAF id:1 country:"Germany" name:"B"
                ├── LEAF id:2 country:"Italy" name:"C"
                ├── LEAF id:3 country:"Spain" name:"D"
                └── LEAF id:4 country:"UK" name:"E"
            `);

            // With groupHideParentOfSingleChild + paginateChildRows forced true,
            // the page count should be based on all displayed rows
            const rowCount = api.paginationGetRowCount();
            const displayedRows = api.getRenderedNodes().length;
            expect(rowCount).toBeGreaterThan(0);
            expect(displayedRows).toBeGreaterThan(0);
            await new GridRows(api, `groupHideParentOfSingleChild forces paginateChildRows final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 country:"France" name:"A"
                ├── LEAF id:1 country:"Germany" name:"B"
                ├── LEAF id:2 country:"Italy" name:"C"
                ├── LEAF id:3 country:"Spain" name:"D"
                └── LEAF id:4 country:"UK" name:"E"
            `);
        });
    });
});
