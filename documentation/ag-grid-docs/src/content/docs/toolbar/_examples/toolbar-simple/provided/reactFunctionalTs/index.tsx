import React, { StrictMode, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { ColDef, GridApi, Toolbar } from 'ag-grid-community';
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
    FiltersToolPanelModule,
    SideBarModule,
    ToolbarModule,
} from 'ag-grid-enterprise';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';

import CustomToolbarButton from './customToolbarItem';

const modules = [
    TextFilterModule,
    ClientSideRowModelModule,
    ColumnApiModule,
    ColumnAutoSizeModule,
    ColumnMenuModule,
    ColumnsToolPanelModule,
    CsvExportModule,
    ExcelExportModule,
    FiltersToolPanelModule,
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
    const sideBar = useMemo(() => ({ toolPanels: ['columns', 'filters'], defaultToolPanel: '' }), []);
    const toolbar = useMemo<Toolbar>(
        () => ({
            alignment: 'right',
            items: [
                {
                    toolbarItem: CustomToolbarButton,
                    key: 'columnChooser',
                    toolbarItemParams: {
                        label: 'Choose Columns',
                        icon: 'columns',
                        onClick: (api: GridApi) => api.showColumnChooser(),
                    },
                },
                {
                    toolbarItem: CustomToolbarButton,
                    key: 'filtersPanel',
                    toolbarItemParams: {
                        label: 'Filters Panel',
                        icon: 'filter',
                        onClick: (api: GridApi) =>
                            api.getOpenedToolPanel() === 'filters'
                                ? api.closeToolPanel()
                                : api.openToolPanel('filters'),
                    },
                },
                {
                    toolbarItem: CustomToolbarButton,
                    key: 'excelExport',
                    toolbarItemParams: {
                        label: 'Excel Export',
                        icon: 'excel',
                        onClick: (api: GridApi) => api.exportDataAsExcel(),
                    },
                },
                'separator',
                {
                    toolbarItem: CustomToolbarButton,
                    key: 'autoSizeAll',
                    toolbarItemParams: {
                        label: 'Auto Size All',
                        icon: 'maximize',
                        onClick: (api: GridApi) => api.autoSizeAllColumns(),
                    },
                },
                {
                    toolbarItem: CustomToolbarButton,
                    key: 'columnsPanel',
                    toolbarItemParams: {
                        label: 'Columns Panel',
                        icon: 'columns',
                        onClick: (api: GridApi) =>
                            api.getOpenedToolPanel() === 'columns'
                                ? api.closeToolPanel()
                                : api.openToolPanel('columns'),
                    },
                },
                {
                    toolbarItem: CustomToolbarButton,
                    key: 'csvExport',
                    toolbarItemParams: {
                        label: 'CSV Export',
                        icon: 'csv',
                        onClick: (api: GridApi) => api.exportDataAsCsv(),
                    },
                },
                {
                    toolbarItem: CustomToolbarButton,
                    key: 'resetColumns',
                    toolbarItemParams: {
                        label: 'Reset Columns',
                        icon: 'minimize',
                        onClick: (api: GridApi) => api.resetColumnState(),
                    },
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
