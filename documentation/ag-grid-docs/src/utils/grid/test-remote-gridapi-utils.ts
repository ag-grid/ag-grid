import type { Page } from 'playwright/test';

import type { GridApi } from 'ag-grid-community';

export const remoteGrid = (page: Page, gridId: string = '1'): AsyncGridApi => {
    let gridReadyPromise: Promise<void> | null = null;

    const ensureGridReady = async () => {
        if (!gridReadyPromise) {
            // Wait for grid to be visible
            const selector = `[grid-id="${gridId}"]`;
            gridReadyPromise = page.locator(selector).waitFor({ state: 'visible' });
        }
        await gridReadyPromise;
    };

    return new Proxy(
        {},
        {
            get: (_, prop) => {
                return async (...args: unknown[]) => {
                    await ensureGridReady();
                    return remoteGridApi(
                        page,
                        gridId,
                        prop as keyof GridApi,
                        ...(args as Parameters<GridApi[keyof GridApi]>)
                    );
                };
            },
        }
    ) as AsyncGridApi;
};

async function remoteGridApi<T extends keyof GridApi>(
    page: Page,
    gridId: string = '1',
    methodName: T,
    ...args: Parameters<GridApi[T]>
): Promise<ReturnType<GridApi[T]> | null> {
    return page.evaluate(
        ([gridId, methodName, ...args]: any[]) => {
            const getGridApi = (window as any).getGridApi;

            if (!getGridApi) {
                throw new Error(`window.getGridApi missing`);
            }

            const api = getGridApi(gridId);

            if (!api) {
                throw new Error(`getGridApi('${gridId}') returned null`);
            }

            if (typeof api[methodName] !== 'function') {
                throw new Error(`Method ${methodName} not a function on gridApi: ${typeof api[methodName]}`);
            }

            return api[methodName](...args);
        },
        [gridId, methodName, ...args]
    );
}

type AsyncGridApi = {
    [K in keyof GridApi]: GridApi[K] extends (...args: infer P) => infer R ? (...args: P) => Promise<R> : never;
};
