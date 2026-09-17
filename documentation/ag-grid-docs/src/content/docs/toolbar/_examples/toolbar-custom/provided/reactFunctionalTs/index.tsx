import React, { StrictMode, useCallback, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { ColDef, ToolPanelVisibleChangedEvent, Toolbar } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';
import { ColumnsToolPanelModule, FiltersToolPanelModule, SideBarModule, ToolbarModule } from 'ag-grid-enterprise';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';

import { ToolPanelRadio, type ToolPanelRadioHandle, WinnersToggle } from './customToolbarItem';

const modules = [AllCommunityModule, ColumnsToolPanelModule, FiltersToolPanelModule, SideBarModule, ToolbarModule];

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
            { field: 'athlete' },
            { field: 'country' },
            { field: 'gold', filter: 'agNumberColumnFilter' },
            { field: 'silver', filter: 'agNumberColumnFilter' },
            { field: 'bronze' },
        ],
        []
    );
    const defaultColDef = useMemo<ColDef>(
        () => ({
            minWidth: 100,
            filter: true,
        }),
        []
    );
    const sideBar = useMemo(() => ({ toolPanels: ['columns', 'filters'] }), []);
    const toolbar = useMemo<Toolbar>(
        () => ({
            items: [
                { toolbarItem: WinnersToggle, key: 'winners' },
                { toolbarItem: ToolPanelRadio, key: 'toolPanel', alignment: 'right' },
            ],
        }),
        []
    );
    const onToolPanelVisibleChanged = useCallback((event: ToolPanelVisibleChangedEvent) => {
        const radio = event.api.getToolbarItemInstance<ToolPanelRadioHandle>('toolPanel');
        radio?.setSelected(event.visible ? event.key : 'none');
    }, []);

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
                        onToolPanelVisibleChanged={onToolPanelVisibleChanged}
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
