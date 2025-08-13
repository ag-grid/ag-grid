import type { Page } from 'playwright/test';

import type { GridApi } from 'ag-grid-community';

export const remoteGrid = (page: Page, gridSelector: string = '#myGrid'): AsyncGridApi => {
    return new Proxy(
        {},
        {
            get: (_, prop) => {
                return (...args: unknown[]) => {
                    return remoteGridApi(
                        page,
                        gridSelector,
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
    gridSelector: string = '#myGrid',
    methodName: T,
    ...args: Parameters<GridApi[T]>
): Promise<ReturnType<GridApi[T]> | null> {
    return page.evaluate(
        ([gridSelector, methodName, ...args]: any[]) => {
            const agGrid = (window as any).agGrid;

            if (!agGrid) {
                throw new Error(`window.agGrid missing`);
            }

            const getGridApi = agGrid.getGridApi;

            if (!getGridApi) {
                throw new Error(`grid.getGridApi missing`);
            }

            const api = getGridApi(gridSelector);

            if (!api) {
                throw new Error(`getGridApi('${gridSelector}') returned null`);
            }

            if (typeof api[methodName] !== 'function') {
                throw new Error(`Method ${methodName} not a function on gridApi: ${typeof api[methodName]}`);
            }

            return api[methodName](...args);
        },
        [gridSelector, methodName, ...args]
    );
}

type AsyncGridApi = {
    [K in keyof GridApi]: GridApi[K] extends (...args: infer P) => infer R ? (...args: P) => Promise<R> : never;
};
