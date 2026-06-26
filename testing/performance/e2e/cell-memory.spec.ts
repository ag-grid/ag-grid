import type { Page } from '@playwright/test';
import { test } from '@playwright/test';

import { getCdnUrl } from '../benchmarking';
import type { Version } from '../benchmarking';
import {
    captureAllocationProfile,
    createCDPSession,
    doubleGC,
    enablePerformanceMetrics,
    formatBytes,
    getHeapUsage,
    getPerformanceMetrics,
} from '../cdp.utils';
import type { AllocationProfile } from '../cdp.utils';
import { gotoUrl, waitFor } from '../playwright.utils';

// Debug tool: memory footprint of the per-cell/per-row CellCtrl features (AG-15464).
// Scrolling a non-column-virtualised 100k-row grid churns row virtualisation, so cell
// controllers (and their feature state) are created/destroyed repeatedly — the path the
// feature->function conversions affect. We compare `staging` (≈ latest, the baseline) against
// `local` — the working-tree/PR build — so the delta isolates the code under test:
//   - run locally: the perf webServer serves your local build as `local`
//   - run via the `/benchmarks` PR comment: the workflow checks out + builds the PR as `local`
//
// Not a `*.cron.spec.ts`, so it does NOT run on the daily schedule — only locally or on demand via
// `/benchmarks` (alongside the timing benchmarks). It never throws: it records numbers as
// annotations (surfaced in CTRF under test.extra.annotations, and rendered into the PR comment by
// scripts/ci/gen-gh-comment.mjs) and logs a human-readable report. Intentionally NOT a gate.

const scrollPage = `/testing/performance/e2e/scroll-benchmark.html`;
const gridReadyCheck = () => document.querySelector('.ag-row') !== null;

const CONTROL: Version = 'staging';
const VARIANT: Version = 'local';

const SCROLL_BURSTS = 5;
const SCROLL_FROM = 100;
const SCROLL_TO = 500;
const SCROLL_STEP = 20;

interface VersionResult {
    version: Version;
    allocations: AllocationProfile;
    /** Heap retained after scroll + GC, relative to the pre-scroll baseline (leak indicator). */
    retainedBytes: number;
    scriptMs: number;
}

async function attachGridScripts(page: Page, version: Version): Promise<void> {
    await page.addScriptTag({ url: getCdnUrl('ag-grid-community', version), type: 'text/javascript' });
    await waitFor(() => typeof (globalThis as any).agGrid !== 'undefined', page, { timeout: 10_000 });
}

async function measureVersion(page: Page, version: Version): Promise<VersionResult> {
    const cdp = await createCDPSession(page);
    await enablePerformanceMetrics(cdp);

    await gotoUrl(page, scrollPage);
    await attachGridScripts(page, version);
    await page.getByText('Run grid').click({ force: true });
    await waitFor(gridReadyCheck, page);

    // warm-up scroll to JIT-compile the hot paths before measuring
    await page.evaluate(() => (window as any).scrollToRow(50));
    await page.waitForTimeout(200);
    await page.evaluate(() => (window as any).scrollToRow(0));
    await page.waitForTimeout(200);

    await doubleGC(cdp);
    const heapBefore = await getHeapUsage(cdp);
    const metricsBefore = await getPerformanceMetrics(cdp);

    const allocations = await captureAllocationProfile(cdp, async () => {
        for (let i = 0; i < SCROLL_BURSTS; i++) {
            await page.evaluate(() => (window as any).scrollToRow(0));
            await page.waitForTimeout(50);
            await page.evaluate(
                ([from, to, step]: [number, number, number]) => (window as any).scrollBurst(from, to, step),
                [SCROLL_FROM, SCROLL_TO, SCROLL_STEP] as [number, number, number]
            );
        }
    });

    // retained memory after a GC — a leak indicator distinct from transient allocation
    await doubleGC(cdp);
    const heapAfterGC = await getHeapUsage(cdp);
    const metricsAfter = await getPerformanceMetrics(cdp);

    await cdp.detach();

    const scriptMs = ((metricsAfter['ScriptDuration'] ?? 0) - (metricsBefore['ScriptDuration'] ?? 0)) * 1000;

    return {
        version,
        allocations,
        retainedBytes: heapAfterGC.usedSize - heapBefore.usedSize,
        scriptMs,
    };
}

function pctDelta(control: number, variant: number): number {
    return control !== 0 ? ((variant - control) / control) * 100 : 0;
}

test.describe('CellCtrl memory footprint (scroll churn)', () => {
    test.setTimeout(10 * 60_000);

    test(`scroll-churn memory — ${CONTROL} vs ${VARIANT}`, async ({ page }, testInfo) => {
        // Measured sequentially in one browser process. Each version is independently warmed up
        // and takes a post-GC baseline, but cross-run V8 state isn't fully isolated — acceptable
        // for an informational metric.
        const control = await measureVersion(page, CONTROL);
        const variant = await measureVersion(page, VARIANT);

        const allocControl = control.allocations.totalAllocatedBytes;
        const allocVariant = variant.allocations.totalAllocatedBytes;

        const summary = {
            scenario: 'scroll-churn (20 cols, 100k rows, 5 bursts)',
            control: {
                version: CONTROL,
                allocBytes: allocControl,
                retainedBytes: control.retainedBytes,
                scriptMs: control.scriptMs,
            },
            variant: {
                version: VARIANT,
                allocBytes: allocVariant,
                retainedBytes: variant.retainedBytes,
                scriptMs: variant.scriptMs,
            },
            allocDeltaPct: pctDelta(allocControl, allocVariant),
            // retained is a post-GC heap delta that can be ~0 or negative, so a percentage would
            // mislead (or invert sign) near a zero baseline — report the absolute byte delta instead
            retainedDeltaBytes: variant.retainedBytes - control.retainedBytes,
        };

        // Structured numbers → CTRF (test.extra.annotations). Informational; this test never fails.
        testInfo.annotations.push({ type: 'memory', description: JSON.stringify(summary) });

        // Human-readable → run logs / CTRF stdout.
        const lines = [
            '',
            'CellCtrl scroll-churn memory benchmark (informational)',
            `  scenario: ${summary.scenario}`,
            `  allocated/run   ${CONTROL}: ${formatBytes(allocControl)}   ${VARIANT}: ${formatBytes(allocVariant)}   Δ ${summary.allocDeltaPct.toFixed(1)}%`,
            `  retained (GC)   ${CONTROL}: ${formatBytes(control.retainedBytes)}   ${VARIANT}: ${formatBytes(variant.retainedBytes)}   Δ ${formatBytes(summary.retainedDeltaBytes)}`,
            `  scriptMs (noisy)${CONTROL}: ${control.scriptMs.toFixed(1)}ms   ${VARIANT}: ${variant.scriptMs.toFixed(1)}ms`,
            '',
        ];

        console.log(lines.join('\n'));
    });
});
