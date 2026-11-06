import { ALL_SEVERITIES, AdvancedFilterHarness, TestGridsManager, asyncSetTimeout } from 'ag-test-utils';
import { onTestFinished } from 'vitest';

import type {
    AdvancedFilterModel,
    GridOptions,
    IServerSideGetRowsParams,
    IServerSideGetRowsRequest,
    IssueRaisedEvent,
} from 'ag-grid-community';
import { ClientSideRowModelModule, GridStateModule, TextFilterModule, enableDevValidations } from 'ag-grid-community';
import { AdvancedFilterModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

const ROW_DATA = [
    { athlete: 'Anna', country: 'Poland' },
    { athlete: 'Bob', country: 'Jamaica' },
];

const containsN = (colId: string): AdvancedFilterModel => ({
    filterType: 'text',
    colId,
    type: 'contains',
    filter: 'n',
});

describe('Advanced Filter model naming a column the Advanced Filter does not offer', () => {
    const gridsManager = new TestGridsManager({
        modules: [TextFilterModule, AdvancedFilterModule, ClientSideRowModelModule, GridStateModule],
    });

    afterEach(() => gridsManager.reset());

    /** Collects every raised issue, as the console dedupes repeats and would hide a double-fire. */
    function collectIssues(): { issues: IssueRaisedEvent[]; onIssueRaised: (event: IssueRaisedEvent) => void } {
        enableDevValidations({ throwOn: [] });
        onTestFinished(() => enableDevValidations({ throwOn: ALL_SEVERITIES }));
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        onTestFinished(() => warnSpy.mockRestore());
        const issues: IssueRaisedEvent[] = [];
        return { issues, onIssueRaised: (event) => issues.push(event) };
    }

    const ids = (issues: IssueRaisedEvent[]) => issues.map(({ id }) => id);

    test('setAdvancedFilterModel warns, naming the column without filtering enabled', async () => {
        const { issues, onIssueRaised } = collectIssues();
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'athlete' }],
            rowData: ROW_DATA,
            enableAdvancedFilter: true,
            onIssueRaised,
        });

        api.setAdvancedFilterModel(containsN('athlete'));

        expect(api.getAdvancedFilterModel()).toBeNull();
        expect(ids(issues)).toEqual([342]);
        expect(issues[0].message).toContain('athlete');
    });

    test('a colId with no column warns that no column has that id', async () => {
        const { issues, onIssueRaised } = collectIssues();
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'athlete', filter: true }],
            rowData: ROW_DATA,
            enableAdvancedFilter: true,
            onIssueRaised,
        });

        api.setAdvancedFilterModel(containsN('doesNotExist'));

        expect(ids(issues)).toEqual([341]);
        expect(issues[0].message).toContain('doesNotExist');
        expect(api.getAdvancedFilterModel()).toBeNull();
    });

    test('a hidden filterable column warns unless includeHiddenColumnsInAdvancedFilter is set', async () => {
        const { issues, onIssueRaised } = collectIssues();
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'athlete', filter: true, hide: true },
                { field: 'country', filter: true },
            ],
            rowData: ROW_DATA,
            enableAdvancedFilter: true,
            onIssueRaised,
        });

        api.setAdvancedFilterModel(containsN('athlete'));
        expect(ids(issues)).toEqual([342]);
        expect(api.getAdvancedFilterModel()).toBeNull();

        issues.length = 0;
        api.setGridOption('includeHiddenColumnsInAdvancedFilter', true);
        api.setAdvancedFilterModel(containsN('athlete'));

        expect(issues).toEqual([]);
        expect(api.getAdvancedFilterModel()).toEqual(containsN('athlete'));
    });

    test('a model in initialState warns once for a column without filtering enabled', async () => {
        const { issues, onIssueRaised } = collectIssues();
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'athlete' }, { field: 'country', filter: true }],
            rowData: ROW_DATA,
            enableAdvancedFilter: true,
            initialState: { filter: { advancedFilterModel: containsN('athlete') } },
            onIssueRaised,
        });

        expect(ids(issues)).toEqual([342]);
        expect(issues[0].message).toContain('athlete');
        expect(api.getAdvancedFilterModel()).toBeNull();
    });

    test('a model set before the rows arrive warns once, when it is applied', async () => {
        const { issues, onIssueRaised } = collectIssues();
        const api = gridsManager.createGrid('grid1', {
            columnDefs: [{ field: 'athlete' }, { field: 'country', filter: true }],
            rowData: [],
            enableAdvancedFilter: true,
            onIssueRaised,
        });
        await asyncSetTimeout(0);

        api.setAdvancedFilterModel(containsN('athlete'));
        expect(issues).toEqual([]);

        api.setGridOption('rowData', ROW_DATA);
        await asyncSetTimeout(0);

        expect(ids(issues)).toEqual([342]);
        expect(api.getAdvancedFilterModel()).toBeNull();
    });

    test('a join naming an unavailable colId twice warns once, for that colId only', async () => {
        const { issues, onIssueRaised } = collectIssues();
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'athlete' }, { field: 'country', filter: true }],
            rowData: ROW_DATA,
            enableAdvancedFilter: true,
            onIssueRaised,
        });

        api.setAdvancedFilterModel({
            filterType: 'join',
            type: 'AND',
            conditions: [
                containsN('country'),
                { filterType: 'join', type: 'OR', conditions: [containsN('athlete'), containsN('athlete')] },
            ],
        });

        expect(ids(issues)).toEqual([342]);
        expect(issues[0].message).toContain('athlete');
        expect(issues[0].message).not.toContain('country');
    });

    test('valid models, clearing the model and typed expressions raise no warning', async () => {
        const { issues, onIssueRaised } = collectIssues();
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'athlete' }, { field: 'country', filter: true }],
            rowData: ROW_DATA,
            enableAdvancedFilter: true,
            onIssueRaised,
        });

        api.setAdvancedFilterModel(containsN('country'));
        expect(api.getAdvancedFilterModel()).toEqual(containsN('country'));
        api.setAdvancedFilterModel(null);
        await AdvancedFilterHarness.get(api).applyExpression('[athlete] contains "n"');

        expect(issues).toEqual([]);
    });

    test('a model set while the grid has no columns warns that no column has that id', async () => {
        const { issues, onIssueRaised } = collectIssues();
        const api = gridsManager.createGrid('grid1', {
            rowData: ROW_DATA,
            enableAdvancedFilter: true,
            onIssueRaised,
        });
        await asyncSetTimeout(0);

        api.setAdvancedFilterModel(containsN('athlete'));

        expect(ids(issues)).toEqual([341]);
    });

    describe('Server-Side Row Model', () => {
        const ssrmGridsManager = new TestGridsManager({
            modules: [TextFilterModule, AdvancedFilterModule, ServerSideRowModelModule],
        });

        afterEach(() => ssrmGridsManager.reset());

        test('a model on a column without filtering enabled warns, and the request carries no filter', async () => {
            const { issues, onIssueRaised } = collectIssues();
            const requests: IServerSideGetRowsRequest[] = [];
            const api = await ssrmGridsManager.createGridAndWait('grid1', {
                columnDefs: [{ field: 'athlete' }, { field: 'country', filter: true }],
                rowModelType: 'serverSide',
                serverSideDatasource: {
                    getRows: (params: IServerSideGetRowsParams) => {
                        requests.push(params.request);
                        params.success({ rowData: ROW_DATA, rowCount: ROW_DATA.length });
                    },
                },
                enableAdvancedFilter: true,
                onIssueRaised,
            } as GridOptions);

            requests.length = 0;
            api.setAdvancedFilterModel(containsN('athlete'));
            await asyncSetTimeout(0);

            expect(ids(issues)).toEqual([342]);
            expect(issues[0].message).toContain('athlete');
            expect(requests.at(-1)?.filterModel ?? null).toBeNull();
        });
    });
});
