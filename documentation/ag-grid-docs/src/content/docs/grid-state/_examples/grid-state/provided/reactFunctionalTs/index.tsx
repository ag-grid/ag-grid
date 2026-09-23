import React, { StrictMode, useCallback, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type {
    AutoGroupColumnDef,
    ColDef,
    ColGroupDef,
    GridPreDestroyedEvent,
    GridState,
    RowSelectionOptions,
    StateUpdatedEvent,
    Toolbar,
} from 'ag-grid-community';
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

const GridExample = () => {
    const gridRef = useRef<AgGridReact<IOlympicData>>(null);
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const [columnDefs, setColumnDefs] = useState<(ColDef | ColGroupDef)[]>([
        { field: 'athlete', minWidth: 150 },
        { field: 'age' },
        { field: 'country', minWidth: 150 },
        {
            headerName: 'Competition',
            groupId: 'competition',
            children: [{ field: 'year' }, { field: 'date', minWidth: 150 }, { field: 'sport', minWidth: 150 }],
        },
        {
            headerName: 'Medals',
            groupId: 'medals',
            children: [
                { field: 'gold' },
                { field: 'silver', columnGroupShow: 'open' },
                { field: 'bronze', columnGroupShow: 'open' },
                { field: 'total', columnGroupShow: 'closed' },
            ],
        },
    ]);
    const defaultColDef = useMemo<ColDef>(() => {
        return {
            flex: 1,
            minWidth: 100,
            filter: true,
            enableRowGroup: true,
            enablePivot: true,
            enableValue: true,
            headerNameEditable: true,
        };
    }, []);
    const defaultColGroupDef = useMemo<Partial<ColGroupDef>>(() => {
        return { headerNameEditable: true };
    }, []);
    const autoGroupColumnDef = useMemo<AutoGroupColumnDef>(() => {
        return { minWidth: 200 };
    }, []);
    const rowSelection = useMemo<RowSelectionOptions>(
        () => ({
            mode: 'multiRow',
        }),
        []
    );
    const toolbar = useMemo<Toolbar>(() => ({ items: ['agQuickFilterToolbarItem', 'agFindToolbarItem'] }), []);
    const [initialState, setInitialState] = useState<GridState>();
    const [currentState, setCurrentState] = useState<GridState>();
    const [savedState, setSavedState] = useState<GridState>();
    const [gridVisible, setGridVisible] = useState(true);
    // Whether the next destroy should carry its state over to the recreated grid.
    const keepStateOnDestroy = useRef(true);

    const { data, loading } = useFetchJson<IOlympicData>('https://www.ag-grid.com/example-assets/olympic-winners.json');

    const recreateGrid = useCallback((keepState: boolean) => {
        keepStateOnDestroy.current = keepState;
        setGridVisible(false);
        setTimeout(() => {
            setGridVisible(true);
        });
    }, []);

    const recreateWithCurrentState = useCallback(() => recreateGrid(true), [recreateGrid]);
    const recreateWithNoState = useCallback(() => recreateGrid(false), [recreateGrid]);

    const onGridPreDestroyed = useCallback((params: GridPreDestroyedEvent<IOlympicData>) => {
        const { state } = params;
        console.log('Grid state on destroy (can be persisted)', state);
        setInitialState(keepStateOnDestroy.current ? state : undefined);
    }, []);

    const saveState = useCallback(() => {
        console.log('Saved state', currentState);
        setSavedState(currentState);
    }, [currentState]);

    const setState = useCallback(() => {
        if (savedState) {
            gridRef.current!.api.setState(savedState);
            console.log('Set state', savedState);
        }
    }, [savedState]);

    const onStateUpdated = useCallback((params: StateUpdatedEvent<IOlympicData>) => {
        console.log('State updated', params.state);
        setCurrentState(params.state);
    }, []);

    const printState = useCallback(() => {
        console.log('Grid state', currentState);
    }, [currentState]);

    return (
        <AgGridProvider modules={modules}>
            <div style={containerStyle}>
                <div className="example-wrapper">
                    <div>
                        <span className="button-group">
                            <button onClick={recreateWithCurrentState}>Recreate Grid with Current State</button>
                            <button onClick={saveState}>Save State</button>
                            <button onClick={recreateWithNoState}>Recreate Grid with No State</button>
                            <button onClick={setState}>Set State</button>
                            <button onClick={printState}>Print Grid State</button>
                        </span>
                    </div>
                    <div style={gridStyle}>
                        {gridVisible && (
                            <AgGridReact<IOlympicData>
                                ref={gridRef}
                                gridId="gridState"
                                rowData={data}
                                loading={loading}
                                columnDefs={columnDefs}
                                defaultColDef={defaultColDef}
                                defaultColGroupDef={defaultColGroupDef}
                                autoGroupColumnDef={autoGroupColumnDef}
                                sideBar={true}
                                toolbar={toolbar}
                                pagination={true}
                                rowSelection={rowSelection}
                                cellSelection={true}
                                calculatedColumns={true}
                                enableRowPinning={true}
                                suppressColumnMoveAnimation={true}
                                ensureDomOrder={true}
                                initialState={initialState}
                                onGridPreDestroyed={onGridPreDestroyed}
                                onStateUpdated={onStateUpdated}
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
