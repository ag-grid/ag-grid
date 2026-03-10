import { AgGridReact } from 'ag-grid-react';

import { gridOptions } from '../config';

export function App() {
    return (
        <div style={{ height: '100%' }}>
            <AgGridReact {...gridOptions} />
        </div>
    );
}
