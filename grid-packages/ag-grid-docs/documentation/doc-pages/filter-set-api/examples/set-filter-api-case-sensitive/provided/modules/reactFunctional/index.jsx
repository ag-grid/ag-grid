'use strict';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { render } from 'react-dom';
import { AgGridReact } from '@ag-grid-community/react';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { FiltersToolPanelModule } from '@ag-grid-enterprise/filter-tool-panel';
import '@ag-grid-community/styles/ag-grid.css';
import "@ag-grid-community/styles/ag-theme-alpine.css";

import { ModuleRegistry } from '@ag-grid-community/core';

// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule, SetFilterModule, MenuModule, FiltersToolPanelModule])

const colourCellRenderer = props => {
    if (!props.value || props.value === '(Select All)') {
        return props.value;
    }

    const styles = {
        verticalAlign: "middle",
        border: "1px solid black",
        margin: 3,
        display: "inline-block",
        width: 10,
        height: 10,
        backgroundColor: props.value.toLowerCase()
    };
    return <React.Fragment>
        <div style={styles} />
        {props.value}</React.Fragment>;
}

const FILTER_TYPES = {
    insensitive: 'colour',
    sensitive: 'colour_1',
};

const MANGLED_COLOURS = ['ReD', 'OrAnGe', 'WhItE', 'YeLlOw'];

const GridExample = () => {
    const gridRef = useRef(null);
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const [rowData, setRowData] = useState(getData());
    const [columnDefs, setColumnDefs] = useState([
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
    const defaultColDef = useMemo(() => {
        return {
            flex: 1,
            minWidth: 225,
            cellRenderer: colourCellRenderer,
            resizable: true,
            floatingFilter: true,
        }
    }, []);


    const onFirstDataRendered = useCallback((params) => {
        ((gridRef.current.api.getToolPanelInstance('filters'))).expandFilters();
    }, [])

    const setModel = useCallback((type) => {
        const instance = gridRef.current.api.getFilterInstance(FILTER_TYPES[type]);
        instance.setModel({ values: MANGLED_COLOURS });
        gridRef.current.api.onFilterChanged();
    }, [])

    const getModel = useCallback((type) => {
        const instance = gridRef.current.api.getFilterInstance(FILTER_TYPES[type]);
        alert(JSON.stringify(instance.getModel(), null, 2));
    }, [alert])

    const setFilterValues = useCallback((type) => {
        const instance = gridRef.current.api.getFilterInstance(FILTER_TYPES[type]);
        instance.setFilterValues(MANGLED_COLOURS);
        instance.applyModel();
        gridRef.current.api.onFilterChanged();
    }, [])

    const getValues = useCallback((type) => {
        const instance = gridRef.current.api.getFilterInstance(FILTER_TYPES[type]);
        alert(JSON.stringify(instance.getValues(), null, 2));
    }, [alert])

    const reset = useCallback((type) => {
        const instance = gridRef.current.api.getFilterInstance(FILTER_TYPES[type]);
        instance.resetFilterValues();
        instance.setModel(null);
        gridRef.current.api.onFilterChanged();
    }, [])


    return (
        <div style={containerStyle}>
            <div className="example-wrapper">
                <div className="example-header">
                    <div>
                        Case Insensitive:
                        <button onClick={() => setModel('insensitive')}>API: setModel() - mismatching case</button>
                        <button onClick={() => getModel('insensitive')}>API: getModel()</button>
                        <button onClick={() => setFilterValues('insensitive')}>API: setFilterValues() - mismatching case</button>
                        <button onClick={() => getValues('insensitive')}>API: getValues()</button>
                        <button onClick={() => reset('insensitive')}>Reset</button>
                    </div>
                    <div style={{ "paddingTop": "10px" }}>
                        Case Sensitive:
                        <button onClick={() => setModel('sensitive')}>API: setModel() - mismatching case</button>
                        <button onClick={() => getModel('sensitive')}>API: getModel()</button>
                        <button onClick={() => setFilterValues('sensitive')}>API: setFilterValues() - mismatching case</button>
                        <button onClick={() => getValues('sensitive')}>API: getValues()</button>
                        <button onClick={() => reset('sensitive')}>Reset</button>
                    </div>
                </div>

                <div style={gridStyle} className="ag-theme-alpine">
                    <AgGridReact
                        ref={gridRef}
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        sideBar={'filters'}
                        onFirstDataRendered={onFirstDataRendered}
                    >
                    </AgGridReact>
                </div>
            </div>
        </div>
    );

}

render(<GridExample></GridExample>, document.querySelector('#root'))
