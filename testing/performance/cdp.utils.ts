import type { CDPSession, Page } from '@playwright/test';

export interface HeapUsage {
    usedSize: number;
    totalSize: number;
}

export interface AllocationProfile {
    /** Total bytes allocated (sampled) during the profiled action */
    totalAllocatedBytes: number;
}

export interface PerformanceCounters {
    [name: string]: number;
}

interface AllocationNode {
    selfSize: number;
    children?: AllocationNode[];
}

/**
 * Create a Chrome DevTools Protocol session for low-level browser instrumentation.
 */
export async function createCDPSession(page: Page): Promise<CDPSession> {
    return page.context().newCDPSession(page);
}

/**
 * Get precise V8 heap usage via Runtime.getHeapUsage.
 */
export async function getHeapUsage(cdp: CDPSession): Promise<HeapUsage> {
    const result = await cdp.send('Runtime.getHeapUsage');
    return {
        usedSize: result.usedSize,
        totalSize: result.totalSize,
    };
}

/**
 * Force a garbage collection cycle via HeapProfiler.collectGarbage.
 */
export async function forceGC(cdp: CDPSession): Promise<void> {
    await cdp.send('HeapProfiler.collectGarbage');
}

/**
 * Double-GC: two collection cycles to ensure weak references and
 * weak collections are fully cleaned up.
 */
export async function doubleGC(cdp: CDPSession): Promise<void> {
    await forceGC(cdp);
    await forceGC(cdp);
}

/**
 * Enable V8 performance counter collection.
 */
export async function enablePerformanceMetrics(cdp: CDPSession): Promise<void> {
    await cdp.send('Performance.enable', { timeDomain: 'timeTicks' });
}

/**
 * Get V8 performance counters (JSHeapUsedSize, ScriptDuration, etc.)
 * as a flat key→value map.
 */
export async function getPerformanceMetrics(cdp: CDPSession): Promise<PerformanceCounters> {
    const { metrics } = await cdp.send('Performance.getMetrics');
    const result: PerformanceCounters = {};
    for (let i = 0, len = metrics.length; i < len; i++) {
        result[metrics[i].name] = metrics[i].value;
    }
    return result;
}

/**
 * Run an action while capturing a heap allocation sampling profile.
 * Returns the total bytes allocated (sampled at the given interval).
 */
export async function captureAllocationProfile(
    cdp: CDPSession,
    action: () => Promise<void>,
    samplingInterval: number = 256
): Promise<AllocationProfile> {
    await cdp.send('HeapProfiler.startSampling', { samplingInterval });

    let head: AllocationNode | undefined;
    try {
        await action();
    } finally {
        // always stop the sampler, even if the action throws or times out — otherwise it
        // stays enabled and contaminates later measurements
        const { profile } = await cdp.send('HeapProfiler.stopSampling');
        head = profile.head;
    }

    // Walk the allocation profile tree and sum selfSize at every node
    let totalAllocatedBytes = 0;
    function walkNodes(node: AllocationNode): void {
        totalAllocatedBytes += node.selfSize || 0;
        const children = node.children ?? [];
        for (let i = 0, len = children.length; i < len; i++) {
            walkNodes(children[i]);
        }
    }
    if (head) {
        walkNodes(head);
    }

    return { totalAllocatedBytes };
}

/**
 * Format bytes into a human-readable string.
 */
export function formatBytes(bytes: number): string {
    if (Math.abs(bytes) < 1024) {
        return `${bytes} B`;
    }
    const units = ['KB', 'MB', 'GB'];
    let value = bytes;
    let unitIndex = -1;
    do {
        value /= 1024;
        unitIndex++;
    } while (Math.abs(value) >= 1024 && unitIndex < units.length - 1);
    return `${value.toFixed(1)} ${units[unitIndex]}`;
}
