import React, { StrictMode, useCallback, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type {
    AutoGroupColumnDef,
    ColDef,
    ColGroupDef,
    GridPreDestroyedEvent,
    GridReadyEvent,
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

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

const modules = [AllEnterpriseModule];

const GridExample = () => {
    const gridRef = useRef<AgGridReact<IOlympicData>>(null);
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const [rowData, setRowData] = useState<IOlympicData[]>();
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
    const toolbar = useMemo<Toolbar>(() => ({ items: ['agQuickFilterToolbarItem'] }), []);
    const rowSelection = useMemo<RowSelectionOptions>(
        () => ({
            mode: 'multiRow',
        }),
        []
    );
    const [currentState, setCurrentState] = useState<GridState>();
    const [gridVisible, setGridVisible] = useState(true);
    const [savedState, setSavedState] = useState<GridState>();

    const onGridReady = useCallback((params: GridReadyEvent<IOlympicData>) => {
        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then((resp) => resp.json())
            .then((data: IOlympicData[]) => setRowData(data));
    }, []);

    const reloadGrid = useCallback(() => {
        setGridVisible(false);
        setTimeout(() => {
            setRowData(undefined);
            setGridVisible(true);
        });
    }, []);

    const onGridPreDestroyed = useCallback((params: GridPreDestroyedEvent<IOlympicData>) => {
        const { state } = params;
        console.log('Grid state on destroy (can be persisted)', state);
    }, []);

    const onStateUpdated = useCallback((params: StateUpdatedEvent<IOlympicData>) => {
        console.log('State updated', params.state);
        setCurrentState(params.state);
    }, []);

    const printState = useCallback(() => {
        console.log('Grid state', currentState);
    }, [currentState]);

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

    return (
        <AgGridProvider modules={modules}>
            <div style={containerStyle}>
                <div className="example-wrapper">
                    <div>
                        <span className="button-group">
                            <button onClick={saveState}>Save State</button>
                            <button onClick={reloadGrid}>Recreate Grid with No State</button>
                            <button onClick={setState}>Set State</button>
                            <button onClick={printState}>Print State</button>
                        </span>
                    </div>
                    <div style={gridStyle}>
                        {gridVisible && (
                            <AgGridReact<IOlympicData>
                                ref={gridRef}
                                gridId="setState"
                                rowData={rowData}
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
                                onGridReady={onGridReady}
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
