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

export const waitFor = async <T>(getterOrTimeout: (() => T) | number, page?: Page, smart = false) => {
    if (typeof getterOrTimeout === 'number') {
        return new Promise<void>((resolve) => setTimeout(resolve, getterOrTimeout));
    }

    if (page) {
        await page.waitForFunction(getterOrTimeout);
        if (smart) {
            return page.evaluateHandle(getterOrTimeout);
        }
        return page.evaluate(getterOrTimeout);
    }
    return new Promise<T>((resolve, reject) => {
        const timeout = setTimeout(() => {
            clearInterval(interval);
            reject(new Error('waitFor timed out doing getter: ' + getterOrTimeout.toString()));
        }, 5000);
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
