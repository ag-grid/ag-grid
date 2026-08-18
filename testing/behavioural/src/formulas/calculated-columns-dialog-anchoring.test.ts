import { waitFor } from '@testing-library/dom';
import { GridColumns, clickMenuOption } from 'ag-test-utils';

import type { ColGroupDef } from 'ag-grid-community';

import {
    clickDialogButton,
    createGrid,
    findColumnDef,
    findGroupDef,
    getExpressionInput,
    setExpression,
    setupCalculatedColumnsSuite,
    showColumnMenu,
} from './calculatedColumnsHarness';

describe('ag-grid calculated columns', () => {
    setupCalculatedColumnsSuite();

    test('dialog adds calculated columns inside groups without mutating provided column definitions', async () => {
        const year2025: ColGroupDef = {
            groupId: 'year_2025',
            headerName: '2025',
            children: [
                { field: 'revenue2025', colId: 'revenue_2025', headerName: 'Revenue' },
                { field: 'cost2025', colId: 'cost_2025', headerName: 'Cost' },
            ],
        };
        const year2026: ColGroupDef = {
            groupId: 'year_2026',
            headerName: '2026',
            children: [
                { field: 'revenue2026', colId: 'revenue_2026', headerName: 'Revenue' },
                { field: 'cost2026', colId: 'cost_2026', headerName: 'Cost' },
            ],
        };
        const columnDefs: ColGroupDef[] = [year2025, year2026];
        const suppliedColumnDefs = structuredClone(columnDefs);
        const api = createGrid('calculated-dialog-group-no-mutation', {
            calculatedColumns: { applyMode: 'deferred' },
            rowData: [{ id: 'r1', revenue2025: 10, cost2025: 3, revenue2026: 20, cost2026: 8 }],
            columnDefs,
        });

        showColumnMenu(api, 'revenue_2025');
        await clickMenuOption('Add Calculated Column');
        await waitFor(() => getExpressionInput());

        setExpression('[2025 Revenue] - [2025 Cost]');
        clickDialogButton('Apply');
        await waitFor(() =>
            expect(findColumnDef(api.getColumnDefs()!, 'calculated_1')?.calculatedExpression).toBeTruthy()
        );

        // Against a clone taken before the grid saw them: comparing to the same objects would pass however
        // badly they were mutated.
        expect(columnDefs).toEqual(suppliedColumnDefs);
        expect(year2025.children).toHaveLength(2);

        const projectedYear2025 = findGroupDef(api.getColumnDefs()!, 'year_2025');
        expect(
            projectedYear2025?.children.map((colDef) => ('children' in colDef ? colDef.groupId : colDef.colId))
        ).toEqual(['revenue_2025', 'calculated_1', 'cost_2025']);
        expect(api.getAllDisplayedColumns().map((column) => column.getColId())).toEqual([
            'revenue_2025',
            'calculated_1',
            'cost_2025',
            'revenue_2026',
            'cost_2026',
        ]);
        expect(findColumnDef(api.getColumnDefs()!, 'calculated_1')?.calculatedExpression).toBe(
            '[revenue_2025] - [cost_2025]'
        );
        await new GridColumns(
            api,
            'dialog adds calculated columns inside groups without mutating provided column definitions'
        ).checkColumns(`
            CENTER
            ├─┬ "2025" GROUP
            │ ├── revenue_2025 "Revenue" width:200
            │ ├── calculated_1 "Untitled" width:200 ƒ
            │ └── cost_2025 "Cost" width:200
            └─┬ "2026" GROUP
              ├── revenue_2026 "Revenue" width:200
              └── cost_2026 "Cost" width:200
        `);
    });

    test('dialog inserts calculated columns after generated auto group columns in visible order', async () => {
        const api = createGrid('calculated-dialog-auto-group-order', {
            calculatedColumns: { applyMode: 'deferred' },
            rowData: [{ id: 'r1', productType: 'A', revenue: 10, cost: 3 }],
            columnDefs: [{ field: 'productType', rowGroup: true, hide: true }, { field: 'revenue' }, { field: 'cost' }],
        });

        expect(api.getAllDisplayedColumns().map((column) => column.getColId())).toEqual([
            'ag-Grid-AutoColumn',
            'revenue',
            'cost',
        ]);

        showColumnMenu(api, 'ag-Grid-AutoColumn');
        await clickMenuOption('Add Calculated Column');
        await waitFor(() => getExpressionInput());

        setExpression('[Revenue] - [Cost]');
        clickDialogButton('Apply');
        await waitFor(() =>
            expect(findColumnDef(api.getColumnDefs()!, 'calculated_1')?.calculatedExpression).toBe('[revenue] - [cost]')
        );

        expect(api.getAllDisplayedColumns().map((column) => column.getColId())).toEqual([
            'ag-Grid-AutoColumn',
            'calculated_1',
            'revenue',
            'cost',
        ]);
        await new GridColumns(
            api,
            'dialog inserts calculated columns after generated auto group columns in visible order'
        ).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── calculated_1 "Untitled" width:200 ƒ
            ├── revenue "Revenue" width:200
            └── cost "Cost" width:200
        `);
    });

    test('calc col anchored to the auto-group col returns behind it after a grouping toggle', async () => {
        const api = createGrid('calculated-autogroup-toggle', {
            rowData: [{ id: 'r1', productType: 'A', revenue: 10, cost: 3 }],
            columnDefs: [{ field: 'productType', rowGroup: true, hide: true }, { field: 'revenue' }, { field: 'cost' }],
        });
        await new GridColumns(api, 'auto-group toggle - initial').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── revenue "Revenue" width:200
            └── cost "Cost" width:200
        `);

        showColumnMenu(api, 'ag-Grid-AutoColumn');
        await clickMenuOption('Add Calculated Column');
        await waitFor(() => getExpressionInput());
        setExpression('[Revenue] - [Cost]');
        clickDialogButton('Apply');
        await new GridColumns(api, 'auto-group toggle - after add').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── calculated_1 "Untitled" width:200 ƒ
            ├── revenue "Revenue" width:200
            └── cost "Cost" width:200
        `);

        api.setRowGroupColumns([]);
        await new GridColumns(api, 'auto-group toggle - ungrouped').checkColumns(`
            CENTER
            ├── calculated_1 "Untitled" width:200 ƒ
            ├── productType "Product Type" width:200
            ├── revenue "Revenue" width:200
            └── cost "Cost" width:200
        `);

        api.setRowGroupColumns(['productType']);
        await new GridColumns(api, 'auto-group toggle - re-grouped').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── calculated_1 "Untitled" width:200 ƒ
            ├── revenue "Revenue" width:200
            └── cost "Cost" width:200
        `);
    });

    // Regrouping rebuilds the auto-group columns as a leading block, so the calc col ends up after both
    // rather than back beside the one it was anchored to. Whether the anchor should survive the round trip
    // is a product question, so this pins what happens today and claims nothing about what should.
    test('(characterization) calc col added against an auto-group col sits after both once grouping is toggled', async () => {
        const api = createGrid('calculated-autogroup-toggle-multi', {
            calculatedColumns: { applyMode: 'deferred' },
            groupDisplayType: 'multipleColumns',
            rowData: [{ id: 'r1', productType: 'A', country: 'UK', revenue: 10, cost: 3 }],
            columnDefs: [
                { field: 'productType', rowGroup: true, hide: true },
                { field: 'country', rowGroup: true, hide: true },
                { field: 'revenue' },
                { field: 'cost' },
            ],
        });
        await new GridColumns(api, 'two auto-group toggle - initial').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn-productType "Product Type" width:200
            ├── ag-Grid-AutoColumn-country "Country" width:200
            ├── revenue "Revenue" width:200
            └── cost "Cost" width:200
        `);

        showColumnMenu(api, 'ag-Grid-AutoColumn-productType');
        await clickMenuOption('Add Calculated Column');
        await waitFor(() => getExpressionInput());
        setExpression('[Revenue] - [Cost]');
        clickDialogButton('Apply');
        await new GridColumns(api, 'two auto-group toggle - after add').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn-productType "Product Type" width:200
            ├── calculated_1 "Untitled" width:200 ƒ
            ├── ag-Grid-AutoColumn-country "Country" width:200
            ├── revenue "Revenue" width:200
            └── cost "Cost" width:200
        `);

        api.setRowGroupColumns([]);
        await new GridColumns(api, 'two auto-group toggle - ungrouped').checkColumns(`
            CENTER
            ├── calculated_1 "Untitled" width:200 ƒ
            ├── productType "Product Type" width:200
            ├── country "Country" width:200
            ├── revenue "Revenue" width:200
            └── cost "Cost" width:200
        `);

        api.setRowGroupColumns(['productType', 'country']);
        await new GridColumns(api, 'two auto-group toggle - re-grouped').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn-productType "Product Type" width:200
            ├── ag-Grid-AutoColumn-country "Country" width:200
            ├── calculated_1 "Untitled" width:200 ƒ
            ├── revenue "Revenue" width:200
            └── cost "Cost" width:200
        `);
    });

    test('dialog inserts calculated columns after the clicked generated auto group column in multiple-columns mode', async () => {
        const api = createGrid('calculated-dialog-multiple-auto-group-order', {
            calculatedColumns: { applyMode: 'deferred' },
            groupDisplayType: 'multipleColumns',
            rowData: [{ id: 'r1', productType: 'A', country: 'UK', revenue: 10, cost: 3 }],
            columnDefs: [
                { field: 'productType', rowGroup: true, hide: true },
                { field: 'country', rowGroup: true, hide: true },
                { field: 'revenue' },
                { field: 'cost' },
            ],
        });

        expect(api.getAllDisplayedColumns().map((column) => column.getColId())).toEqual([
            'ag-Grid-AutoColumn-productType',
            'ag-Grid-AutoColumn-country',
            'revenue',
            'cost',
        ]);

        showColumnMenu(api, 'ag-Grid-AutoColumn-productType');
        await clickMenuOption('Add Calculated Column');
        await waitFor(() => getExpressionInput());

        setExpression('[Revenue] - [Cost]');
        clickDialogButton('Apply');
        await waitFor(() =>
            expect(findColumnDef(api.getColumnDefs()!, 'calculated_1')?.calculatedExpression).toBe('[revenue] - [cost]')
        );

        expect(api.getAllDisplayedColumns().map((column) => column.getColId())).toEqual([
            'ag-Grid-AutoColumn-productType',
            'calculated_1',
            'ag-Grid-AutoColumn-country',
            'revenue',
            'cost',
        ]);
        await new GridColumns(
            api,
            'dialog inserts calculated columns after the clicked generated auto group column in multiple-columns mode'
        ).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn-productType "Product Type" width:200
            ├── calculated_1 "Untitled" width:200 ƒ
            ├── ag-Grid-AutoColumn-country "Country" width:200
            ├── revenue "Revenue" width:200
            └── cost "Cost" width:200
        `);
    });

    test('dialog-anchored calculated column can be moved away from its anchor and stays moved across refreshes', async () => {
        const api = createGrid('calculated-dialog-anchor-then-move', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3, other: 1 }],
            columnDefs: [{ field: 'revenue' }, { field: 'cost' }, { field: 'other' }],
        });

        showColumnMenu(api, 'revenue');
        await clickMenuOption('Add Calculated Column');
        await waitFor(() => getExpressionInput());

        setExpression('[Revenue] - [Cost]');
        clickDialogButton('Apply');

        // Placed immediately after its anchor on creation.
        await waitFor(() =>
            expect(api.getAllDisplayedColumns().map((column) => column.getColId())).toEqual([
                'revenue',
                'calculated_1',
                'cost',
                'other',
            ])
        );

        api.moveColumns(['calculated_1'], 3);

        // A subsequent column refresh must not snap it back to the anchor.
        api.setColumnsVisible(['other'], false);
        api.setColumnsVisible(['other'], true);

        await waitFor(() =>
            expect(api.getAllDisplayedColumns().map((column) => column.getColId())).toEqual([
                'revenue',
                'cost',
                'other',
                'calculated_1',
            ])
        );
        await new GridColumns(
            api,
            'dialog-anchored calculated column can be moved away from its anchor and stays moved across refreshes'
        ).checkColumns(`
            CENTER
            ├── revenue "Revenue" width:200
            ├── cost "Cost" width:200
            ├── other "Other" width:200
            └── calculated_1 "Untitled" width:200 ƒ
        `);
    });

    test('dialog columns from different auto group columns each stay under their own anchor', async () => {
        const api = createGrid('calculated-dialog-multiple-anchors', {
            groupDisplayType: 'multipleColumns',
            rowData: [{ id: 'r1', productType: 'A', country: 'UK', revenue: 10, cost: 3 }],
            columnDefs: [
                { field: 'productType', rowGroup: true, hide: true },
                { field: 'country', rowGroup: true, hide: true },
                { field: 'revenue' },
                { field: 'cost' },
            ],
        });

        showColumnMenu(api, 'ag-Grid-AutoColumn-productType');
        await clickMenuOption('Add Calculated Column');
        await waitFor(() => getExpressionInput());
        setExpression('[Revenue] - [Cost]');
        clickDialogButton('Apply');
        await waitFor(() =>
            expect(findColumnDef(api.getColumnDefs()!, 'calculated_1')?.calculatedExpression).toBeTruthy()
        );

        showColumnMenu(api, 'ag-Grid-AutoColumn-country');
        await clickMenuOption('Add Calculated Column');
        await waitFor(() => getExpressionInput());
        setExpression('[Revenue] + [Cost]');
        clickDialogButton('Apply');

        // Adding the second column must not displace the first from its own anchor.
        await waitFor(() =>
            expect(api.getAllDisplayedColumns().map((column) => column.getColId())).toEqual([
                'ag-Grid-AutoColumn-productType',
                'calculated_1',
                'ag-Grid-AutoColumn-country',
                'calculated_2',
                'revenue',
                'cost',
            ])
        );
        await new GridColumns(api, 'dialog columns from different auto group columns each stay under their own anchor')
            .checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn-productType "Product Type" width:200
                ├── calculated_1 "Untitled" width:200 ƒ
                ├── ag-Grid-AutoColumn-country "Country" width:200
                ├── calculated_2 "Untitled" width:200 ƒ
                ├── revenue "Revenue" width:200
                └── cost "Cost" width:200
            `);
    });
});
