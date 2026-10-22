import { waitFor } from '@testing-library/dom';
import { act, cleanup, render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import React, { useEffect, useRef, useState } from 'react';

import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnApiModule,
    CustomEditorModule,
    ModuleRegistry,
    RowApiModule,
    TextEditorModule,
    setupAgTestIds,
} from 'ag-grid-community';
import { TransposeModule } from 'ag-grid-enterprise';
import type { CustomCellEditorProps, CustomCellRendererProps, CustomHeaderProps } from 'ag-grid-react';
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

const fieldRow = (colId: string) => `ag-Grid-TransposeField-${colId}`;
const recordCol = (id: string) => `ag-Grid-TransposeRecord-${id}`;

/** What each React component was given, keyed by component. */
let received: Record<string, unknown[]> = {};
const receive = (
    component: string,
    props: { data?: any; colDef?: any; value?: any; displayName?: string; column?: any }
) =>
    (received[component] ??= []).push({
        data: props.data?.id,
        field: props.colDef?.field,
        value: props.value,
        displayName: props.displayName,
        column: props.column?.getColId?.(),
    });

const RevenueEditor = (props: CustomCellEditorProps<Company, number>) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [text, setText] = useState(String(props.value ?? ''));
    useEffect(() => {
        receive('editor', props);
        inputRef.current?.focus();
    }, []);
    return (
        <input
            ref={inputRef}
            className="react-revenue-editor"
            value={text}
            onChange={(event) => {
                setText(event.target.value);
                props.onValueChange(Number(event.target.value));
            }}
        />
    );
};

const RegionRenderer = (props: CustomCellRendererProps<Company, string>) => {
    receive('renderer', props);
    return <span className="react-region">{`${props.data?.name}: ${props.value}`}</span>;
};

const RecordHeader = (props: CustomHeaderProps) => {
    receive('recordHeader', props);
    return <span className="react-record-header">{`Record ${props.displayName}`}</span>;
};

const FieldNameHeader = (props: CustomHeaderProps) => {
    receive('fieldNameHeader', props);
    return <span className="react-field-name-header">{`Fields of ${props.displayName}`}</span>;
};

