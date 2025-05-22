import React, { StrictMode, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { ColDef, FilterEvaluator } from 'ag-grid-community';
import { ClientSideRowModelModule, CustomFilterModule, ModuleRegistry, ValidationModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

import type { IOlympicData } from './interfaces';
import NumberFilterComponent from './numberFilterComponent';
import NumberFloatingFilterComponent from './numberFloatingFilterComponent';

ModuleRegistry.registerModules([
    CustomFilterModule,
    ClientSideRowModelModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

function numberFilterEvaluator(): FilterEvaluator {
    return {
        doesFilterPass: ({ node, model, evaluatorParams }) => {
            const value = evaluatorParams.getValue(node);

            if (value == null) {
                return true;
            }

            return value > model;
        },
    };
}

const GridExample = () => {
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);

    const [columnDefs, setColumnDefs] = useState<ColDef[]>([
        { field: 'athlete' },
        {
            field: 'gold',
            floatingFilterComponent: NumberFloatingFilterComponent,
            floatingFilterComponentParams: {
                color: 'gold',
            },
            filter: NumberFilterComponent,
            filterEvaluator: numberFilterEvaluator,
            suppressFloatingFilterButton: true,
        },
        {
            field: 'silver',
            floatingFilterComponent: NumberFloatingFilterComponent,
            floatingFilterComponentParams: {
                color: 'silver',
            },
            filter: NumberFilterComponent,
            filterEvaluator: numberFilterEvaluator,
            suppressFloatingFilterButton: true,
        },
        {
            field: 'bronze',
            floatingFilterComponent: NumberFloatingFilterComponent,
            floatingFilterComponentParams: {
                color: '#CD7F32',
            },
            filter: NumberFilterComponent,
            filterEvaluator: numberFilterEvaluator,
            suppressFloatingFilterButton: true,
        },
        {
            field: 'total',
            floatingFilterComponent: NumberFloatingFilterComponent,
            floatingFilterComponentParams: {
                color: 'unset',
            },
            filter: NumberFilterComponent,
            filterEvaluator: numberFilterEvaluator,
            suppressFloatingFilterButton: true,
        },
    ]);
    const defaultColDef = useMemo<ColDef>(() => {
        return {
            flex: 1,
            minWidth: 100,
            floatingFilter: true,
        };
    }, []);

    const { data, loading } = useFetchJson<IOlympicData>('https://www.ag-grid.com/example-assets/olympic-winners.json');

    return (
        <div style={containerStyle}>
            <div style={gridStyle}>
                <AgGridReact<IOlympicData>
                    rowData={data}
                    loading={loading}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    enableFilterEvaluators
                />
            </div>
        </div>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(
    <StrictMode>
        <GridExample />
    </StrictMode>
);
