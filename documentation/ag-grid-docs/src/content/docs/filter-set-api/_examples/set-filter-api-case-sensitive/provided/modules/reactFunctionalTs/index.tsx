'use strict';

import React, { StrictMode, useCallback, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { ClientSideRowModelModule } from 'ag-grid-community';
import type { ColDef, FirstDataRenderedEvent, ISetFilter } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { FiltersToolPanelModule } from 'ag-grid-enterprise';
import { MenuModule } from 'ag-grid-enterprise';
import { SetFilterModule } from 'ag-grid-enterprise';
import type { CustomCellRendererProps } from 'ag-grid-react';
import { AgGridReact } from 'ag-grid-react';

import { getData } from './data';
import './styles.css';

ModuleRegistry.registerModules([ClientSideRowModelModule, SetFilterModule, MenuModule, FiltersToolPanelModule]);

const colourCellRenderer = (props: CustomCellRendererProps) => {
    if (!props.value || props.value === '(Select All)') {
        return props.value;
    }

    const styles = {
        verticalAlign: 'middle',
        border: '1px solid black',
        margin: 3,
        display: 'inline-block',
        width: 10,
        height: 10,
        backgroundColor: props.value.toLowerCase(),
    };
    return (
        <React.Fragment>
            <div style={styles} />
            {props.value}
        </React.Fragment>
    );
};

const FILTER_TYPES: Record<string, string> = {
    insensitive: 'colour',
    sensitive: 'colour_1',
};

const MANGLED_COLOURS = ['ReD', 'OrAnGe', 'WhItE', 'YeLlOw'];

const GridExample = () => {
    const gridRef = useRef<AgGridReact>(null);
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const [rowData, setRowData] = useState(getData());
    const [columnDefs, setColumnDefs] = useState<ColDef[]>([
        {
            headerName: 'Case Insensitive (default)',
            field: 'colour',
            filter: 'agSetColumnFilter',
            filterParams: {
                caseSensitive: false,
                cellRenderer: colourCellRenderer,
            },
        },
        {
            headerName: 'Case Sensitive',
            field: 'colour',
            filter: 'agSetColumnFilter',
            filterParams: {
                caseSensitive: true,
                cellRenderer: colourCellRenderer,
            },
        },
    ]);
    const defaultColDef = useMemo<ColDef>(() => {
        return {
            flex: 1,
            minWidth: 225,
            cellRenderer: colourCellRenderer,
            floatingFilter: true,
        };
    }, []);

    const onFirstDataRendered = useCallback((params: FirstDataRenderedEvent) => {
        gridRef.current!.api.getToolPanelInstance('filters')!.expandFilters();
    }, []);

    const setModel = useCallback((type: string) => {
        gridRef.current!.api.setColumnFilterModel(FILTER_TYPES[type], { values: MANGLED_COLOURS }).then(() => {
            gridRef.current!.api.onFilterChanged();
        });
    }, []);

    const getModel = useCallback(
        (type: string) => {
            alert(JSON.stringify(gridRef.current!.api.getColumnFilterModel(FILTER_TYPES[type]), null, 2));
        },
        [alert]
    );

    const setFilterValues = useCallback((type: string) => {
        gridRef.current!.api.getColumnFilterInstance<ISetFilter>(FILTER_TYPES[type]).then((instance) => {
            instance!.setFilterValues(MANGLED_COLOURS);
            instance!.applyModel();
            gridRef.current!.api.onFilterChanged();
        });
    }, []);

    const getValues = useCallback(
        (type: string) => {
            gridRef.current!.api.getColumnFilterInstance<ISetFilter>(FILTER_TYPES[type]).then((instance) => {
                alert(JSON.stringify(instance!.getFilterValues(), null, 2));
            });
        },
        [alert]
    );

    const reset = useCallback((type: string) => {
        gridRef.current!.api.getColumnFilterInstance<ISetFilter>(FILTER_TYPES[type]).then((instance) => {
            instance!.resetFilterValues();
            instance!.setModel(null).then(() => {
                gridRef.current!.api.onFilterChanged();
            });
        });
    }, []);

    return (
        <div style={containerStyle}>
            <div className="example-wrapper">
                <div className="example-header">
                    <div>
                        Case Insensitive:
                        <button onClick={() => setModel('insensitive')}>API: setModel() - mismatching case</button>
                        <button onClick={() => getModel('insensitive')}>API: getModel()</button>
                        <button onClick={() => setFilterValues('insensitive')}>
                            API: setFilterValues() - mismatching case
                        </button>
                        <button onClick={() => getValues('insensitive')}>API: getFilterValues()</button>
                        <button onClick={() => reset('insensitive')}>Reset</button>
                    </div>
                    <div style={{ paddingTop: '10px' }}>
                        Case Sensitive:
                        <button onClick={() => setModel('sensitive')}>API: setModel() - mismatching case</button>
                        <button onClick={() => getModel('sensitive')}>API: getModel()</button>
                        <button onClick={() => setFilterValues('sensitive')}>
                            API: setFilterValues() - mismatching case
                        </button>
                        <button onClick={() => getValues('sensitive')}>API: getFilterValues()</button>
                        <button onClick={() => reset('sensitive')}>Reset</button>
                    </div>
                </div>

                <div
                    style={gridStyle}
                    className={
                        /** DARK MODE START **/ document.documentElement?.dataset.defaultTheme ||
                        'ag-theme-quartz' /** DARK MODE END **/
                    }
                >
                    <AgGridReact
                        ref={gridRef}
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        sideBar={'filters'}
                        onFirstDataRendered={onFirstDataRendered}
                    />
                </div>
            </div>
        </div>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(
    <StrictMode>
        <GridExample />
    </StrictMode>
);
