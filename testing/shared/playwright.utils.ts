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

export const waitFor = async <T, A extends (string | boolean | number)[]>(
    getterOrTimeout: ((...args: A) => T) | number,
    page?: Page,
    options: { smart?: boolean; timer?: number; args: A } = { smart: false, timer: 5000, args: [] as A }
): Promise<T> => {
    if (typeof getterOrTimeout === 'number') {
        return new Promise((resolve) => setTimeout(resolve, getterOrTimeout));
    }
    const { smart, timer } = options;
    if (page) {
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
