import { expect, test } from '@utils/grid/test-utils';
import type { AsyncGridApi, EventLog } from '@utils/grid/test/remoteGridapi';
import type { Page } from 'playwright/test';

test.agExample(import.meta, () => {
    test.use({ agModules: ['SetFilterModule'] });

    test.eachFramework('Example Click Filter List Item', async ({ page, agIdFor, remoteGrid, agFramework }) => {
        test.skip(agFramework === 'vanilla', 'Vanilla does not have Enterprise in this example');

        const miniFilterSearch = await setupTest(remoteGrid, page, agIdFor);

        await performTest(agIdFor, page, miniFilterSearch);
    });

    test.eachFramework(
        'Example Click Filter List Item after filtering',
        async ({ page, agIdFor, remoteGrid, agFramework }) => {
            test.skip(agFramework === 'vanilla', 'Vanilla does not have Enterprise in this example');

            const miniFilterSearch = await setupTest(remoteGrid, page, agIdFor);

            await miniFilterSearch.fill('arm');

            await performTest(agIdFor, page, miniFilterSearch);
        }
    );
});
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
    await expect(firstRowAthlete.locator('..')).toHaveAttribute('row-index', '0');

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

async function setupTest(
    remoteGrid: ((page: Page, gridId?: string) => AsyncGridApi) & {
        eventLog: EventLog;
        waitForEventlog: (timeoutMs: number) => Promise<EventLog>;
    },
    page: Page,
    agIdFor: any
) {
    const remoteApi = remoteGrid(page, '1');
    remoteApi.setGridOption('columnDefs', [
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
    ]);

    const colFilterIcon = agIdFor.headerFilterButton('athlete');
    await colFilterIcon.click();

    const miniFilterSearch = agIdFor.setFilterInstanceMiniFilterInput({ source: 'column-filter' });
    await expect(miniFilterSearch).toBeVisible();
    return miniFilterSearch;
}
