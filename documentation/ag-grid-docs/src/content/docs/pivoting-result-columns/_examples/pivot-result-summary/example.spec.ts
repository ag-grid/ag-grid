import { ensureGridReady, expect, gridEventLog, recreateGrid, test } from '@utils/grid/test-utils';

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
            async ({ page, agIdFor, request }) => {
                // Relative, so it resolves against the whole base URL: a branch build is served under a
                // path prefix, where a leading slash would resolve against the origin alone and 404.
                const response = await request.get('example-assets/small-olympic-winners.json', {
                    ignoreHTTPSErrors: true,
                });
                const data = await response.json();

                await ensureGridReady(page);

                // Integration Testing with initial options
                await recreateGrid(
                    page,
                    {
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
                    },
                    '1'
                );

                await ensureGridReady(page);

                const log = await gridEventLog(page, '1');
                await log.record('cellEditingStarted', ['value']);
                await log.record('cellValueChanged', ['newValue', 'oldValue', 'source']);
                await log.record('cellEditingStopped', ['newValue', 'oldValue', 'value', 'valueChanged']);

                const cell = agIdFor.cell('row-group-country-United States', 'pivot_year_2000_gold');
                await expect(cell).toBeVisible();
                await cell.press('1');
                const editor = cell.locator('input');
                await expect(editor).toBeVisible();
                await page.keyboard.type('234');
                await page.keyboard.press(editFinishKey);

                await expect.poll(() => log.entries()).toMatchObject(expected);
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
            `DblClick-started Edit on cell with [${editFinishKey}] when enableGroupEdits=true`,
            async ({ page, agIdFor, request }) => {
                const response = await request.get('example-assets/small-olympic-winners.json', {
                    ignoreHTTPSErrors: true,
                });
                const data = await response.json();

                await ensureGridReady(page);

                // Integration Testing with initial options
                await recreateGrid(
                    page,
                    {
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
                    },
                    '1'
                );

                const log = await gridEventLog(page, '1');
                await log.record('cellEditingStarted', ['value']);
                await log.record('cellValueChanged', ['newValue', 'oldValue', 'source']);
                await log.record('cellEditingStopped', ['newValue', 'oldValue', 'value', 'valueChanged']);

                const cell = agIdFor.cell('row-group-country-United States', 'pivot_year_2000_gold');
                await cell.dblclick();
                await page.keyboard.type('1234');
                await page.keyboard.press(editFinishKey);

                await expect.poll(() => log.entries()).toMatchObject(expected);
            }
        );
    });
});
