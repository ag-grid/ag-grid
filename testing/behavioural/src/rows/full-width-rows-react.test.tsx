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

    test('a forced refresh re-renders a full-width group row renderer in place, not remounts it', async () => {
        const mounts: string[] = [];
        let renders = 0;
        const GroupRow = (props: CustomCellRendererProps) => {
            renders++;
            useEffect(() => {
                mounts.push(props.value);
            }, []);
            return <span>{props.value}</span>;
        };
        let api: GridApi | undefined;
        render(
            <div style={{ height: 400, width: 600 }}>
                <AgGridReact
                    columnDefs={[{ field: 'group', rowGroup: true, hide: true }, { field: 'name' }]}
                    rowData={[{ group: 'G', name: 'Alice' }]}
                    groupDisplayType="groupRows"
                    groupRowRenderer={GroupRow}
                    onGridReady={(event) => {
                        api = event.api;
                    }}
                />
            </div>
        );
        await waitFor(() => expect(mounts).toEqual(['G']));
        const rendersBefore = renders;

        await act(async () => {
            api!.refreshCells({ rowNodes: [api!.getDisplayedRowAtIndex(0)!], force: true });
            await asyncSetTimeout(0);
        });

        expect({ mounts, rerendered: renders > rendersBefore }).toEqual({ mounts: ['G'], rerendered: true });
    });
});
