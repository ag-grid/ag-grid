import type { Page } from '@playwright/test';

type ConsoleMessage = {
    type: string;
    text: string;
    args: Promise<any[]>;
};

type RequestFinishedMessage = {
    url: string;
    method: string;
    headers: { [p: string]: string };
    postData: string | null;
    response: {
        status: number;
        statusText: string;
        headers: { [p: string]: string };
    };
};

export type BrowserCommunications = {
    consoleMsgs: ConsoleMessage[];
    requestMsgs: RequestFinishedMessage[];
    clear: () => void;
};

export function getBrowserCommunications(page: Page): BrowserCommunications {
    const consoleMsgs: ConsoleMessage[] = [];
    const requestMsgs: RequestFinishedMessage[] = [];
    page.on('console', (msg) => {
        consoleMsgs.push({
            type: msg.type(),
            text: msg.text(),
            args: Promise.all(msg.args().map((arg) => arg.jsonValue())),
        });
    });
    page.on('response', (response) => {
        requestMsgs.push({
            url: response.request().url(),
            method: response.request().method(),
            headers: response.request().headers(),
            postData: response.request().postData(),
            response: { status: response.status(), statusText: response.statusText(), headers: response.headers() },
        });
    });
    return {
        consoleMsgs,
        requestMsgs,
        clear: () => {
            consoleMsgs.length = 0;
        },
    };
}

export const waitForMs = async (timeout: number): Promise<void> => {
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
        setTimeout(() => handle.dispose(), timeout ?? 5000 + 1000);
        if (options.smart) {
            return handle as T; // todo this type assertion is a workaround, ideally we should handle the type more gracefully
        } else {
            return handle.jsonValue();
        }
    }
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            clearInterval(interval);
            if (options.allowFailure) {
                console.log(`waitFor timed out doing: ${getterOrTimeout.toString()}, but was allowed to resolve`);
                return resolve(undefined as T);
            }
            return reject(new Error(`waitFor timed out doing: ${getterOrTimeout.toString()}`));
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
    const msgs = getBrowserCommunications(page);
    await page.goto(url, { waitUntil: 'networkidle' });
    return msgs;
};
