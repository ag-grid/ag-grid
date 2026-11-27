import { ensureGridReady, expect, gridApiHandle, test, waitForGridContent } from '@utils/grid/test-utils';
import type { Page } from 'playwright/test';

test.agExample(import.meta, () => {
    test.use({ agModules: ['SetFilterModule'] });

    test.eachFramework('Example Click Filter List Item', async ({ page, agIdFor, agFramework }) => {
        test.skip(agFramework === 'vanilla', 'Vanilla does not have Enterprise in this example');

        const miniFilterSearch = await setupTest(page, agIdFor);

        await performTest(agIdFor, page, miniFilterSearch);
    });

    test.eachFramework('Example Click Filter List Item after filtering', async ({ page, agIdFor, agFramework }) => {
        test.skip(agFramework === 'vanilla', 'Vanilla does not have Enterprise in this example');

        const miniFilterSearch = await setupTest(page, agIdFor);

        await miniFilterSearch.fill('arm');

        await performTest(agIdFor, page, miniFilterSearch);
    });

    test.eachFramework('Typing logs the unapplied model before Apply applies it', async ({ page, agIdFor }) => {
        const modelLogs = captureModelLogs(page);
        await ensureGridReady(page);
        await waitForGridContent(page);

        await agIdFor.headerFilterButton('athlete').click();
        const filterMenu = page.locator('.ag-filter-menu');
        await filterMenu.locator('input[type="text"]').first().fill('Aaron Armstrong');

        // onFilterUiChanged fires on typing: the UI model is the typed text while the applied model is still empty.
        const typed = { filterType: 'text', type: 'contains', filter: 'Aaron Armstrong' };
        await expect.poll(() => modelLogs('unapplied model =>')).toContainEqual(typed);
        expect(await modelLogs('applied model =>')).toEqual(expect.not.arrayContaining([typed]));
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        await filterMenu.getByRole('button', { name: 'Apply', exact: true }).click();

        // onFilterChanged fires on Apply with the applied model, and the grid filters.
        await expect.poll(() => modelLogs('getFilterModel() =>')).toContainEqual({ athlete: typed });
        await expect(agIdFor.cell('8041', 'athlete')).toContainText('Aaron Armstrong');
        await expect(page.locator('.ag-row')).toHaveCount(1);
    });
});

/** Collects the model arguments the example logs, resolved when read so the object handles are still alive. */
function captureModelLogs(page: Page) {
    // The generated frameworks log through their own grid reference, so `getFilterModel() =>` is matched anywhere.
    const labels = ['applied model =>', 'unapplied model =>', 'getFilterModel() =>'];
    const entries: Promise<{ label: string; value: unknown }>[] = [];
    page.on('console', (msg) => {
        const label = labels.find((l) =>
            l === 'getFilterModel() =>' ? msg.text().includes(l) : msg.text().startsWith(l)
        );
        if (label) {
            entries.push(
                msg
                    .args()[1]
                    .jsonValue()
                    .then((value) => ({ label, value }))
            );
        }
    });
    return async (label: string) => (await Promise.all(entries)).filter((e) => e.label === label).map((e) => e.value);
}

async function performTest(agIdFor: any, page: Page, miniFilterSearch: any) {
    const armstrongOption = agIdFor.setFilterInstanceItem({ source: 'column-filter' }, 'Aaron Armstrong');
    await expect(armstrongOption).toBeVisible();
    await armstrongOption.click();

    const applyButton = agIdFor.setFilterApplyPanelButton({ source: 'column-filter' }, 'Apply');
    await expect(applyButton).toBeVisible();
    await applyButton.click();

    await expect(page.locator('[role="gridcell"]')).toHaveCount(1);
    const firstRowAthlete = agIdFor.cell('8041', 'athlete');
    await expect(firstRowAthlete).toHaveText('Aaron Armstrong');
    // check the row index attribute is correct on the parent row element
    await expect(page.locator('.ag-row').filter({ has: firstRowAthlete }).first()).toHaveAttribute('row-index', '0');

    const colFilterIcon2 = agIdFor.headerFilterButton('athlete');
    await expect(colFilterIcon2).toBeVisible();
    await colFilterIcon2.click();

    await expect(miniFilterSearch).toBeVisible();
    const clearButton = agIdFor.setFilterApplyPanelButton({ source: 'column-filter' }, 'Clear');
    await expect(clearButton).toBeVisible();
    await clearButton.click();

    await expect(miniFilterSearch).toBeVisible();
    await expect(miniFilterSearch).toBeEmpty();

    await applyButton.click();

    // count the number of gridcell via aria role
    const allGridCells = page.locator('[role="gridcell"]');
    await expect(allGridCells).toHaveCount(26);
}

async function setupTest(page: Page, agIdFor: any) {
    const api = await gridApiHandle(page, '1');
    await api.evaluate((api) =>
        api.setGridOption('columnDefs', [
            {
                field: 'athlete',
                filter: 'agSetColumnFilter',
                filterParams: {
                    showTooltips: true,
                    buttons: ['clear', 'apply'],
                    defaultToNothingSelected: true,
                    convertValuesToStrings: true,
                    closeOnApply: true,
                },
            },
        ])
    );

    const colFilterIcon = agIdFor.headerFilterButton('athlete');
    await colFilterIcon.click();

    const miniFilterSearch = agIdFor.setFilterInstanceMiniFilterInput({ source: 'column-filter' });
    await expect(miniFilterSearch).toBeVisible();
    return miniFilterSearch;
}
