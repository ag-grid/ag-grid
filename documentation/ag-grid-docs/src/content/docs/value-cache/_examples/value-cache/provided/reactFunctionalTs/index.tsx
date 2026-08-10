import React, { StrictMode, useCallback, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { ColDef, GetRowIdParams, ValueFormatterParams, ValueGetterParams } from 'ag-grid-community';
import {
    CellStyleModule,
    ClientSideRowModelModule,
    HighlightChangesModule,
    ValueCacheModule,
    enableDevValidations,
} from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';

import { getData } from './data';
import './styles.css';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

const modules = [
    ValueCacheModule,
    HighlightChangesModule,
    CellStyleModule,
    ClientSideRowModelModule,
    RowGroupingModule,
];

let callCount = 1;

function formatNumber(params: ValueFormatterParams) {
    return Math.floor(params.value).toLocaleString();
}

const GridExample = () => {
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);

    const [valueCacheOn, setValueCacheOn] = useState(false);
    const [gridKey, setGridKey] = useState('grid-key-off');

    const [rowData] = useState(getData());
    const [columnDefs] = useState<ColDef[]>([
        { field: 'q1', type: 'quarterFigure' },
        { field: 'q2', type: 'quarterFigure' },
        { field: 'q3', type: 'quarterFigure' },
        { field: 'q4', type: 'quarterFigure' },
        { field: 'year', rowGroup: true, hide: true },
        {
            headerName: 'Total',
            colId: 'total',
            cellClass: ['number-cell', 'total-col'],
            aggFunc: 'sum',
            valueFormatter: formatNumber,
            valueGetter: (params: ValueGetterParams) => {
                const q1 = params.getValue('q1');
                const q2 = params.getValue('q2');
                const q3 = params.getValue('q3');
                const q4 = params.getValue('q4');
                const result = q1 + q2 + q3 + q4;
                console.log(
                    `Total Value Getter (${callCount}, ${params.column.getId()}): ${[q1, q2, q3, q4].join(', ')} =  ${result}`
                );
                callCount++;
                return result;
            },
        },
    ]);
    const defaultColDef = useMemo<ColDef>(() => ({ flex: 1, enableCellChangeFlash: true }), []);
    const autoGroupColumnDef = useMemo<ColDef>(() => ({ minWidth: 140 }), []);
    const columnTypes = useMemo(
        () => ({
            quarterFigure: {
                cellClass: 'number-cell',
                aggFunc: 'sum',
                valueFormatter: formatNumber,
                valueParser: (params: { newValue: string }) => Number(params.newValue),
            },
        }),
        []
    );
    const getRowId = useCallback((params: GetRowIdParams) => String(params.data.id), []);

    const onValueCache = useCallback((on: boolean) => {
        // valueCache is an initial-only grid option, so toggling it requires a full
        // grid re-creation — changing the key remounts the grid with the new setting.
        callCount = 1;
        setValueCacheOn(on);
        setGridKey(on ? 'grid-key-on' : 'grid-key-off');
    }, []);

    return (
        <AgGridProvider modules={modules}>
            <div style={containerStyle}>
                <div className="example-wrapper">
                    <div className="example-header">
                        Value Cache:
                        <input
                            type="radio"
                            id="valueCacheOn"
                            name="valueCache"
                            checked={valueCacheOn}
                            onChange={() => onValueCache(true)}
                        />
                        <label htmlFor="valueCacheOn">On</label>
                        <input
                            type="radio"
                            id="valueCacheOff"
                            name="valueCache"
                            checked={!valueCacheOn}
                            onChange={() => onValueCache(false)}
                        />
                        <label htmlFor="valueCacheOff">Off</label>
                    </div>
                    <div style={gridStyle}>
                        <AgGridReact
                            key={gridKey}
                            rowData={rowData}
                            columnDefs={columnDefs}
                            defaultColDef={defaultColDef}
                            autoGroupColumnDef={autoGroupColumnDef}
                            columnTypes={columnTypes}
                            valueCache={valueCacheOn}
                            suppressAggFuncInHeader={true}
                            groupDefaultExpanded={1}
                            getRowId={getRowId}
                            onCellValueChanged={() => console.log('onCellValueChanged')}
                        />
                    </div>
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
