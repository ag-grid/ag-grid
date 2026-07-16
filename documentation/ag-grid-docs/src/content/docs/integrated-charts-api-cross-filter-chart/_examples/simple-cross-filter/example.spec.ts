import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // The simple cross-filter example creates a single 'pie' cross-filter chart on firstDataRendered,
    // charting salesRep vs sale, rendered into the #pieChart container. Cross-filter interactions are
    // only pixel-addressable on the chart canvas, so this asserts chart creation/type (observable via
    // getChartModels + canvas) and the documented grid setup.
    test.eachFramework('creates a pie cross-filter chart in the provided container', async ({ page, remoteGrid }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const api = remoteGrid(page);

        // createCrossFilterChart renders an AG Charts canvas into the #pieChart container.
        await expect(page.locator('#pieChart canvas').first()).toBeVisible();

        // Exactly one chart exists, of the documented 'pie' type.
        const models = (await api.getChartModels()) as any[];
        expect(models).toHaveLength(1);
        expect(models[0].chartType).toBe('pie');

        // Documented grid columns are present with their configured headers.
        await expect(page.getByTestId('ag-header-cell:colId=salesRep')).toContainText('Sales Rep');
        await expect(page.getByTestId('ag-header-cell:colId=sale')).toContainText('Sale');

        // No grid filter is active on load (cross-filtering only applies once a chart element is clicked).
        expect(await api.getFilterModel()).toEqual({});
    });
});
