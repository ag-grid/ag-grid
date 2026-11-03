/**
 * Issue: when the grid is inside a <form>, clicking the close button of the Integrated Charts tool panel submits the
 * host form.
 *
 * Setup: an Enterprise grid with integrated charts and `cellSelection` inside a <form> whose submit listener calls
 * preventDefault() and counts events. A range chart is created through the API with no `chartContainer`, so the chart
 * dialog is added inside the grid, and its tool panel is opened. The panel's close button is then clicked.
 *
 * Expected: the tool panel closes and the form is not submitted. A component embedded in a page should not submit the
 * page's form when the user uses its own controls, and the grid follows this for the buttons it creates elsewhere
 * (side bar buttons, chart toolbar buttons, column header edit buttons), which all set type="button". No docs page
 * says that the grid is unsupported inside a form.
 *
 * Actual: the close button is created with no `type`, so it defaults to type="submit". Clicking it closes the panel
 * but also submits the form, with the close button as the submitter (without preventDefault in the app, the page
 * navigates or reloads).
 *
 * Reported on: not reported; found by an area review of grid buttons inside a host form for AG-18665. A related
 * search by a coding agent was "button type attribute inside form default submit".
 *
 * Source: found by an area review of "Grid buttons inside a host form" for AG-18665. Related search text:
 * "button type attribute inside form default submit".
 */
import { expect, test } from '@playwright/test';

import type { GridApi } from 'ag-grid-community';

import { mountGrid } from '../src/mountGrid';

test('closing the chart tool panel does not submit the host form', async ({ page }) => {
    const { grid } = await mountGrid(page, {
        enterprise: true,
        integratedCharts: true,
        height: 400,
        options: () => ({
            columnDefs: [
                { field: 'country', chartDataType: 'category' },
                { field: 'gold', chartDataType: 'series' },
            ],
            rowData: [
                { country: 'Russia', gold: 3 },
                { country: 'USA', gold: 4 },
            ],
            cellSelection: true,
            enableCharts: true,
        }),
    });

    await page.evaluate(() => {
        const gridDiv = document.querySelector('#myGrid')!;
        const form = document.createElement('form');
        form.innerHTML = '<div id="grid-slot"></div>';
        gridDiv.before(form);
        form.querySelector('#grid-slot')!.replaceWith(gridDiv);
        (window as any).submitters = [];
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            (window as any).submitters.push((e.submitter as HTMLElement | null)?.className ?? null);
        });
    });

    await page.evaluate(async () => {
        const api: GridApi = (window as any).gridApi;
        const chartRef = api.createRangeChart({
            cellRange: { columns: ['country', 'gold'] },
            chartType: 'groupedColumn',
        })!;
        await chartRef.chart.waitForUpdate();
        api.openChartToolPanel({ chartId: chartRef.chartId });
    });

    const closeButton = grid.locator('.ag-chart-tabbed-menu-close-button');
    await expect(closeButton).toBeVisible();

    await closeButton.click();

    await expect.poll(() => page.evaluate(() => (window as any).submitters)).toEqual([]);
    await expect(page.locator('.ag-chart-menu-visible')).toHaveCount(0);
});
