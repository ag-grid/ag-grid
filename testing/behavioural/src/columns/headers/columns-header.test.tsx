import '@testing-library/jest-dom';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import React, { useMemo, useState } from 'react';

import type { ColDef } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

const data = [{ a: 1, b: 10, c: 100 }];
const columns = [
    {
        headerName: 'GroupName',
        children: [
            {
                field: 'a',
                headerName: 'ColumnA',
            },
        ],
    },
];

const App = () => <AgGridReact rowData={data} columnDefs={columns} modules={[AllCommunityModule]} />;

describe('React Jsdom column header ', () => {
    beforeEach(() => {
        cleanup();
    });

    it('Column Header and Cell content displayed in Jsdom', () => {
        render(<App />);
        // Test validates shows a way to validate the column headers and cell content even in Jsdom
        expect(screen.getAllByRole('columnheader').map((x) => x.textContent?.trim())).toEqual(['GroupName', 'ColumnA']);
        expect(screen.getAllByRole('gridcell').map((x) => x.textContent)).toEqual(['1']);
    });

    it('Hidden column header is not displayed', async () => {
        const HiddenColumnApp = () => {
            const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
            const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);

            const [columnDefs] = useState<ColDef[]>([{ field: 'country', pinned: 'left' }, { field: 'athlete' }]);

            const data = [{ country: 'USA', athlete: 'One' }];

            return (
                <div style={containerStyle}>
                    <div style={gridStyle}>
                        <AgGridReact
                            rowData={data}
                            columnDefs={columnDefs}
                            modules={[AllCommunityModule]}
                            onGridReady={(params) => {
                                params.api.applyColumnState({
                                    state: [
                                        {
                                            colId: 'athlete',
                                            hide: true,
                                        },
                                    ],
                                });
                            }}
                        />
                    </div>
                </div>
            );
        };

        render(<HiddenColumnApp />);

        // Validate that initially both headers are displayed
        const headers = screen.getAllByRole('columnheader').map((x) => x.textContent?.trim());
        expect(headers).toEqual(['Country', 'Athlete']);

        // Wait for the onGridReady callback to complete which should have hidden the 'athlete' column
        await waitFor(() => {
            const headers = screen.getAllByRole('columnheader').map((x) => x.textContent?.trim());
            expect(headers).toEqual(['Country']);

            // Validate that only the country cell data is shown
            const cells = screen.getAllByRole('gridcell').map((x) => x.textContent);
            expect(cells).toEqual(['USA']);
            expect(cells).not.toContain('One');
        });
    });
});
