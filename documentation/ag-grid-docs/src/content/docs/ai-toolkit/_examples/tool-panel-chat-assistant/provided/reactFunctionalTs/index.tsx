import React, { StrictMode, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';

import { ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

import { type ITransaction, generateTransactions } from './generateTransactions';
import { gridOptions } from './gridOptions';
import './styles.css';

ModuleRegistry.registerModules([AllEnterpriseModule]);

const GridExample = () => {
    const gridRef = useRef<AgGridReact<ITransaction>>(null);

    // Generate synthetic transaction data
    const rowData = useMemo(() => generateTransactions({ count: 10000, seed: 42 }), []);

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <AgGridReact<ITransaction> ref={gridRef} rowData={rowData} gridOptions={gridOptions} />
        </div>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(
    <StrictMode>
        <GridExample />
    </StrictMode>
);