describe('transposed view with React components', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([
            ClientSideRowModelModule,
            ColumnApiModule,
            CustomEditorModule,
            RowApiModule,
            TextEditorModule,
            TransposeModule,
        ]);
        setupAgTestIds();
    });

    beforeEach(() => {
        received = {};
    });
    afterEach(() => cleanup());

    const mount = async (options: { revenue?: ColDef<Company>; grid?: GridOptions<Company> } = {}, strict = false) => {
        const rowData = makeRowData();
        let api: GridApi<Company> | undefined;
        const grid = (
            <div style={{ height: 400, width: 800 }}>
                <AgGridReact<Company>
                    columnDefs={[
                        { field: 'name', headerName: 'Company' },
                        { field: 'region', cellRenderer: RegionRenderer },
                        { field: 'revenue', editable: true, cellEditor: RevenueEditor, ...options.revenue },
                    ]}
                    rowData={rowData}
                    getRowId={(params) => params.data.id}
                    transpose
                    transposeHeaderColId="name"
                    suppressColumnVirtualisation
                    onGridReady={(params) => (api = params.api)}
                    {...options.grid}
                />
            </div>
        );
        const { container } = render(strict ? <React.StrictMode>{grid}</React.StrictMode> : grid);
        await waitFor(() => expect(api).toBeTruthy());
        const cell = (rowId: string, colId: string) =>
            container.querySelector<HTMLElement>(`[row-id="${rowId}"] [col-id="${colId}"]`);
        await waitFor(() => expect(cell(fieldRow('revenue'), recordCol('b'))).toBeTruthy());
        return { api: api!, container, cell, rowData };
    };

    const editRevenueOfB = async (
        cell: (rowId: string, colId: string) => HTMLElement | null,
        container: HTMLElement,
        value: string
    ) => {
        const user = userEvent.setup();
        await user.dblClick(cell(fieldRow('revenue'), recordCol('b'))!);
        const input = await waitFor(() => {
            const el = container.querySelector<HTMLInputElement>('.react-revenue-editor');
            if (!el) {
                throw new Error('React editor not open');
            }
            return el;
        });
        await user.clear(input);
        await user.type(input, `${value}{Enter}`);
    };

    test('a React cell editor gets the real record and field, and the edit lands on the record', async () => {
        const { cell, container, rowData } = await mount();
        await editRevenueOfB(cell, container, '300');
        await waitFor(() => expect(rowData[1].revenue).toBe(300));
        expect(received.editor).toEqual([{ data: 'b', field: 'revenue', column: 'revenue', value: 250 }]);
        await waitFor(() => expect(cell(fieldRow('revenue'), recordCol('b'))!.textContent).toBe('300'));
    });

    test('a React popup editor opens in the popup layer and lands on the record', async () => {
        const { cell, container, rowData } = await mount({ revenue: { cellEditorPopup: true } });
        await editRevenueOfB(cell, container, '310');
        await waitFor(() => expect(rowData[1].revenue).toBe(310));
        expect(received.editor).toEqual([{ data: 'b', field: 'revenue', column: 'revenue', value: 250 }]);
    });

    test('the popup editor is placed in the popup layer, not in the cell', async () => {
        const { cell, container } = await mount({ revenue: { cellEditorPopup: true } });
        await userEvent.setup().dblClick(cell(fieldRow('revenue'), recordCol('b'))!);
        const input = await waitFor(() => {
            const el = container.querySelector<HTMLInputElement>('.react-revenue-editor');
            if (!el) {
                throw new Error('React editor not open');
            }
            return el;
        });
        expect(input.closest('.ag-popup-editor')).toBeTruthy();
        expect(cell(fieldRow('revenue'), recordCol('b'))!.contains(input)).toBe(false);
    });

    test('a React cell renderer on a field gets the real record', async () => {
        const { cell } = await mount();
        await waitFor(() => expect(cell(fieldRow('region'), recordCol('b'))!.textContent).toBe('Contoso: APAC'));
        expect(received.renderer).toContainEqual({ data: 'b', field: 'region', column: 'region', value: 'APAC' });
    });

    test('React header components render for record columns and the field-name column', async () => {
        const { container } = await mount({
            grid: {
                transposeRecordColumnDef: { headerComponent: RecordHeader },
                transposeFieldColumnDef: { headerComponent: FieldNameHeader },
            },
        });
        await waitFor(() =>
            expect(Array.from(container.querySelectorAll('.react-record-header')).map((el) => el.textContent)).toEqual([
                'Record Northwind',
                'Record Contoso',
                'Record Fabrikam',
            ])
        );
        expect(container.querySelector('.react-field-name-header')?.textContent).toBe('Fields of Company');
    });

    test('StrictMode: no duplicated columns, and editing and toggling still work', async () => {
        const errors: unknown[] = [];
        // The enterprise licence banner (no key in tests) also prints through console.error.
        const isLicenceBanner = (args: unknown[]) => typeof args[0] === 'string' && args[0].startsWith('*');
        const consoleError = vi.spyOn(console, 'error').mockImplementation((...args) => {
            if (!isLicenceBanner(args)) {
                errors.push(args);
            }
        });
        try {
            const { api, cell, container, rowData } = await mount({}, true);
            const headerColIds = () =>
                Array.from(container.querySelectorAll('.ag-header-cell[col-id]')).map((el) =>
                    el.getAttribute('col-id')
                );
            expect(headerColIds()).toEqual(['ag-Grid-TransposeField', recordCol('a'), recordCol('b'), recordCol('c')]);
            await editRevenueOfB(cell, container, '320');
            await waitFor(() => expect(rowData[1].revenue).toBe(320));
            act(() => api.setGridOption('transpose', false));
            await waitFor(() =>
                expect(container.querySelector('[row-id="b"] [col-id="revenue"]')?.textContent).toBe('320')
            );
            act(() => api.setGridOption('transpose', true));
            await waitFor(() => expect(cell(fieldRow('revenue'), recordCol('b'))?.textContent).toBe('320'));
            expect(headerColIds()).toHaveLength(4);
            expect(errors).toEqual([]);
        } finally {
            consoleError.mockRestore();
        }
    });
});
