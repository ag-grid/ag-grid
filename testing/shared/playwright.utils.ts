import type { Page } from '@playwright/test';

export async function getBrowserCommunications(page: Page) {
    const consoleMsgs: { args: any[]; text: string; type: string }[] = [];
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

export const waitFor = async <T>(
    getterOrTimeout: (() => T) | number,
    page?: Page,
    options = { smart: false, timer: 5000 }
): Promise<T> => {
    if (typeof getterOrTimeout === 'number') {
        return new Promise((resolve) => setTimeout(resolve, getterOrTimeout));
    }
    const { smart, timer } = options;
    if (page) {
        await page.waitForFunction(getterOrTimeout);
        if (smart) {
            return page.evaluateHandle(getterOrTimeout) as Promise<T>;
        }
        return page.evaluate(getterOrTimeout);
    }
    return new Promise<T>((resolve, reject) => {
        const timeout = setTimeout(() => {
            clearInterval(interval);
            reject(new Error('waitFor timed out doing getter: ' + getterOrTimeout.toString()));
        }, timer);
        const interval = setInterval(async () => {
            const res = await getterOrTimeout();
            if (res) {
                clearInterval(interval);
                resolve(res);
                clearTimeout(timeout);
            }
        }, 20);
    });
};

export const gotoAndGetComms = async (page: Page, url: string) => {
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
