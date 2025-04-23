import { useState } from 'react';

import { AgGridReact } from 'ag-grid-react';
import type { GridOptions } from "ag-grid-community";

// Insert imports.partial here.

import './App.css';

function App() {
    const [gridOptions] = useState<GridOptions>({
        // Insert gridOptions.partial here.
    });

    return (
        <div style={{ width: "100%", height: "100%" }}>
            <AgGridReact gridOptions={gridOptions} />
        </div>
    );
}

export default App;
