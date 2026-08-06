'use client';

import React, { StrictMode, useCallback, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { ColDef, IDateFilterParams, IRowNode } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    DateFilterModule,
    ExternalFilterModule,
    NumberFilterModule,
    enableDevValidations,
} from 'ag-grid-community';
import { ColumnMenuModule, ColumnsToolPanelModule, ContextMenuModule, SetFilterModule } from 'ag-grid-enterprise';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';

import type { IOlympicData } from './interfaces';
import './styles.css';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

const modules = [
    ExternalFilterModule,
    ClientSideRowModelModule,
    ColumnsToolPanelModule,
    ColumnMenuModule,
    ContextMenuModule,
    SetFilterModule,
    NumberFilterModule,
    DateFilterModule,
];

const asDate = (dateAsString: string): Date => {
    const splitFields = dateAsString.split('/');
    return new Date(
        Number.parseInt(splitFields[2]),
        Number.parseInt(splitFields[1]) - 1,
        Number.parseInt(splitFields[0])
    );
};

const dateFilterParams: IDateFilterParams = {
    comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
        const cellDate = asDate(cellValue);

        if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
            return 0;
        }
        if (cellDate < filterLocalDateAtMidnight) {
            return -1;
        }
        if (cellDate > filterLocalDateAtMidnight) {
            return 1;
        }
        return 0;
    },
};

const columnDefs: ColDef<IOlympicData>[] = [
    { field: 'athlete', minWidth: 180 },
    { field: 'age', filter: 'agNumberColumnFilter', maxWidth: 80 },
    { field: 'country' },
    { field: 'year', maxWidth: 90 },
    {
        field: 'date',
        filter: 'agDateColumnFilter',
        filterParams: dateFilterParams,
    },
    { field: 'gold', filter: 'agNumberColumnFilter' },
    { field: 'silver', filter: 'agNumberColumnFilter' },
    { field: 'bronze', filter: 'agNumberColumnFilter' },
];

const GridExample = () => {
    const [ageType, setAgeType] = useState('everyone');

    const defaultColDef = useMemo<ColDef>(() => ({ flex: 1, minWidth: 120, filter: true }), []);

    const { data, loading } = useFetchJson<IOlympicData>('https://www.ag-grid.com/example-assets/olympic-winners.json');

    // Both callbacks depend on ageType, so changing it hands the grid new references and filtering re-runs.
    const isExternalFilterPresent = useCallback((): boolean => ageType !== 'everyone', [ageType]);

    const doesExternalFilterPass = useCallback(
        (node: IRowNode<IOlympicData>): boolean => {
            if (node.data) {
                switch (ageType) {
                    case 'below25':
                        return node.data.age < 25;
                    case 'between25and50':
                        return node.data.age >= 25 && node.data.age <= 50;
                    case 'above50':
                        return node.data.age > 50;
                    case 'dateAfter2008':
                        return asDate(node.data.date) > new Date(2008, 0, 1);
                    default:
                        return true;
                }
            }
            return true;
        },
        [ageType]
    );

    return (
        <AgGridProvider modules={modules}>
            <div className="test-container">
                <div className="test-header">
                    <label>
                        <input
                            type="radio"
                            name="filter"
                            id="everyone"
                            defaultChecked
                            onChange={() => setAgeType('everyone')}
                        />
                        Everyone
                    </label>
                    <label>
                        <input type="radio" name="filter" id="below25" onChange={() => setAgeType('below25')} />
                        Below 25
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="filter"
                            id="between25and50"
                            onChange={() => setAgeType('between25and50')}
                        />
                        Between 25 and 50
                    </label>
                    <label>
                        <input type="radio" name="filter" id="above50" onChange={() => setAgeType('above50')} />
                        Above 50
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="filter"
                            id="dateAfter2008"
                            onChange={() => setAgeType('dateAfter2008')}
                        />
                        After 01/01/2008
                    </label>
                </div>
                <div style={{ height: '100%' }}>
                    <AgGridReact<IOlympicData>
                        rowData={data}
                        loading={loading}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        isExternalFilterPresent={isExternalFilterPresent}
                        doesExternalFilterPass={doesExternalFilterPass}
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
