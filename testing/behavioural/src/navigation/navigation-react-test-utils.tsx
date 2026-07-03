import { render } from '@testing-library/react';
import React from 'react';

import type { ColDef, GridApi } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

import { asyncSetTimeout } from '../test-utils';

export async function renderNavGrid(opts: { rowData: any[]; columnDefs: ColDef[] }): Promise<GridApi> {
    let resolveReady!: (api: GridApi) => void;
    const readyPromise = new Promise<GridApi>((resolve) => {
        resolveReady = resolve;
    });

    render(
        <AgGridReact
            rowData={opts.rowData}
            columnDefs={opts.columnDefs}
            suppressRowVirtualisation
            suppressColumnVirtualisation
            animateRows={false}
            ensureDomOrder
            onGridReady={(e) => resolveReady(e.api)}
        />
    );

    const api = await readyPromise;
    await asyncSetTimeout(0); // allow React to complete the initial cell render pass
    return api;
}
