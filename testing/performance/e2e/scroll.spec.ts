import test from '../benchmarking';
import { waitFor } from '../playwright.utils';

const scrollPage = `/testing/performance/e2e/scroll-benchmark.html`;
const gridReadyCheck = () => document.querySelector('.ag-row') !== null;

test(`Performance Test - Compare scroll performance`, {
    timeout: 40 * 60_000,
    minIterations: 50,
    maxIterations: 150,
    warmupIterations: 3,
    testCases: [
        {
            name: 'Scroll (20 cols, 100k rows): staging vs local',
            framework: 'typescript',
            control: { version: 'staging', url: scrollPage, shouldInjectScript: true },
            variant: { version: 'local', url: scrollPage, shouldInjectScript: true },
            preSetup: async (page) => {
                await page.getByText('Run grid').click({ force: true });
                await waitFor(gridReadyCheck, page);
                // Warm-up scroll to JIT-compile hot paths
                await page.evaluate(() => (window as any).scrollToRow(50));
                await page.waitForTimeout(200);
                await page.evaluate(() => (window as any).scrollToRow(0));
                await page.waitForTimeout(200);
            },
            setupPreActions: async (page) => {
                await page.evaluate(() => {
                    (window as any).scrollToRow(0);
                    performance.clearMarks();
                    performance.clearMeasures();
                });
                await page.waitForTimeout(100);
            },
            actions: async (page) => {
                await page.evaluate(() => (window as any).scrollBurst(100, 500, 20));
                await waitFor(() => performance.getEntriesByName('scroll-burst'), page);
            },
            metrics: 'scroll-burst',
        },
    ],
});
