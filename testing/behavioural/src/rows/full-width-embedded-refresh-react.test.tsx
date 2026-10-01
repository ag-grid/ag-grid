import { act, cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';

import type { GridApi, ICellRendererComp, ICellRendererParams } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, RowApiModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

const events: string[] = [];
let refuseRefresh: string | null = null;

class SectionRenderer implements ICellRendererComp {
    private readonly eGui = document.createElement('div');
    private section = '';

    public init(params: ICellRendererParams): void {
        this.section = params.pinned ?? 'center';
        events.push(`init ${this.section} ${params.data.v}`);
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

    public refresh(params: ICellRendererParams): boolean {
        events.push(`refresh ${this.section} ${params.pinned ?? 'center'} ${params.data.v}`);
        return this.section !== refuseRefresh;
    }
}

describe('embedded full width row refresh (React)', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule, RowApiModule]);
    });

    afterEach(() => {
        cleanup();
        events.length = 0;
        refuseRefresh = null;
    });

    test('an update refreshes every section with its own params, and any section that refuses redraws the row', async () => {
        let api: GridApi | undefined;
        render(
            <AgGridReact
                columnDefs={[{ colId: 'l', pinned: 'left' }, { field: 'v' }, { colId: 'r', pinned: 'right' }]}
                rowData={[{ id: '1', v: 'a' }]}
                getRowId={(params) => params.data.id}
                isFullWidthRow={() => true}
                embedFullWidthRows
                fullWidthCellRenderer={SectionRenderer}
                onGridReady={(e) => {
                    api = e.api;
                }}
            />
        );
        await waitFor(() => expect([...events].sort()).toEqual(['init center a', 'init left a', 'init right a']));

        events.length = 0;
        act(() => api!.getRowNode('1')!.setData({ id: '1', v: 'b' }));
        await waitFor(() =>
            expect(events).toEqual(['refresh left left b', 'refresh center center b', 'refresh right right b'])
        );

        for (const [refuser, v] of [
            ['left', 'c'],
            ['center', 'd'],
            ['right', 'e'],
        ]) {
            events.length = 0;
            refuseRefresh = refuser;
            act(() => api!.getRowNode('1')!.setData({ id: '1', v }));
            await waitFor(() =>
                expect(events.slice(3).sort()).toEqual([`init center ${v}`, `init left ${v}`, `init right ${v}`])
            );
            expect(events.slice(0, 3)).toEqual([
                `refresh left left ${v}`,
                `refresh center center ${v}`,
                `refresh right right ${v}`,
            ]);
        }
    });
});
