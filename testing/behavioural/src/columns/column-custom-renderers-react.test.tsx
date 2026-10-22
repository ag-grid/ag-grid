import { act, cleanup, render, waitFor } from '@testing-library/react';
import { asyncSetTimeout } from 'ag-test-utils';
import React from 'react';

import type { GridApi, GridOptions, ICellEditorComp, ICellRendererComp, ICellRendererParams } from 'ag-grid-community';
import {
    AgPromise,
    ClientSideRowModelModule,
    CustomEditorModule,
    ModuleRegistry,
    RenderApiModule,
    getGridElement,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

interface Row {
    id: string;
    value: string;
}

let created: AsyncInitRenderer[] = [];

class AsyncInitRenderer implements ICellRendererComp {
    private readonly eGui = document.createElement('span');
    public destroyed = false;
    public resolveInit!: () => void;

    public init(params: ICellRendererParams): AgPromise<void> {
        this.eGui.className = 'async-init-renderer';
        this.eGui.textContent = String(params.value);
        created.push(this);
        return new AgPromise<void>((resolve) => {
            this.resolveInit = () => resolve();
        });
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

    public refresh(): boolean {
        return false;
    }

    public destroy(): void {
        this.destroyed = true;
    }
}

let editors: AsyncInitEditor[] = [];

class AsyncInitEditor implements ICellEditorComp {
    private readonly eGui = document.createElement('input');
    public destroyed = false;
    public resolveInit!: () => void;

    public init(): AgPromise<void> {
        this.eGui.className = 'async-init-editor';
        editors.push(this);
        return new AgPromise<void>((resolve) => {
            this.resolveInit = () => resolve();
        });
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

    public getValue(): string {
        return this.eGui.value;
    }

    public destroy(): void {
        this.destroyed = true;
    }
}

const resolveInits = async (comps: { resolveInit(): void }[]) => {
    await act(async () => {
        for (const comp of comps) {
            comp.resolveInit();
        }
        await asyncSetTimeout(0);
    });
};

const valueCell = (api: GridApi) => getGridElement(api)!.querySelector('.ag-cell[col-id="value"]');

const renderGrid = async (gridOptions: GridOptions<Row> = {}) => {
    let api: GridApi<Row> | undefined;
    render(
        <AgGridReact<Row>
            rowData={[{ id: 'r0', value: 'a' }]}
            columnDefs={[{ field: 'value', cellRenderer: AsyncInitRenderer }]}
            getRowId={(params) => params.data.id}
            onGridReady={(event) => {
                api = event.api;
            }}
            {...gridOptions}
        />
    );
    await waitFor(() => expect(api).toBeDefined());
    return api!;
};

describe('JS cell components whose init resolves later (React)', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule, CustomEditorModule, RenderApiModule]);
    });

    beforeEach(() => {
        created = [];
        editors = [];
    });

    afterEach(() => {
        cleanup();
    });

    test('a refresh while init is pending leaves one renderer in the cell and destroys the other', async () => {
        const api = await renderGrid();
        await waitFor(() => expect(created).toHaveLength(1));

        act(() => api.refreshCells({ force: true }));
        await waitFor(() => expect(created).toHaveLength(2));
        await resolveInits(created);

        expect(valueCell(api)!.querySelectorAll('.async-init-renderer')).toHaveLength(1);
        expect(created.map((renderer) => renderer.destroyed)).toEqual([true, false]);
    });

    test('a renderer whose init resolves after its row is removed is destroyed', async () => {
        const api = await renderGrid();
        await waitFor(() => expect(created).toHaveLength(1));

        act(() => api.setGridOption('rowData', []));
        await waitFor(() => expect(valueCell(api)).toBeNull());
        await resolveInits(created);

        expect(created.map((renderer) => renderer.destroyed)).toEqual([true]);
    });

    test('an editor whose init resolves after a newer edit started is destroyed, and the newer editor stays', async () => {
        const api = await renderGrid({ columnDefs: [{ field: 'value', editable: true, cellEditor: AsyncInitEditor }] });
        await waitFor(() => expect(valueCell(api)).not.toBeNull());

        act(() => api.startEditingCell({ rowIndex: 0, colKey: 'value' }));
        await waitFor(() => expect(editors).toHaveLength(1));
        act(() => api.stopEditing(true));
        act(() => api.startEditingCell({ rowIndex: 0, colKey: 'value' }));
        await waitFor(() => expect(editors).toHaveLength(2));
        await resolveInits([editors[1]]);
        await resolveInits([editors[0]]);

        expect({
            inCell: valueCell(api)!.querySelectorAll('.async-init-editor').length,
            instances: api.getCellEditorInstances().length,
            destroyed: editors.map((editor) => editor.destroyed),
        }).toEqual({ inCell: 1, instances: 1, destroyed: [true, false] });
    });
});
