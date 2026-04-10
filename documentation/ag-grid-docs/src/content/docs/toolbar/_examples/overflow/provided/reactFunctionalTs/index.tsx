import React, { StrictMode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { ColDef, SideBarDef, Toolbar } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnAutoSizeModule,
    CsvExportModule,
    QuickFilterModule,
    TextFilterModule,
    ValidationModule,
} from 'ag-grid-community';
import {
    ColumnMenuModule,
    ColumnsToolPanelModule,
    ExcelExportModule,
    FiltersToolPanelModule,
    FindModule,
    NewFiltersToolPanelModule,
    PivotModule,
    RowGroupingModule,
    RowGroupingPanelModule,
    SideBarModule,
    ToolbarModule,
} from 'ag-grid-enterprise';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';

import OverflowMenu from './overflowMenu';
import './styles.css';

const modules = [
    TextFilterModule,
    ClientSideRowModelModule,
    ColumnAutoSizeModule,
    CsvExportModule,
    QuickFilterModule,
    ColumnMenuModule,
    ColumnsToolPanelModule,
    ExcelExportModule,
    FiltersToolPanelModule,
    FindModule,
    NewFiltersToolPanelModule,
    PivotModule,
    RowGroupingModule,
    RowGroupingPanelModule,
    SideBarModule,
    ToolbarModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
];

const GridExample = () => {
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const [rowData, setRowData] = useState<any[]>();
    const [widthValue, setWidthValue] = useState('100');
    const gridRef = useRef<HTMLDivElement>(null);

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
            { field: 'gold', enableValue: true },
            { field: 'silver', enableValue: true },
            { field: 'bronze', enableValue: true },
            { field: 'total' },
        ],
        []
    );

    const defaultColDef = useMemo<ColDef>(
        () => ({
            flex: 1,
            minWidth: 100,
            filter: true,
            enableRowGroup: true,
            enablePivot: true,
        }),
        []
    );

    const sideBar = useMemo<SideBarDef>(
        () => ({
            toolPanels: ['columns', 'filters-new'],
            defaultToolPanel: '',
        }),
        []
    );

    const toolbar = useMemo<Toolbar>(
        () => ({
            items: [
                'rowGroupPanel',
                'pivotPanel',
                'separator',
                'columnChooser',
                'autoSizeAll',
                { toolbarItem: 'quickFilter', alignment: 'right' },
                { toolbarItem: 'find', alignment: 'right' },
                'separator',
                { toolbarItem: 'columnsPanel', alignment: 'right' },
                { toolbarItem: 'filtersPanel', alignment: 'right' },
                'separator',
                { toolbarItem: 'export', alignment: 'right' },
                'separator',
                { toolbarItem: 'resetColumns', alignment: 'right' },
                { toolbarItem: OverflowMenu, key: 'overflowMenu', alignment: 'right' },
            ],
        }),
        []
    );

    const onWidthSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setWidthValue(value);
    }, []);

    return (
        <div style={containerStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <label htmlFor="widthSlider">Grid width:</label>
                <input
                    type="range"
                    id="widthSlider"
                    min="30"
                    max="100"
                    value={widthValue}
                    style={{ flex: 1 }}
                    onChange={onWidthSliderChange}
                />
                <span>{widthValue}%</span>
            </div>
            <div id="myGrid" ref={gridRef} style={{ height: 'calc(100% - 40px)', maxWidth: `${widthValue}%` }}>
                <AgGridReact
                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    enableFilterHandlers={true}
                    sideBar={sideBar}
                    toolbar={toolbar}
                />
            </div>
        </div>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(
    <AgGridProvider modules={modules}>
        <StrictMode>
            <GridExample />
        </StrictMode>
    </AgGridProvider>
);
