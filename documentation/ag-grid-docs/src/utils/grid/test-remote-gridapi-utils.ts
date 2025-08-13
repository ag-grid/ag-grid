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
            const getGridApi = agGrid.getGridApi;
            const api = getGridApi(gridSelector);
            if (api && typeof api[methodName] === 'function') {
                return api[methodName](...args);
            } else if (!agGrid) {
                throw new Error(`window.gridApi missing`);
            } else if (!getGridApi) {
                throw new Error(`grid.getGridApi missing`);
            } else if (!api) {
                throw new Error(`getGridApi('${gridSelector}') returned null`);
            } else {
                throw new Error(`Method ${methodName} not a function on gridApi: ${typeof api[methodName]}`);
            }
        },
        [gridSelector, methodName, ...args]
    );
}

type AsyncGridApi = {
    [K in keyof GridApi]: GridApi[K] extends (...args: infer P) => infer R ? (...args: P) => Promise<R> : never;
};
