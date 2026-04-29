import React, { StrictMode, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { ColDef, GridApi, Toolbar, ToolbarItemActionParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnApiModule,
    ColumnAutoSizeModule,
    CsvExportModule,
    TextFilterModule,
    ValidationModule,
} from 'ag-grid-community';
import {
    ColumnMenuModule,
    ColumnsToolPanelModule,
    ExcelExportModule,
    NewFiltersToolPanelModule,
    SideBarModule,
    ToolbarModule,
} from 'ag-grid-enterprise';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';

import CustomToolbarToggle from './customToolbarItem';

const modules = [
    TextFilterModule,
    ClientSideRowModelModule,
    ColumnApiModule,
    ColumnAutoSizeModule,
    ColumnMenuModule,
    ColumnsToolPanelModule,
    CsvExportModule,
    ExcelExportModule,
    NewFiltersToolPanelModule,
    SideBarModule,
    ToolbarModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
];

const GridExample = () => {
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
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
            alignment: 'right',
            items: [
                {
                    key: 'columnChooser',
                    alignment: 'left',
                    label: 'Choose Columns',
                    icon: 'columns',
                    action: ({ api }: ToolbarItemActionParams) => api.showColumnChooser(),
                },
                {
                    toolbarItem: CustomToolbarToggle,
                    key: 'filtersPanel',
                    alignment: 'left',
                    toolbarItemParams: {
                        label: 'Filters Panel',
                        icon: 'filter',
                        panelId: 'filters-new',
                        onClick: (api: GridApi) =>
                            api.getOpenedToolPanel() === 'filters-new'
                                ? api.closeToolPanel()
                                : api.openToolPanel('filters-new'),
                    },
                },
                {
                    toolbarItem: CustomToolbarToggle,
                    key: 'columnsPanel',
                    alignment: 'left',
                    toolbarItemParams: {
                        label: 'Columns Panel',
                        icon: 'columns',
                        panelId: 'columns',
                        onClick: (api: GridApi) =>
                            api.getOpenedToolPanel() === 'columns'
                                ? api.closeToolPanel()
                                : api.openToolPanel('columns'),
                    },
                },
                {
                    key: 'autoSizeAll',
                    tooltip: 'Auto Size All',
                    icon: 'maximize',
                    action: ({ api }: ToolbarItemActionParams) => api.autoSizeAllColumns(),
                },
                {
                    key: 'csvExport',
                    tooltip: 'CSV Export',
                    icon: 'csvExport',
                    action: ({ api }: ToolbarItemActionParams) => api.exportDataAsCsv(),
                },
                {
                    key: 'resetColumns',
                    tooltip: 'Reset Columns',
                    icon: 'minimize',
                    action: ({ api }: ToolbarItemActionParams) => api.resetColumnState(),
                },
            ],
        }),
        []
    );

    return (
        <AgGridProvider modules={modules}>
            <div style={containerStyle}>
                <div style={gridStyle}>
                    <AgGridReact
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
