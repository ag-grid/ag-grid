import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import type { MatchImageSnapshotOptions } from 'jest-image-snapshot';
import { toMatchImageSnapshot } from 'jest-image-snapshot';

import { ClientSideRowModelModule, setupAgTestIds } from 'ag-grid-community';
import { CellSelectionModule, IntegratedChartsModule } from 'ag-grid-enterprise';

import { TestGridsManager, canvasPolyfill, renderChartToBuffer } from '../test-utils';

declare module 'vitest' {
    interface Assertion<T = any> {
        toMatchImageSnapshot(options?: MatchImageSnapshotOptions): T;
    }
}
expect.extend({ toMatchImageSnapshot });

const IMAGE_SNAPSHOT_OPTIONS = {
    // Zero tolerance is correct, not fragile: the pinned-by-digest container makes the render
    // deterministic (same Skia build, same fontconfig, same glibc every run), and PNG is a lossless
    // format - jest-image-snapshot diffs decoded pixels (via pngjs), so compression never perturbs
    // the comparison. A real regression is the only thing that can produce a nonzero diff here.
    failureThreshold: 0,
    failureThresholdType: 'percent' as const,
};

describe('Integrated Charts rendering', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, CellSelectionModule, IntegratedChartsModule.with(AgChartsEnterpriseModule)],
    });

    beforeAll(() => {
        setupAgTestIds();
        canvasPolyfill.init();
    });
    afterAll(() => canvasPolyfill.reset());
    afterEach(() => gridsManager.reset());

    test('renders a grouped column chart', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'country' }, { field: 'gold' }],
            rowData: [
                { country: 'Russia', gold: 3 },
                { country: 'USA', gold: 4 },
                { country: 'Japan', gold: 2 },
            ],
        });

        const chartRef = api.createRangeChart({
            cellRange: { columns: ['country', 'gold'] },
            chartType: 'groupedColumn',
        });

        const buffer = await renderChartToBuffer(chartRef!);
        expect(buffer).toMatchImageSnapshot(IMAGE_SNAPSHOT_OPTIONS);
    });
});
