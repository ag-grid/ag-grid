import React, { StrictMode, useCallback, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { ColDef, GridState } from 'ag-grid-community';
import { enableDevValidations } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';

import type { IOlympicData } from './interfaces';
import './styles.css';
import { useFetchJson } from './useFetchJson';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

const modules = [AllEnterpriseModule];

// Only the column order is supplied; every other column state section is omitted.
const columnOrderState: GridState = {
    columnOrder: {
        orderedColIds: ['gold', 'silver', 'athlete', 'sport', 'country', 'year'],
    },
};

const GridExample = () => {
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const [columnDefs] = useState<ColDef[]>([
        { field: 'athlete' },
        { field: 'country', pinned: 'left' },
        { field: 'year', hide: true },
        { field: 'sport' },
        { field: 'gold', aggFunc: 'sum' },
        { field: 'silver', aggFunc: 'sum' },
    ]);
    const defaultColDef = useMemo<ColDef>(() => {
        return {
            flex: 1,
            minWidth: 100,
        };
    }, []);
    const [initialState, setInitialState] = useState<GridState>();
    const [gridVisible, setGridVisible] = useState(true);

    const { data, loading } = useFetchJson<IOlympicData>('https://www.ag-grid.com/example-assets/olympic-winners.json');

    const recreateGrid = useCallback((state?: GridState) => {
        setGridVisible(false);
        console.log('Recreating grid with initialState', state);
        setTimeout(() => {
            setInitialState(state);
            setGridVisible(true);
        });
    }, []);

    const recreateWithNoState = useCallback(() => recreateGrid(), [recreateGrid]);
    const recreateWithColumnOrder = useCallback(() => recreateGrid(columnOrderState), [recreateGrid]);
    const recreateWithPartialColumnOrder = useCallback(
        () => recreateGrid({ ...columnOrderState, partialColumnState: true }),
        [recreateGrid]
    );

    return (
        <AgGridProvider modules={modules}>
            <div style={containerStyle}>
                <div className="example-wrapper">
                    <div>
                        <span className="button-group">
                            <button onClick={recreateWithNoState}>No State (column defaults)</button>
                            <button onClick={recreateWithColumnOrder}>Column Order Only (defaults cleared)</button>
                            <button onClick={recreateWithPartialColumnOrder}>
                                Column Order Only + partialColumnState (defaults kept)
                            </button>
                        </span>
                    </div>
                    <div style={gridStyle}>
                        {gridVisible && (
                            <AgGridReact<IOlympicData>
                                gridId="partialColumnState"
                                rowData={data}
                                loading={loading}
                                columnDefs={columnDefs}
                                defaultColDef={defaultColDef}
                                grandTotalRow="bottom"
                                initialState={initialState}
                            />
                        )}
                    </div>
                </div>
            </div>
        </AgGridProvider>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(
    <StrictMode>
        <GridExample />
    </StrictMode>
);
