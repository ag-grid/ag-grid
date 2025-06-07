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
            args: msg.args().map((arg) => arg.jsonValue()),
        });
    });
    return {
        consoleMsgs,
        clear: () => {
            consoleMsgs.length = 0;
        },
    };
}

export const waitForTimeout = async (timeout: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, timeout));
};

export const waitFor = async <T>(
    getterOrTimeout: (...args: any[]) => T,
    page?: Page,
    options: {
        timeout?: number;
        args?: Parameters<typeof getterOrTimeout>;
        allowFailure?: boolean;
        smart?: boolean;
    } = {
        timeout: 5000,
        args: [],
        allowFailure: false,
        smart: false,
    }
): Promise<T> => {
    const { timeout } = options;
    if (page) {
        const handle = await page.waitForFunction(getterOrTimeout, options.args ?? [], { timeout: timeout ?? 5000 });
        if (options.smart) {
            return handle as T; // todo this type assertion is a workaround, ideally we should handle the type more gracefully
        } else {
            return handle.jsonValue();
        }
    }
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            clearInterval(interval);
            (options.allowFailure ? resolve : reject)(
                new Error('waitFor timed out doing: ' + getterOrTimeout.toString())
            );
        }, timeout ?? 5000);
        const interval = setInterval(async () => {
            const res = await getterOrTimeout(...(options.args ?? []));
            if (res) {
                clearInterval(interval);
                resolve(res);
                clearTimeout(timer);
            }
        }, 20);
    });
};

export const gotoUrl = async (page: Page, url: string) => {
    const msgs = await getBrowserCommunications(page);
    await page.goto(url, { waitUntil: 'networkidle' });
    return msgs;
};
