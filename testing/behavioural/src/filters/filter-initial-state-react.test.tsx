import { cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';

import type { DoesFilterPassParams } from 'ag-grid-community';
import { ClientSideRowModelModule, CustomFilterModule, GridStateModule, RowApiModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

describe('a React custom filter in the initial state', () => {
    afterEach(() => {
        cleanup();
    });

    test('with filter handlers, filters the rows before they first render, without rendering the filter', async () => {
        const renderedCells: string[] = [];
        const firstDataRenderedRowCounts: number[] = [];
        let filterRenders = 0;
        const NameFilter = () => {
            filterRenders++;
            return <div />;
        };
        const NameCell = ({ value }: { value: string }) => {
            renderedCells.push(value);
            return <span>{value}</span>;
        };

        render(
            <div style={{ width: 400, height: 300 }}>
                <AgGridReact
                    modules={[ClientSideRowModelModule, CustomFilterModule, GridStateModule, RowApiModule]}
                    enableFilterHandlers
                    rowData={[{ name: 'Alpha' }, { name: 'Beta' }, { name: 'Gamma' }]}
                    columnDefs={[
                        {
                            field: 'name',
                            filter: {
                                component: NameFilter,
                                doesFilterPass: ({ data, model }: DoesFilterPassParams) => data.name === model,
                            },
                            cellRenderer: NameCell,
                        },
                    ]}
                    initialState={{ filter: { filterModel: { name: 'Alpha' } } }}
                    onFirstDataRendered={(e) => firstDataRenderedRowCounts.push(e.api.getDisplayedRowCount())}
                />
            </div>
        );

        await waitFor(() => expect(firstDataRenderedRowCounts).toEqual([1]));
        expect(new Set(renderedCells)).toEqual(new Set(['Alpha']));
        expect(filterRenders).toBe(0);
    });
});
