import type { Page } from '@playwright/test';

export async function getBrowserCommunications(page: Page) {
    const consoleMsgs: { args: any[]; text: string; type: string }[] = [];
    page.on('console', async (msg) => {
        consoleMsgs.push({
            type: msg.type(),
            text: msg.text(),
            args: await Promise.all(msg.args().map((arg) => arg.jsonValue())),
        });
    });
    return {
        consoleMsgs,
        clear: () => {
            consoleMsgs.length = 0;
        },
    };
}

export const waitFor = async <T>(getter: () => T, page?: Page, smart = false) => {
    if (page) {
        await page.waitForFunction(getter);
        if (smart) {
            return page.evaluateHandle(getter);
        }
        return page.evaluate(getter);
    }
    return new Promise<T>((resolve, reject) => {
        const timeout = setTimeout(() => {
            clearInterval(interval);
            reject(new Error('waitFor timed out doing getter: ' + getter.toString()));
        }, 5000);
        const interval = setInterval(async () => {
            const res = await getter();
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
    await page.goto(url);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('load');
    await page.waitForLoadState('networkidle');
    return msgs;
};
