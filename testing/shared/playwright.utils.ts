import type { Page } from '@playwright/test';

type ConsoleMessage = {
    type: string;
    text: string;
    args: any[];
};
type BrowserCommunications = {
    consoleMsgs: ConsoleMessage[];
    clear: () => void;
};

export async function getBrowserCommunications(page: Page): Promise<BrowserCommunications> {
    const consoleMsgs: ConsoleMessage[] = [];
    page.on('console', (msg) => {
        consoleMsgs.push({
            type: msg.type(),
            text: msg.text(),
            args: msg.args().map((arg) => arg.jsonValue),
        });
    });
    return {
        consoleMsgs,
        clear: () => {
            consoleMsgs.length = 0;
        },
    };
}

export const waitFor = async <T, A extends string[]>(
    getterOrTimeout: ((...args: A) => T) | number,
    page?: Page,
    options: { smart?: boolean; timer?: number; args: A } = { smart: false, timer: 5000, args: [] as A }
): Promise<T> => {
    if (typeof getterOrTimeout === 'number') {
        return new Promise((resolve) => setTimeout(resolve, getterOrTimeout));
    }
    const { smart, timer } = options;
    if (page) {
        await page.waitForFunction(getterOrTimeout as any, options.args);
        if (smart) {
            return page.evaluateHandle(getterOrTimeout as any, options.args) as Promise<T>;
        }
        return page.evaluate(getterOrTimeout as any, options.args);
    }
    return new Promise<T>((resolve, reject) => {
        const timeout = setTimeout(() => {
            clearInterval(interval);
            reject(new Error('waitFor timed out doing getter: ' + getterOrTimeout.toString()));
        }, timer);
        const interval = setInterval(async () => {
            const res = await getterOrTimeout(...options.args);
            if (res) {
                clearInterval(interval);
                resolve(res);
                clearTimeout(timeout);
            }
        }, 20);
    });
};

export const gotoUrl = async (page: Page, url: string) => {
    const msgs = await getBrowserCommunications(page);
    await page.goto(url, { waitUntil: 'networkidle' });
    return msgs;
};

export const computeStats = (times: number[]) => {
    const sorted = times.slice().sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length / 4)];
    const q3 = sorted[Math.floor((sorted.length * 3) / 4)];
    const iqr = q3 - q1;
    const lower = q1 - 1.5 * iqr;
    const upper = q3 + 1.5 * iqr;
    const filtered = sorted.filter((t) => t >= lower && t <= upper);
    const avg = filtered.reduce((sum, v) => sum + v, 0) / filtered.length;
    const stdDev = Math.sqrt(filtered.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / filtered.length);
    const marginOfError = (1.96 * stdDev) / Math.sqrt(filtered.length);
    return {
        average: Math.round(avg),
        stdDev: Math.round(stdDev),
        marginOfError: Math.round(marginOfError),
        filteredCount: filtered.length,
        originalCount: times.length,
    };
};

export function reportStats(stats: { [k in string]: ReturnType<typeof computeStats> }) {
    const [control, variant] = Object.keys(stats);
    const s1 = stats[control];
    const s2 = stats[variant];

    const diff = s1.average - s2.average;
    const slower = diff > 0 ? control : variant;
    const faster = diff < 0 ? variant : control;
    const percentDiff = (Math.abs(diff) / Math.min(s1.average, s2.average)) * 100;

    const moe1Percent = (s1.marginOfError / s1.average) * 100;
    const moe2Percent = (s2.marginOfError / s2.average) * 100;
    const avgMoEPercent = ((moe1Percent + moe2Percent) / 2).toFixed(2);

    if (diff === 0) {
        console.log(`Both versions are equal: ${control} and ${variant}`);
    } else {
        console.log(`${slower} is slower than ${faster} by ${percentDiff.toFixed(1)}% ± ${avgMoEPercent}%`);
    }
    console.log(
        `${control} → avg: ${s1.average.toFixed(2)}ms (±${moe1Percent.toFixed(2)}%), stdDev: ${s1.stdDev.toFixed(2)}, count: ${s1.filteredCount}/${s1.originalCount}`
    );
    console.log(
        `${variant} → avg: ${s2.average.toFixed(2)}ms (±${moe2Percent.toFixed(2)}%), stdDev: ${s2.stdDev.toFixed(2)}, count: ${s2.filteredCount}/${s2.originalCount}`
    );
}

export function calculateTotalBlockingTime(page: Page, timeout = 5000): Promise<number> {
    return page.evaluate(() => {
        return new Promise<number>((resolve) => {
            let totalBlockingTime = 0;
            const po = new PerformanceObserver((list) => {
                const perfEntries = list.getEntries();
                for (const perfEntry of perfEntries) {
                    totalBlockingTime += perfEntry.duration - 50;
                }
                resolve(totalBlockingTime);
                po.disconnect();
            });
            po.observe({ type: 'longtask', buffered: true });

            // Resolve promise if there haven't been long tasks
            setTimeout(() => resolve(totalBlockingTime), timeout);
        });
    }, 0);
}

