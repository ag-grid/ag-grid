import { type Page, test } from '@playwright/test';
import chalk from 'chalk';

import { type Version, getCdnUrl } from '../benchmarking';
import {
    type AllocationProfile,
    type HeapUsage,
    type PerformanceCounters,
    captureAllocationProfile,
    createCDPSession,
    doubleGC,
    enablePerformanceMetrics,
    formatBytes,
    getHeapUsage,
    getPerformanceMetrics,
} from '../cdp.utils';
import { gotoUrl, waitFor } from '../playwright.utils';

chalk.level = process.env['CI'] ? 0 : 3;
const { green, red, cyan, yellow, bold } = chalk;

const scrollPage = `/testing/performance/e2e/scroll-benchmark.html`;
const gridReadyCheck = () => document.querySelector('.ag-row') !== null;

const SCROLL_BURSTS = 5;
const SCROLL_FROM = 100;
const SCROLL_TO = 500;
const SCROLL_STEP = 20;

interface VersionResult {
    version: string;
    heapBefore: HeapUsage;
    heapAfter: HeapUsage;
    heapAfterGC: HeapUsage;
    allocations: AllocationProfile;
    metricsBefore: PerformanceCounters;
    metricsAfter: PerformanceCounters;
}

async function attachGridScripts(page: Page, version: Version) {
    const urls = [getCdnUrl('ag-grid-community', version), getCdnUrl('ag-grid-enterprise', version)];
    for (const url of urls) {
        await page.addScriptTag({ url, type: 'text/javascript' });
    }
    await waitFor(() => typeof (globalThis as any).agGrid !== 'undefined', page, { timeout: 10_000 });
}

async function measureVersion(page: Page, version: Version): Promise<VersionResult> {
    const cdp = await createCDPSession(page);
    await enablePerformanceMetrics(cdp);

    // Navigate and set up grid
    await gotoUrl(page, scrollPage);
    await attachGridScripts(page, version);
    await page.getByText('Run grid').click({ force: true });
    await waitFor(gridReadyCheck, page);

    // Warm-up scroll to JIT-compile hot paths
    await page.evaluate(() => (window as any).scrollToRow(50));
    await page.waitForTimeout(200);
    await page.evaluate(() => (window as any).scrollToRow(0));
    await page.waitForTimeout(200);

    // Force GC and take baseline
    await doubleGC(cdp);
    const heapBefore = await getHeapUsage(cdp);
    const metricsBefore = await getPerformanceMetrics(cdp);

    // Measure allocations during repeated scroll bursts
    const allocations = await captureAllocationProfile(cdp, async () => {
        for (let burst = 0; burst < SCROLL_BURSTS; burst++) {
            await page.evaluate(() => (window as any).scrollToRow(0));
            await page.waitForTimeout(50);
            await page.evaluate(
                ([from, to, step]: [number, number, number]) => (window as any).scrollBurst(from, to, step),
                [SCROLL_FROM, SCROLL_TO, SCROLL_STEP] as [number, number, number]
            );
        }
    });

    // Measure heap immediately after scrolls
    const heapAfter = await getHeapUsage(cdp);

    // Force GC and measure retained memory
    await doubleGC(cdp);
    const heapAfterGC = await getHeapUsage(cdp);
    const metricsAfter = await getPerformanceMetrics(cdp);

    await cdp.detach();

    return { version, heapBefore, heapAfter, heapAfterGC, allocations, metricsBefore, metricsAfter };
}

function reportResults(control: VersionResult, variant: VersionResult) {
    const divider = '-'.repeat(70);

    console.log(`\n${divider}`);
    console.log(bold('Scroll GC/Memory Benchmark Results'));
    console.log(`${divider}\n`);

    // Allocation comparison
    const controlAlloc = control.allocations.totalAllocatedBytes;
    const variantAlloc = variant.allocations.totalAllocatedBytes;
    const allocDiffPct = ((variantAlloc - controlAlloc) / controlAlloc) * 100;

    console.log(bold('Allocations during scroll:'));
    console.log(`  Control (${control.version}): ${formatBytes(controlAlloc)}`);
    console.log(`  Variant (${variant.version}): ${formatBytes(variantAlloc)}`);
    console.log(
        `  Difference: ${allocDiffPct > 0 ? red(`+${allocDiffPct.toFixed(1)}%`) : green(`${allocDiffPct.toFixed(1)}%`)}`
    );

    // Heap delta (transient pressure)
    const controlHeapDelta = control.heapAfter.usedSize - control.heapBefore.usedSize;
    const variantHeapDelta = variant.heapAfter.usedSize - variant.heapBefore.usedSize;
    const heapDeltaDiffPct =
        controlHeapDelta !== 0 ? ((variantHeapDelta - controlHeapDelta) / Math.abs(controlHeapDelta)) * 100 : 0;

    console.log(bold('\nHeap delta (transient pressure, before GC):'));
    console.log(`  Control (${control.version}): ${formatBytes(controlHeapDelta)}`);
    console.log(`  Variant (${variant.version}): ${formatBytes(variantHeapDelta)}`);
    console.log(
        `  Difference: ${heapDeltaDiffPct > 0 ? red(`+${heapDeltaDiffPct.toFixed(1)}%`) : green(`${heapDeltaDiffPct.toFixed(1)}%`)}`
    );

    // Retained memory (post-GC)
    const controlRetained = control.heapAfterGC.usedSize - control.heapBefore.usedSize;
    const variantRetained = variant.heapAfterGC.usedSize - variant.heapBefore.usedSize;

    console.log(bold('\nRetained memory (post-GC, leak indicator):'));
    console.log(`  Control (${control.version}): ${formatBytes(controlRetained)}`);
    console.log(`  Variant (${variant.version}): ${formatBytes(variantRetained)}`);

    // V8 ScriptDuration
    const controlScript =
        (control.metricsAfter['ScriptDuration'] ?? 0) - (control.metricsBefore['ScriptDuration'] ?? 0);
    const variantScript =
        (variant.metricsAfter['ScriptDuration'] ?? 0) - (variant.metricsBefore['ScriptDuration'] ?? 0);
    const scriptDiffPct = controlScript !== 0 ? ((variantScript - controlScript) / controlScript) * 100 : 0;

    console.log(bold('\nV8 ScriptDuration during scroll:'));
    console.log(`  Control (${control.version}): ${(controlScript * 1000).toFixed(1)}ms`);
    console.log(`  Variant (${variant.version}): ${(variantScript * 1000).toFixed(1)}ms`);
    console.log(
        `  Difference: ${scriptDiffPct > 0 ? red(`+${scriptDiffPct.toFixed(1)}%`) : green(`${scriptDiffPct.toFixed(1)}%`)}`
    );

    console.log(`\n${divider}\n`);

    // Summary
    if (allocDiffPct < -5) {
        console.log(green(`Variant allocates ${Math.abs(allocDiffPct).toFixed(1)}% fewer bytes during scroll.`));
    } else if (allocDiffPct > 5) {
        console.log(yellow(`Variant allocates ${allocDiffPct.toFixed(1)}% more bytes during scroll.`));
    } else {
        console.log(cyan('Allocation difference is within 5% — no significant change.'));
    }
}

test.describe('Scroll GC/Memory Benchmark', () => {
    test.setTimeout(10 * 60_000);

    test('Compare memory pressure: staging vs local', async ({ page }) => {
        console.log('Measuring control (staging)...');
        const control = await measureVersion(page, 'staging');

        console.log('Measuring variant (local)...');
        const variant = await measureVersion(page, 'local');

        reportResults(control, variant);
    });
});
