import { ClientSideRowModelModule, CsvExportModule } from 'ag-grid-community';

import { TestGridsManager } from '../test-utils';

describe('CSV export header layout', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule, CsvExportModule] });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('emits padded group header rows with resolvable group names', () => {
        const api = gridsManager.createGrid('csv-grouped-headers', {
            columnDefs: [
                {
                    headerName: 'Athlete Details',
                    children: [{ field: 'athlete' }, { field: 'country' }],
                },
                { field: 'age' },
            ],
            defaultColGroupDef: { headerName: 'Other' },
            rowData: [],
        });

        const csv = api.getDataAsCsv({ suppressQuotes: true });

        expect(csv).toBe('Athlete Details,,Other\r\nAthlete,Country,Age');
    });

    test('resolves padded group header values through processGroupHeaderCallback', () => {
        const api = gridsManager.createGrid('csv-grouped-header-callback', {
            columnDefs: [
                {
                    headerName: 'Athlete Details',
                    children: [{ field: 'athlete' }, { field: 'country' }],
                },
                { field: 'age' },
            ],
            rowData: [],
        });

        const csv = api.getDataAsCsv({
            suppressQuotes: true,
            processGroupHeaderCallback: ({ columnGroup }) => columnGroup.getColGroupDef()?.headerName ?? 'Padded Group',
        });

        expect(csv).toBe('Athlete Details,,Padded Group\r\nAthlete,Country,Age');
    });

    test('suppressSpanHeaderHeight does not change CSV output', () => {
        const createCsv = (id: string, suppressSpanHeaderHeight: boolean): string => {
            const api = gridsManager.createGrid(id, {
                columnDefs: [
                    {
                        headerName: 'Athlete Details',
                        children: [{ field: 'athlete' }, { field: 'country' }],
                    },
                    { field: 'age', suppressSpanHeaderHeight },
                ],
                rowData: [],
            });
            return api.getDataAsCsv({ suppressQuotes: true })!;
        };

        expect(createCsv('csv-spanning-header', false)).toBe(createCsv('csv-padded-header', true));
    });
});
