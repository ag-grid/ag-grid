import { render } from '@testing-library/react';
import { asyncSetTimeout } from 'ag-test-utils';
import React from 'react';

import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

export async function renderNavGrid(opts: {
    rowData: any[];
    columnDefs: ColDef[];
    /** `onGridReady` is the helper's own, to resolve the api. */
    gridOptions?: Omit<GridOptions, 'onGridReady'>;
}): Promise<GridApi> {
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
            {...opts.gridOptions}
            onGridReady={(e) => resolveReady(e.api)}
        />
    );

    const api = await readyPromise;
    await asyncSetTimeout(0); // allow React to complete the initial cell render pass
    return api;
}
