import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
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
                // 33.3.0 only, not applicable in 34.x.0
                // [
                //     'cellEditingStarted',
                //     {
                //         value: 1,
                //     },
                // ],
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

                expect(eventLog).toMatchObject(eventLog);
            }
        );
    });
});
