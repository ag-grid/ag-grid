import React, { StrictMode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { ColDef, GridApi, Toolbar } from 'ag-grid-community';
import { ClientSideRowModelModule, TextFilterModule, ValidationModule } from 'ag-grid-community';
import { ColumnsToolPanelModule, NewFiltersToolPanelModule, SideBarModule, ToolbarModule } from 'ag-grid-enterprise';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';

import CustomPanelToggle, { type PanelToggleHandle } from './customToolbarItem';

const modules = [
    TextFilterModule,
    ClientSideRowModelModule,
    ColumnsToolPanelModule,
    NewFiltersToolPanelModule,
    SideBarModule,
    ToolbarModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
];

const GridExample = () => {
    const gridRef = useRef<AgGridReact>(null);
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%', flex: 1, minHeight: 0 }), []);
    const [rowData, setRowData] = useState<any[]>();

    useEffect(() => {
        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then((response) => response.json())
            .then((data) => setRowData(data));
    }, []);

    const columnDefs = useMemo<ColDef[]>(
        () => [
            { field: 'athlete', minWidth: 200 },
            { field: 'country', minWidth: 200 },
            { field: 'sport', minWidth: 200 },
            { field: 'year' },
            { field: 'gold' },
            { field: 'silver' },
            { field: 'bronze' },
            { field: 'total' },
        ],
        []
    );
    const defaultColDef = useMemo<ColDef>(
        () => ({
            flex: 1,
            minWidth: 100,
            filter: true,
        }),
        []
    );
    const sideBar = useMemo(() => ({ toolPanels: ['columns', 'filters-new'] }), []);
    const toolbar = useMemo<Toolbar>(
        () => ({
            items: [
                {
                    toolbarItem: CustomPanelToggle,
                    key: 'columnsPanel',
                    toolbarItemParams: {
                        label: 'Columns',
                        icon: 'columns',
                        panelId: 'columns',
                    },
                },
                {
                    toolbarItem: CustomPanelToggle,
                    key: 'filtersPanel',
                    toolbarItemParams: {
                        label: 'Filters',
                        icon: 'filter',
                        panelId: 'filters-new',
                    },
                },
            ],
        }),
        []
    );

    const togglePanel = useCallback((key: string) => {
        const api: GridApi | undefined = gridRef.current?.api;
        api?.getToolbarItemInstance<PanelToggleHandle>(key)?.toggle();
    }, []);

    return (
        <AgGridProvider modules={modules}>
            <div style={{ ...containerStyle, display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: 8 }}>
                    <button onClick={() => togglePanel('columnsPanel')}>Toggle Columns Panel</button>
                    <button onClick={() => togglePanel('filtersPanel')}>Toggle Filters Panel</button>
                </div>
                <div style={gridStyle}>
                    <AgGridReact
                        ref={gridRef}
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        enableFilterHandlers
                        sideBar={sideBar}
                        toolbar={toolbar}
                    />
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
