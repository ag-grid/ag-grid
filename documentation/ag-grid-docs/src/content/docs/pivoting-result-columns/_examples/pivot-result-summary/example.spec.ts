import { dragOverTo, ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';
import type { Locator } from 'playwright/test';

test.agExample(import.meta, () => {
    // Values captured versus 33.3.0 but with updated valueChange for bug fix
    [
        {
            editFinishKey: 'Enter',
            expected: [
                [
                    'cellEditingStarted',
                    {
                        value: 7,
                    },
                ],
                [
                    'cellEditingStopped',
                    {
                        newValue: 1234,
                        oldValue: 7,
                        value: 7,
                        valueChanged: true,
                    },
                ],
            ],
        },
        {
            editFinishKey: 'Escape',
            expected: [
                [
                    'cellEditingStarted',
                    {
                        value: 7,
                    },
                ],
                [
                    'cellEditingStopped',
                    {
                        newValue: undefined,
                        oldValue: 7,
                        value: 7,
                        valueChanged: false,
                    },
                ],
            ],
        },
        {
            editFinishKey: 'Tab',
            expected: [
                [
                    'cellEditingStarted',
                    {
                        value: 7,
                    },
                ],
                [
                    'cellEditingStopped',
                    {
                        newValue: 1234,
                        oldValue: 7,
                        value: 7,
                        valueChanged: true,
                    },
                ],
                [
                    'cellEditingStarted',
                    {
                        value: 1,
                    },
                ],
            ],
        },
    ].forEach(({ editFinishKey, expected }) => {
        test.vanilla(
            `Keyboard-started Edit on cell with [${editFinishKey}] when enableGroupEdits=true`,
            async ({ page, agIdFor, remoteGrid, request }) => {
                const response = await request.get('/example-assets/small-olympic-winners.json', {
                    ignoreHTTPSErrors: true,
                });
                const data = await response.json();

                const remoteApi = remoteGrid(page, '1');

                // Integration Testing with initial options
                await remoteApi.recreateGrid({
                    columnDefs: [
                        { field: 'country', rowGroup: true },
                        { field: 'year', pivot: true },
                        {
                            field: 'gold',
                            aggFunc: 'sum',
                        },
                        { field: 'silver', aggFunc: 'sum' },
                        { field: 'bronze', aggFunc: 'sum' },
                    ],
                    defaultColDef: {
                        flex: 1,
                        minWidth: 130,
                        editable: true,
                    },
                    autoGroupColumnDef: {
                        minWidth: 200,
                        editable: true,
                    },
                    // singleClickEdit: true,
                    enableGroupEdit: true,
                    pivotMode: true,
                    rowData: data,
                });

                await ensureGridReady(page);

                await remoteApi.logEvent('cellEditingStarted', ['value']);
                await remoteApi.logEvent('cellValueChanged', ['newValue', 'oldValue', 'source']);
                await remoteApi.logEvent('cellEditingStopped', ['newValue', 'oldValue', 'value', 'valueChanged']);

                const cell = agIdFor.cell('row-group-country-United States', 'pivot_year_2000_gold');
                await expect(cell).toBeVisible();
                await cell.press('1');
                const editor = cell.locator('input');
                await expect(editor).toBeVisible();
                await page.keyboard.type('234');
                await page.keyboard.press(editFinishKey);

                const eventLog = await remoteGrid.waitForEventlog(250);

                expect(eventLog).toMatchObject(expected);
            }
        );
    });

    // Values captured versus 33.3.0

    [
        {
            editFinishKey: 'Enter',
            expected: [
                [
                    'cellEditingStarted',
                    {
                        value: 7,
                    },
                ],
                [
                    'cellEditingStopped',
                    {
                        newValue: 1234,
                        oldValue: 7,
                        value: 7,
                        valueChanged: false,
                    },
                ],
            ],
        },
        {
            editFinishKey: 'Escape',
            expected: [
                [
                    'cellEditingStarted',
                    {
                        value: 7,
                    },
                ],
                [
                    'cellEditingStopped',
                    {
                        newValue: undefined,
                        oldValue: 7,
                        value: 7,
                        valueChanged: false,
                    },
                ],
            ],
        },
        {
            editFinishKey: 'Tab',
            expected: [
                [
                    'cellEditingStarted',
                    {
                        value: 7,
                    },
                ],
                [
                    'cellEditingStopped',
                    {
                        newValue: 1234,
                        oldValue: 7,
                        value: 7,
                        valueChanged: false,
                    },
                ],
                [
                    'cellEditingStarted',
                    {
                        value: 1,
                    },
                ],
            ],
        },
    ].forEach(({ editFinishKey, expected }) => {
        test.vanilla(
            `DblClick-started Edit on cell with [${editFinishKey}] when enableGroupEdits=true`,
            async ({ page, agIdFor, remoteGrid, request }) => {
                const response = await request.get('/example-assets/small-olympic-winners.json', {
                    ignoreHTTPSErrors: true,
                });
                const data = await response.json();

                const remoteApi = remoteGrid(page, '1');

                // Integration Testing with initial options
                await remoteApi.recreateGrid({
                    columnDefs: [
                        { field: 'country', rowGroup: true },
                        { field: 'year', pivot: true },
                        {
                            field: 'gold',
                            aggFunc: 'sum',
                        },
                        { field: 'silver', aggFunc: 'sum' },
                        { field: 'bronze', aggFunc: 'sum' },
                    ],
                    defaultColDef: {
                        flex: 1,
                        minWidth: 130,
                        editable: true,
                    },
                    autoGroupColumnDef: {
                        minWidth: 200,
                        editable: true,
                    },
                    // singleClickEdit: true,
                    enableGroupEdit: true,
                    pivotMode: true,
                    rowData: data,
                });

                await remoteApi.logEvent('cellEditingStarted', ['value']);
                await remoteApi.logEvent('cellValueChanged', ['newValue', 'oldValue', 'source']);
                await remoteApi.logEvent('cellEditingStopped', ['newValue', 'oldValue', 'value', 'valueChanged']);

                const cell = agIdFor.cell('row-group-country-United States', 'pivot_year_2000_gold');
                await cell.dblclick();
                await page.keyboard.type('1234');
                await page.keyboard.press(editFinishKey);

                const eventLog = await remoteGrid.waitForEventlog(250);

                expect(eventLog).toMatchObject(expected);
            }
        );
    });

    // Vanilla only because we're using `recreateGrid` which doesn't currently work with other frameworks
    test.vanilla(
        'Pivot result column ordering reflects order in values list when enableStrictPivotColumnOrder and persisted via state',
        async ({ page, agIdFor, remoteGrid }) => {
            await waitForGridContent(page);

            const remoteApi = remoteGrid(page, '1');

            await remoteApi.setGridOption('enableStrictPivotColumnOrder', true);
            await remoteApi.setGridOption('sideBar', 'columns');
            await remoteApi.setGridOption('defaultColDef', {
                flex: 1,
                minWidth: 130,
                enableValue: true,
            });

            await assertVisualColumnOrder([
                agIdFor.headerCell('pivot_sport_Alpine Skiing_gold'),
                agIdFor.headerCell('pivot_sport_Alpine Skiing_silver'),
                agIdFor.headerCell('pivot_sport_Alpine Skiing_bronze'),
            ]);

            const silverDragHandle = agIdFor.columnDropCellDragHandle('toolbar', 'Values', 'sum(Silver)');
            const valueDropArea = agIdFor.columnDropArea('toolbar', 'Values');

            // This places silver at the top of the list by default.
            await dragOverTo(silverDragHandle, valueDropArea);

            await assertVisualColumnOrder([
                agIdFor.headerCell('pivot_sport_Alpine Skiing_silver'),
                agIdFor.headerCell('pivot_sport_Alpine Skiing_gold'),
                agIdFor.headerCell('pivot_sport_Alpine Skiing_bronze'),
            ]);

            const state = await remoteApi.getState();
            const rowData = await remoteApi.getGridOption('rowData');

            // re-create grid using the current state (having changed the order of the values list)
            await remoteApi.recreateGrid({
                columnDefs: [
                    { field: 'country', rowGroup: true },
                    { field: 'sport', pivot: true },
                    { field: 'gold', aggFunc: 'sum' },
                    { field: 'silver', aggFunc: 'sum' },
                    { field: 'bronze', aggFunc: 'sum' },
                ],
                defaultColDef: {
                    flex: 1,
                    minWidth: 130,
                    enableValue: true,
                },
                autoGroupColumnDef: {
                    minWidth: 200,
                },
                pivotMode: true,
                enableStrictPivotColumnOrder: true,
                sideBar: true,
                initialState: state,
                rowData,
            });

            await waitForGridContent(page);

            // Assert that we restore the result columns in the order we put them in before re-creating the grid.
            await assertVisualColumnOrder([
                agIdFor.headerCell('pivot_sport_Alpine Skiing_silver'),
                agIdFor.headerCell('pivot_sport_Alpine Skiing_gold'),
                agIdFor.headerCell('pivot_sport_Alpine Skiing_bronze'),
            ]);
        }
    );
});

async function assertVisualColumnOrder(elements: Locator[]): Promise<void> {
    const bbs = await Promise.all(elements.map((e) => e.boundingBox()));

    async function getColId(i: number) {
        const handle = await elements[i].elementHandle();
        return handle?.getAttribute('col-id');
    }

    for (let i = 1; i < bbs.length; i++) {
        const currentX = bbs[i]?.x ?? 0;
        const prevX = bbs[i - 1]?.x ?? 0;
        const colIdCurr = await getColId(i);
        const colIdPrev = await getColId(i - 1);

        expect(currentX, `Expected ${colIdCurr} to appear to the right of ${colIdPrev}`).toBeGreaterThanOrEqual(prevX);
    }
}
