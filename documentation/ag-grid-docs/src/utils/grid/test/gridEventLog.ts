import type { Page } from 'playwright/test';

import type { AgPublicEventType } from 'ag-grid-community';

import type { TemplateEventKeys } from '../test-event-types';
import { gridApiHandle } from './gridApiHandle';

/** An event the grid fired, with the properties that were asked for. */
export type EventLogEntry<TEventType extends AgPublicEventType = AgPublicEventType> = [
    eventType: TEventType,
    eventData: Partial<Record<TemplateEventKeys<TEventType>, any>>,
];

export type EventLog = EventLogEntry[];

export interface GridEventLog {
    /** Records `eventType` from now on, keeping only `keys` of each event. */
    record<TEventType extends AgPublicEventType>(
        eventType: TEventType,
        keys: Array<TemplateEventKeys<TEventType>>
    ): Promise<void>;
    /**
     * Lets code in the page add its own entries, in order with the grid's, through `window[name](type, data)`,
     * e.g. a test component reporting which of its methods the grid called.
     */
    exposeToPage(name: string): Promise<void>;
    /** The entries recorded so far, in the order they happened. */
    entries(): Promise<EventLog>;
}

/**
 * Records grid events in the page. Poll `entries()` to wait for an event:
 * `await expect.poll(() => log.entries()).toEqual([...])`.
 *
 * Listens through the event's `on<Event>` grid option, as docs examples do not register `EventApiModule`,
 * so it replaces any handler the example sets for a recorded event.
 */
export async function gridEventLog(page: Page, grid: string = '1'): Promise<GridEventLog> {
    const api = await gridApiHandle(page, grid);
    const log = await page.evaluateHandle(() => [] as EventLog);

    return {
        record: async (eventType, keys) => {
            await api.evaluate(
                (api, { log, eventType, keys }) => {
                    const callbackKey = `on${eventType.charAt(0).toUpperCase()}${eventType.slice(1)}`;
                    api.updateGridOptions({
                        [callbackKey]: (event: Record<string, unknown>) => {
                            log.push([eventType, Object.fromEntries(keys.map((key) => [key, event[key]]))]);
                        },
                    });
                },
                { log, eventType, keys: keys as string[] }
            );
        },
        exposeToPage: async (name) => {
            await log.evaluate((log, name) => {
                Reflect.set(window, name, (eventType: AgPublicEventType, eventData: Record<string, unknown>) => {
                    log.push([eventType, eventData]);
                });
            }, name);
        },
        entries: () => log.jsonValue(),
    };
}
