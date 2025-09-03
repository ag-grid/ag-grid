'use client';

import React, { StrictMode, useCallback, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import {
    ClientSideRowModelModule,
    ColumnsToolPanelModule,
    ModuleRegistry,
    NewFiltersToolPanelModule,
    NumberFilterModule,
    PivotModule,
    SetFilterModule,
    TextFilterModule,
    ValidationModule,
} from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

import './styles.css';
import { useFetchJson } from './useFetchJson';

ModuleRegistry.registerModules([
    NumberFilterModule,
    ClientSideRowModelModule,
    ColumnsToolPanelModule,
    NewFiltersToolPanelModule,
    SetFilterModule,
    PivotModule,
    TextFilterModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

function addStyles(parentEl) {
    const contentClassnames = [...parentEl.querySelector('.content').classList].filter((e) => e !== 'content');
    parentEl.classList.add(...contentClassnames);
}

const GridExample = () => {
    const gridRef = useRef(null);
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const popupRef = useRef<HTMLElement>(null);
    const popupContentRef = useRef<HTMLElement>(null);
    const drawerRef = useRef<HTMLElement>(null);
    const drawerContentRef = useRef<HTMLElement>(null);
    const [popupParent, setPopupParent] = useState<HTMLElement | null>(document.body);
    const [columnDefs, setColumnDefs] = useState([
        { field: 'athlete', filter: 'agTextColumnFilter', minWidth: 200 },
        { field: 'country', minWidth: 180 },
        { field: 'date', minWidth: 150 },
        { field: 'gold', minWidth: 150 },
        { field: 'silver', minWidth: 150 },
    ]);
    const defaultColDef = useMemo(() => ({ flex: 1, minWidth: 100, filter: true }), []);
    const autoGroupColumnDef = useMemo(() => ({ minWidth: 200 }), []);

    const { data, loading } = useFetchJson('https://www.ag-grid.com/example-assets/olympic-winners.json');

    const columnsToolPanel = useMemo(() => {
        return {
            id: 'columns',
            labelDefault: 'Popup',
            labelKey: 'columns',
            iconKey: 'columnsToolPanel',
            toolPanel: 'agColumnsToolPanel',
            toolPanelParams: {
                suppressRowGroups: true,
                suppressValues: true,
                suppressPivotMode: true,
            },
            parent: popupContentRef.current,
        };
    }, [popupRef.current, popupContentRef.current]);

    const filtersToolPanel = useMemo(
        () => ({
            id: 'filters',
            labelDefault: 'Drawer',
            labelKey: 'filters',
            iconKey: 'filter',
            toolPanel: 'agNewFiltersToolPanel',
        }),
        []
    );
    const sideBar = useMemo(
        () => ({
            toolPanels: [columnsToolPanel, filtersToolPanel],
            hideButtons: true,
            hiddenByDefault: true,
        }),
        [columnsToolPanel, filtersToolPanel]
    );

    const closePopup = useCallback(() => {
        const drawer = popupRef.current;
        drawer.classList.toggle('active', false);
        gridRef.current.api.closeToolPanel();
    }, [popupRef.current]);

    const closeDrawer = useCallback(() => {
        const drawer = drawerRef.current;
        drawer.classList.toggle('active', false);
        gridRef.current.api.closeToolPanel();
    }, [drawerRef.current]);

    const openPopup = useCallback(() => {
        closeDrawer();
        const popup = popupRef.current;
        popup.classList.toggle('active', true);
        gridRef.current.api.openToolPanel(columnsToolPanel.id);
        addStyles(popup);
    }, [popupRef.current, closeDrawer, columnsToolPanel]);

    const openDrawer = useCallback(() => {
        closePopup();
        const drawer = drawerRef.current;
        drawer.classList.toggle('active', true);
        gridRef.current.api.openToolPanel(filtersToolPanel.id, drawerContentRef.current);
        addStyles(drawer);
    }, [drawerRef, closePopup, filtersToolPanel]);

    return (
        <div style={containerStyle}>
            <div id="wrapper" className="example-wrapper">
                <div className="example-header">
                    <button onClick={openPopup}>Open Columns Tool Panel</button>
                    <button onClick={openDrawer}>Open Filters Tool Panel</button>
                </div>

                <div style={gridStyle}>
                    <AgGridReact
                        enableFilterHandlers
                        ref={gridRef}
                        rowData={data}
                        loading={loading}
                        popupParent={popupParent}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        autoGroupColumnDef={autoGroupColumnDef}
                        sideBar={sideBar}
                    />
                </div>
            </div>

            <div id="popup" ref={popupRef}>
                <div className="inner">
                    <div>
                        <button onClick={closePopup}>Close</button>
                    </div>
                    <div className="content" ref={popupContentRef}></div>
                </div>
            </div>

            <div id="drawer" ref={drawerRef}>
                <div className="inner">
                    <div>
                        <button onClick={closeDrawer}>Close</button>
                    </div>
                    <div className="content" ref={drawerContentRef}></div>
                </div>
            </div>
        </div>
    );
};

const root = createRoot(document.getElementById('root'));
root.render(
    <StrictMode>
        <GridExample />
    </StrictMode>
);
