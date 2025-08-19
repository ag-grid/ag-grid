import type { Page } from 'playwright/test';

import type { AgPublicEventType, GridApi } from 'ag-grid-community';

import type { TemplateEventKeys } from './test-event-types';

export const createRemoteGridApiProxy = (page: Page, gridId: string = '1', eventLog: any[]): AsyncGridApi => {
    let gridReadyPromise: Promise<void> | null = null;

    const ensureGridReady = async () => {
        if (!gridReadyPromise) {
            // Wait for grid to be visible
            const selector = `[grid-id="${gridId}"]`;
            gridReadyPromise = page.locator(selector).waitFor({ state: 'visible' });
        }
        await gridReadyPromise;
    };

    page.exposeFunction('logEvent', (listenerName: string, arg0: any, ...args: any[]) => {
        eventLog.push([listenerName, arg0, ...args]);
    });

    return new Proxy(
        {},
        {
            get: (_, prop) => {
                // Detect when someone tries to await the proxy itself
                // When await is used on an object, JavaScript looks for the 'then' property
                if (prop === 'then') {
                    throw new Error('Cannot await remoteGrid() directly. Use remoteGrid().methodName() instead.');
                }

                return async (...args: unknown[]) => {
                    await ensureGridReady();
                    return callRemoteGridApi(
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

async function callRemoteGridApi<T extends keyof GridApi>(
    page: Page,
    gridId: string,
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

            const logEvent = (window as any).logEvent;

            if (logEvent && methodName === 'logEvent') {
                const eventType = args[0] as AgPublicEventType;
                const eventValues = args[1] as string[]; // Remove the too-broad type assertion

                // capitalise first letter of eventType and prefix on
                const callbackKey = `on${eventType.charAt(0).toUpperCase() + eventType.slice(1)}`;

                api.updateGridOptions({
                    [callbackKey]: (event: any) => {
                        // Use any since we're in runtime context
                        logEvent(
                            eventType,
                            eventValues.map((key) => ({ [key]: event[key] })).reduce((a, b) => ({ ...a, ...b }), {})
                        );
                    },
                });
                return;
            }

            if (typeof api[methodName] !== 'function') {
                throw new Error(`Method '${methodName}' not a function on gridApi: ${typeof api[methodName]}`);
            }

            return api[methodName](...args);
        },
        [gridId, methodName, ...args]
    );
}

type GridApiPlus = GridApi & {
    // Use the template literal type discrimination approach
    logEvent<TEventType extends AgPublicEventType>(
        eventType: TEventType,
        eventValueKeys: Array<TemplateEventKeys<TEventType>>
    ): Promise<any>;
};

// Create AsyncGridApi with special handling for logEvent to preserve generics
export type AsyncGridApi = {
    [K in keyof GridApiPlus]: K extends 'logEvent'
        ? <TEventType extends AgPublicEventType>(
              eventType: TEventType,
              eventValueKeys: Array<TemplateEventKeys<TEventType>>
          ) => Promise<any>
        : GridApiPlus[K] extends (...args: infer P) => infer R
          ? (...args: P) => Promise<R>
          : never;
};
