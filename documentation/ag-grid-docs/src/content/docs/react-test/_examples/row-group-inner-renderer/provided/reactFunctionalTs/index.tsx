'use client';

import React, { StrictMode, useCallback, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { GetRowIdParams, GridApi, GridReadyEvent } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import type { CustomCellRendererProps } from 'ag-grid-react';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';

const countries = ['USA', 'UK', 'Germany', 'France', 'Japan'];
const sports = ['Swimming', 'Athletics', 'Cycling', 'Gymnastics'];

const data: { id: number; group: number; country: string; sport: string }[] = [];

function getRandomIntInclusive(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

for (let i = 0; i < 1000; i++) {
    data.push({
        id: i,
        group: i % 5,
        country: countries[getRandomIntInclusive(0, countries.length - 1)],
        sport: sports[getRandomIntInclusive(0, sports.length - 1)],
    });
}

const MyInnerRenderer = (props: CustomCellRendererProps) => {
    const refreshCells = useCallback(() => {
        if (props.api === undefined) {
            console.log('Grid not ready.');
            return;
        }
        props.api.refreshCells({ force: true });
    }, []);

    return (
        <span style={{ fontWeight: 'bold' }}>
            <span>{props.value}</span>
            <span>
                <button onMouseMove={refreshCells}>Refresh</button>
            </span>
        </span>
    );
};

function GridExample() {
    const [, setGridApi] = useState<GridApi>();
    const getRowId = useCallback((p: GetRowIdParams) => String(p.data.id), []);

    const colDefs = useMemo(
        () => [
            { field: 'id', aggFunc: 'sum' },
            { field: 'sport' },
            { field: 'country' },
            { field: 'group', enableRowGroup: true, rowGroup: true, rowGroupIndex: 0, hide: true },
        ],
        []
    );

    const autoGroupColumnDef = useMemo(
        () => ({
            cellRenderer: 'agGroupCellRenderer',
            cellRendererParams: {
                innerRenderer: MyInnerRenderer,
                suppressCount: true,
            },
        }),
        []
    );

    const onGridReady = useCallback((e: GridReadyEvent) => {
        setGridApi(e.api);
    }, []);

    return (
        <AgGridProvider modules={[AllEnterpriseModule]}>
            <AgGridReact
                rowData={data}
                columnDefs={colDefs}
                getRowId={getRowId}
                onGridReady={onGridReady}
                autoGroupColumnDef={autoGroupColumnDef}
            />
        </AgGridProvider>
    );
}

const root = createRoot(document.getElementById('root')!);
root.render(
    <StrictMode>
        <GridExample />
    </StrictMode>
);
