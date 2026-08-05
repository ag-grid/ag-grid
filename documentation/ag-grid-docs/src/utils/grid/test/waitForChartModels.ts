import { expect } from 'playwright/test';

import type { ChartModel } from 'ag-grid-community';

import type { AsyncGridApi } from './remoteGridapi';

/**
 * Read the grid's chart models once `count` of them exist.
 *
 * Integrated-chart examples create their chart from `firstDataRendered`, which fires only after
 * the example's asynchronous data load. `waitForGridContent` returns as soon as the first cell
 * paints, so a single `getChartModels()` read can land before the chart has been created and see
 * an empty array. Retrying the read rides that gap out.
 */
export async function waitForChartModels(gridApi: AsyncGridApi, count: number = 1): Promise<ChartModel[]> {
    let models: ChartModel[] = [];
    await expect(async () => {
        models = (await gridApi.getChartModels()) ?? [];
        expect(models).toHaveLength(count);
    }).toPass();
    return models;
}
