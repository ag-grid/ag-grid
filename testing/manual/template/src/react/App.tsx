import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

import { gridOptions } from '../gridOptions';

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

export function App() {
    return (
        <div style={{ height: '100%' }}>
            <AgGridReact {...gridOptions} />
        </div>
    );
}
