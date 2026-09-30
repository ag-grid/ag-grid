import { act, cleanup, render, waitFor } from '@testing-library/react';
import { asyncSetTimeout } from 'ag-test-utils';
import React, { useEffect } from 'react';

import type { GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, RenderApiModule, RowApiModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';
import type { CustomCellRendererProps } from 'ag-grid-react';
import { AgGridReact } from 'ag-grid-react';

describe('full width rows in React', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule, RenderApiModule, RowApiModule, RowGroupingModule]);
    });

    afterEach(async () => {
        await act(async () => {
            await asyncSetTimeout(0);
            cleanup();
        });
    });

    test('a forced refresh re-renders a full-width group row renderer in place with new params, not remounts it', async () => {
        const mounts: string[] = [];
        const GroupRow = (props: CustomCellRendererProps) => {
            useEffect(() => {
                mounts.push(props.value);
            }, []);
            return <span className="group-row">{`${props.value} ${props.context.label}`}</span>;
        };
        let api: GridApi | undefined;
        render(
            <div style={{ height: 400, width: 600 }}>
                <AgGridReact
                    columnDefs={[{ field: 'group', rowGroup: true, hide: true }, { field: 'name' }]}
                    rowData={[{ group: 'G', name: 'Alice' }]}
                    groupDisplayType="groupRows"
                    groupRowRenderer={GroupRow}
                    context={{ label: 'before' }}
                    onGridReady={(event) => {
                        api = event.api;
                    }}
                />
            </div>
        );
        await waitFor(() => expect(mounts).toEqual(['G']));

        // only params the refresh builds carry the new context
        await act(async () => {
            api!.setGridOption('context', { label: 'after' });
            api!.refreshCells({ rowNodes: [api!.getDisplayedRowAtIndex(0)!], force: true });
            await asyncSetTimeout(0);
        });

        const text = document.querySelector('.group-row')?.textContent;
        expect({ mounts, text }).toEqual({ mounts: ['G'], text: 'G after' });
    });
});
