import { waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';
import { afterEach, describe, expect, test } from 'vitest';

import { ClientSideRowModelModule, EventApiModule, _GET_ALL_EVENTS, _PUBLIC_EVENTS } from 'ag-grid-community';

const PUBLIC_EVENTS = new Set<string>(_PUBLIC_EVENTS);
const INTERNAL_EVENTS = new Set<string>(_GET_ALL_EVENTS().filter((type) => !PUBLIC_EVENTS.has(type)));

interface ReceivedEvent {
    type: string;
    api: unknown;
    context: unknown;
    hasCommon: boolean;
}

describe('global events', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule, EventApiModule] });

    afterEach(() => {
        gridsManager.reset();
    });

    test('carry api and context when public, and neither when internal', async () => {
        const context = { app: 'test' };
        const api = gridsManager.createGrid('myGrid', { columnDefs: [{ field: 'a' }], rowData: [], context });
        const received: ReceivedEvent[] = [];
        api.addGlobalListener((type, event: any) => {
            received.push({
                type,
                api: event.api,
                context: event.context,
                hasCommon: 'api' in event || 'context' in event,
            });
        });

        api.setGridOption('rowData', [{ a: 1 }, { a: 2 }]);

        const ofKind = (kind: Set<string>) => received.filter(({ type }) => kind.has(type));
        await waitFor(() => {
            expect(ofKind(PUBLIC_EVENTS)).not.toEqual([]);
            expect(ofKind(INTERNAL_EVENTS)).not.toEqual([]);
        });
        expect(ofKind(PUBLIC_EVENTS).filter((event) => event.api !== api || event.context !== context)).toEqual([]);
        expect(ofKind(INTERNAL_EVENTS).filter((event) => event.hasCommon)).toEqual([]);
    });
});
