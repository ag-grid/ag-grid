'use strict';

import React, { useMemo, useState } from 'react';
import { render } from 'react-dom';
import { AgGridReact } from '@ag-grid-community/react';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import '@ag-grid-community/styles/ag-grid.css';
import "@ag-grid-community/styles/ag-theme-alpine.css";
import { getData } from "./data";

import { ColDef, ICellRendererParams, ModuleRegistry, ValueParserParams } from '@ag-grid-community/core';
// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule, RowGroupingModule]);

const COUNTRY_CODES: Record<string, string> = {
    Ireland: 'ie',
    'United Kingdom': 'gb',
    USA: 'us',
};

function numberParser(params: ValueParserParams) {
    return parseInt(params.newValue);
}

function countryCellRenderer(params: ICellRendererParams) {
    if (params.value === undefined || params.value === null) {
        return null;
    } else {
        return (
            <React.Fragment>
                <img width="15" height="10" src={`https://flagcdn.com/h20/${COUNTRY_CODES[params.value]}.png`} />
                {params.value}
            </React.Fragment>)
    }
}

function stateCellRenderer(params: ICellRendererParams) {
    if (params.value === undefined || params.value === null) {
        return null;
    } else {
        return (
            <React.Fragment>
                <img width="15" height="10" src="https://www.ag-grid.com/example-assets/gold-star.png" />
                {params.value}
            </React.Fragment>
        )
    }
}

function cityCellRenderer(params: ICellRendererParams) {
    if (params.value === undefined || params.value === null) {
        return null;
    } else {
        return (
            <React.Fragment>
                <img height="10" src="https://www.ag-grid.com/example-assets/weather/sun.png" width="15" />
                {params.value}
            </React.Fragment>
        )
    }
}

const GridExample = () => {

    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '98%', width: '100%' }), []);
    const [rowData, setRowData] = useState(getData());
    const [columnDefs, setColumnDefs] = useState<ColDef[]>([
        { field: 'city', type: 'dimension', cellRenderer: cityCellRenderer },
        {
            field: 'country',
            type: 'dimension',
            cellRenderer: countryCellRenderer,
            minWidth: 200,
        },
        {
            field: 'state',
            type: 'dimension',
            cellRenderer: stateCellRenderer,
            rowGroup: true,
        },
        { field: 'val1', type: 'numberValue' },
        { field: 'val2', type: 'numberValue' },
    ]);
    const defaultColDef = useMemo<ColDef>(() => {
        return {
            flex: 1,
            minWidth: 150,
            resizable: true,
        }
    }, []);
    const autoGroupColumnDef = useMemo<ColDef>(() => {
        return {
            field: 'city',
            minWidth: 200,
        }
    }, []);
    const columnTypes = useMemo<Record<string, ColDef>>(() => {
        return {
            numberValue: {
                enableValue: true,
                aggFunc: 'sum',
                editable: true,
                valueParser: numberParser,
            },
            dimension: {
                enableRowGroup: true,
                enablePivot: true,
            },
        }
    }, []);


    return (
        <div style={containerStyle}>


            <div style={gridStyle} className="ag-theme-alpine">
                <AgGridReact

                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    autoGroupColumnDef={autoGroupColumnDef}
                    columnTypes={columnTypes}
                    groupDefaultExpanded={-1}
                    rowGroupPanelShow={'always'}
                    animateRows={true}
                >
                </AgGridReact>
            </div>
        </div>
    );

}

render(<GridExample></GridExample>, document.querySelector('#root'))
