import { waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom/vitest';
import { act, cleanup, render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import React from 'react';

import type { CellValueChangedEvent, ColDef, ColGroupDef, GridApi, GridOptions } from 'ag-grid-community';
import {
    CellStyleModule,
    ClientSideRowModelModule,
    ColumnApiModule,
    ModuleRegistry,
    NumberEditorModule,
    NumberFilterModule,
    RowApiModule,
    RowSelectionModule,
    TextEditorModule,
    createGrid,
    setupAgTestIds,
} from 'ag-grid-community';
import { TransposeModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

interface Company {
    id: string;
    name: string;
    region: string;
    revenue: number;
}

const makeRowData = (): Company[] => [
    { id: 'a', name: 'Northwind', region: 'EMEA', revenue: 400 },
    { id: 'b', name: 'Contoso', region: 'APAC', revenue: 250 },
    { id: 'c', name: 'Fabrikam', region: 'AMER', revenue: 900 },
];

const COLUMN_DEFS: (ColDef<Company> | ColGroupDef<Company>)[] = [
    { field: 'name', headerName: 'Company' },
    {
        headerName: 'Details',
        groupId: 'details',
        children: [
            {
                field: 'region',
                // A function renderer: a JS renderer in vanilla, a function component in React.
                cellRenderer: (params: any) => `${params.data?.name}|${params.colDef?.field}|${params.value}`,
            },
        ],
    },
    {
        field: 'revenue',
        editable: true,
        cellEditor: 'agNumberCellEditor',
        cellEditorParams: { min: 0, max: 1000 },
        valueFormatter: (params) => `£${params.value}m`,
        cellClassRules: { 'big-revenue': (params) => params.value > 500 },
        filter: 'agNumberColumnFilter',
    },
];

type Framework = 'react' | 'vanilla';
const FRAMEWORKS: Framework[] = ['react', 'vanilla'];

const fieldRow = (colId: string) => `ag-Grid-TransposeField-${colId}`;
const recordCol = (id: string) => `ag-Grid-TransposeRecord-${id}`;

describe('transpose under React vs vanilla', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([
            CellStyleModule,
            ClientSideRowModelModule,
            ColumnApiModule,
            NumberEditorModule,
            NumberFilterModule,
            RowApiModule,
            RowSelectionModule,
            TextEditorModule,
            TransposeModule,
        ]);
        setupAgTestIds();
    });

    const vanillaDivs: HTMLElement[] = [];
    afterEach(() => {
        cleanup();
        vanillaDivs.splice(0).forEach((div) => div.remove());
    });

    const mount = async (framework: Framework, rowData: Company[], extra: GridOptions<Company> = {}) => {
        const options: GridOptions<Company> = {
            columnDefs: COLUMN_DEFS,
            rowData,
            getRowId: (params) => params.data.id,
            rowSelection: { mode: 'multiRow', checkboxes: false },
            transpose: true,
            transposeHeaderColId: 'name',
            transposeRecordColumnDef: {
                cellClassRules: { 'is-contoso': (params) => params.data?.id === 'b' },
            },
            suppressColumnVirtualisation: true,
            ...extra,
        };
        let api: GridApi<Company> | undefined;
        let gridDiv: HTMLElement;
        if (framework === 'react') {
            const rendered = render(
                <div style={{ height: 400, width: 800 }}>
                    <AgGridReact<Company> {...options} onGridReady={(params) => (api = params.api)} />
                </div>
            );
            gridDiv = rendered.container;
        } else {
            gridDiv = document.createElement('div');
            document.body.appendChild(gridDiv);
            vanillaDivs.push(gridDiv);
            api = createGrid(gridDiv, options);
        }
        await waitFor(() => expect(api).toBeTruthy());
        const cell = (rowId: string, colId: string) =>
            gridDiv.querySelector<HTMLElement>(`[row-id="${rowId}"] [col-id="${colId}"]`);
        await waitFor(() => expect(cell(fieldRow('revenue'), recordCol('a'))).toBeTruthy());
        return { api: api!, gridDiv, cell };
    };

    test.each(FRAMEWORKS)('%s: formatted values and a field cell renderer get the real record', async (framework) => {
        const { cell } = await mount(framework, makeRowData());
        await waitFor(() => expect(cell(fieldRow('revenue'), recordCol('a'))!.textContent).toBe('£400m'));
        await waitFor(() => expect(cell(fieldRow('region'), recordCol('b'))!.textContent).toBe('Contoso|region|APAC'));
    });

    test.each(FRAMEWORKS)('%s: field and record class rules both apply', async (framework) => {
        const { cell } = await mount(framework, makeRowData());
        await waitFor(() => expect(cell(fieldRow('revenue'), recordCol('c'))).toHaveClass('big-revenue'));
        expect(cell(fieldRow('revenue'), recordCol('a'))).not.toHaveClass('big-revenue');
        expect(cell(fieldRow('revenue'), recordCol('b'))).toHaveClass('is-contoso');
        expect(cell(fieldRow('region'), recordCol('b'))).toHaveClass('is-contoso');
        expect(cell(fieldRow('revenue'), recordCol('a'))).not.toHaveClass('is-contoso');
    });

    test.each(FRAMEWORKS)('%s: editing a transposed cell writes the real record', async (framework) => {
        const rowData = makeRowData();
        const changes: string[] = [];
        const { cell, gridDiv } = await mount(framework, rowData, {
            onCellValueChanged: (event: CellValueChangedEvent<Company>) =>
                changes.push(`${event.node.id}/${event.column.getColId()}=${event.newValue}`),
        });
        const user = userEvent.setup();
        await user.dblClick(cell(fieldRow('revenue'), recordCol('a'))!);
        const input = await waitFor(() => {
            const el = gridDiv.querySelector<HTMLInputElement>(
                `[row-id="${fieldRow('revenue')}"] [col-id="${recordCol('a')}"] input`
            );
            if (!el) {
                throw new Error('editor input not found');
            }
            return el;
        });
        await user.clear(input);
        await user.type(input, '555');
        await user.keyboard('{Enter}');
        await waitFor(() => expect(rowData[0].revenue).toBe(555));
        expect(changes).toEqual(['a/revenue=555']);
        await waitFor(() => expect(cell(fieldRow('revenue'), recordCol('a'))!.textContent).toBe('£555m'));
    });

    test.each(FRAMEWORKS)('%s: the field editor validation blocks an out-of-range value', async (framework) => {
        const rowData = makeRowData();
        const { api, cell, gridDiv } = await mount(framework, rowData, { invalidEditValueMode: 'block' });
        const user = userEvent.setup();
        await user.dblClick(cell(fieldRow('revenue'), recordCol('a'))!);
        const input = await waitFor(() => {
            const el = gridDiv.querySelector<HTMLInputElement>(
                `[row-id="${fieldRow('revenue')}"] [col-id="${recordCol('a')}"] input`
            );
            if (!el) {
                throw new Error('editor input not found');
            }
            return el;
        });
        await user.clear(input);
        await user.type(input, '5000');
        await user.keyboard('{Enter}');
        expect(api.getCellEditorInstances().length).toBeGreaterThan(0);
        expect(rowData[0].revenue).toBe(400);
    });

    test.each(FRAMEWORKS)('%s: toggling off and on re-renders the cells', async (framework) => {
        const { api, cell, gridDiv } = await mount(framework, makeRowData());
        act(() => api.setGridOption('transpose', false));
        await waitFor(() =>
            expect(gridDiv.querySelector('[row-id="a"] [col-id="revenue"]')?.textContent).toBe('£400m')
        );
        act(() => api.setGridOption('transpose', true));
        await waitFor(() => expect(cell(fieldRow('revenue'), recordCol('c'))?.textContent).toBe('£900m'));
        expect(cell(fieldRow('revenue'), recordCol('c'))).toHaveClass('big-revenue');
    });

    test.each(FRAMEWORKS)('%s: the record header checkbox selects the record', async (framework) => {
        const { api, cell, gridDiv } = await mount(framework, makeRowData());
        const checkbox = await waitFor(() => {
            const el = gridDiv.querySelector<HTMLInputElement>(
                `.ag-header-cell[col-id="${recordCol('b')}"] .ag-transpose-record-checkbox`
            );
            if (!el) {
                throw new Error('record checkbox not found');
            }
            return el;
        });
        await userEvent.setup().click(checkbox);
        await waitFor(() => expect(api.getSelectedNodes().map((node) => node.id)).toEqual(['b']));
        await waitFor(() =>
            expect(cell(fieldRow('revenue'), recordCol('b'))).toHaveClass('ag-transpose-record-selected')
        );
    });

    test.each(FRAMEWORKS)('%s: field-row sort button reorders the records', async (framework) => {
        const { api, gridDiv } = await mount(framework, makeRowData());
        const sortButton = await waitFor(() => {
            const el = gridDiv.querySelector<HTMLElement>(`[row-id="${fieldRow('revenue')}"] .ag-transpose-field-sort`);
            if (!el) {
                throw new Error('sort button not found');
            }
            return el;
        });
        await userEvent.setup().click(sortButton);
        await waitFor(() =>
            expect(
                api
                    .getAllDisplayedColumns()
                    .slice(1)
                    .map((col) => col.getColId())
            ).toEqual([recordCol('b'), recordCol('a'), recordCol('c')])
        );
    });

    test.each(FRAMEWORKS)('%s: collapsing a field group hides its field rows', async (framework) => {
        const { gridDiv } = await mount(framework, makeRowData());
        const expand = await waitFor(() => {
            const el = gridDiv.querySelector<HTMLElement>(
                `[row-id="ag-Grid-TransposeFieldGroup-details"] .ag-transpose-field-expand`
            );
            if (!el?.firstChild) {
                throw new Error('group expand icon not found');
            }
            return el;
        });
        await userEvent.setup().click(expand);
        await waitFor(() => expect(gridDiv.querySelector(`[row-id="${fieldRow('region')}"]`)).toBeNull());
    });
});
