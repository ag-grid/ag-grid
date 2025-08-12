'use client';

import React, { StrictMode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { ModuleRegistry } from 'ag-grid-community';
import type { ColDef, GetRowIdParams, GridReadyEvent } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

// Type definitions
interface RowData {
    id: number;
    name: string;
    age: number;
    country: string;
}

interface GridConfig {
    id: string;
    title: string;
    data: RowData[];
}

interface GridComponentProps {
    id: string;
    title: string;
    data: RowData[];
    index: number;
}

ModuleRegistry.registerModules([AllEnterpriseModule]);
const queryParamsFromUrl = new URLSearchParams(window.location.search);
console.log('React Version', React.version, queryParamsFromUrl.get('version'), 'Prod:', queryParamsFromUrl.get('prod'));

// Sample data - stable references (Best Practice)
const userData: RowData[] = [
    { id: 1, name: 'John Doe', age: 30, country: 'USA' },
    { id: 2, name: 'Jane Smith', age: 25, country: 'UK' },
    { id: 3, name: 'Bob Johnson', age: 35, country: 'Canada' },
];

const customerData: RowData[] = [
    { id: 4, name: 'Alice Brown', age: 28, country: 'Australia' },
    { id: 5, name: 'Charlie Wilson', age: 32, country: 'Germany' },
];

// GridComponent with all AG Grid React best practices
const GridComponent = React.memo<GridComponentProps>(({ id, title, data, index }) => {
    const gridRef = useRef(null);

    console.log(`🔄 [${title}] Rendering at index ${index}`);

    // Best Practice: useMemo for column definitions (stable reference)
    const colDefs = useMemo<ColDef[]>(
        () => [
            { field: 'id', width: 80, headerName: id },
            { field: 'name', width: 150 },
            { field: 'age', width: 100 },
            {
                field: 'country',
                width: 150,
                cellRenderer: (p: any) => <p style={{ color: 'blue' }}>{p.value}</p>,
            },
        ],
        [title]
    );

    // Best Practice: useMemo for defaultColDef (stable reference)
    const defaultColDef = useMemo(
        () => ({
            sortable: true,
            filter: true,
            resizable: true,
            flex: 1,
            floatingFilter: true,
            editable: true,
        }),
        []
    );

    // Best Practice: getRowId for stable row identification
    const getRowId = useCallback((params: GetRowIdParams<RowData>) => params.data.id.toString(), []);

    // Best Practice: useCallback for grid events
    const onGridReady = useCallback(
        (params: GridReadyEvent<RowData>) => {
            console.log(`✅ [${title}] Grid ready`);
        },
        [title]
    );

    useEffect(() => {
        console.log('useEffect for ', title);
        return () => {
            console.log('useEffect cleanup for ', title);
        };
    }, []);

    const onGridPreDestroyed = useCallback(() => {
        console.log(`💥 [${title}] Grid destroying`);
    }, [title]);

    const rowSelection = useMemo(() => {
        return {
            mode: 'singleRow',
        };
    }, []);
    return (
        <div style={{ border: '1px solid #ccc', margin: '10px 0', padding: '10px' }}>
            <h3>
                {title} (Position: {index + 1})
            </h3>
            <div style={{ height: '150px', width: '100%' }}>
                <AgGridReact
                    ref={gridRef}
                    rowData={data}
                    rowSelection={rowSelection}
                    columnDefs={colDefs}
                    defaultColDef={defaultColDef}
                    getRowId={getRowId}
                    onGridReady={onGridReady}
                    onGridPreDestroyed={onGridPreDestroyed}
                />
            </div>
        </div>
    );
});

// Main component demonstrating the crash issue
const GridExample = () => {
    // State for managing multiple grids and their order
    const [grids, setGrids] = useState<GridConfig[]>([
        { id: 'users', title: 'Users Grid', data: userData },
        { id: 'customers', title: 'Customers Grid', data: customerData },
    ]);

    // make sure strict mode is working
    useEffect(() => {
        console.log('useEffect callback executed (after render)');

        return () => {
            console.log('Cleanup function executed');
        };
    }, []);

    // Best Practice: useCallback for event handlers
    const moveUp = useCallback((index: number) => {
        if (index === 0) return;
        console.log(`⬆️ Moving grid from ${index} to ${index - 1}`);

        setGrids((prev) => {
            const newGrids = [...prev];
            [newGrids[index], newGrids[index - 1]] = [newGrids[index - 1], newGrids[index]];
            return newGrids;
        });
    }, []);

    const moveDown = useCallback(
        (index: number) => {
            if (index === grids.length - 1) return;
            console.log(`⬇️ Moving grid from ${index} to ${index + 1}`);

            setGrids((prev) => {
                const newGrids = [...prev];
                [newGrids[index], newGrids[index + 1]] = [newGrids[index + 1], newGrids[index]];
                return newGrids;
            });
        },
        [grids.length]
    );

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            {grids.map((grid, index) => (
                <div key={grid.id}>
                    <div style={{ marginBottom: '10px' }}>
                        <button
                            onClick={() => moveUp(index)}
                            disabled={index === 0}
                            style={{ marginRight: '5px', padding: '5px 10px' }}
                        >
                            ⬆️ Move Up
                        </button>
                        <button
                            onClick={() => moveDown(index)}
                            disabled={index === grids.length - 1}
                            style={{ padding: '5px 10px' }}
                        >
                            ⬇️ Move Down
                        </button>
                    </div>

                    <GridComponent key={grid.id} id={grid.id} title={grid.title} data={grid.data} index={index} />
                </div>
            ))}
        </div>
    );
};

// Render GridExample
const root = createRoot(document.getElementById('root')!);
root.render(
    <StrictMode>
        <GridExample />
    </StrictMode>
);
