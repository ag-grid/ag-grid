import { getByTestId, waitFor } from '@testing-library/dom';
import { TestGridsManager, assertSelectedCellRanges, initPointerEventPolyfill } from 'ag-test-utils';

import type { GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, agTestIdFor, setupAgTestIds } from 'ag-grid-community';
import { CellSelectionModule } from 'ag-grid-enterprise';

describe('cell drag selection inside Shadow DOM', () => {
    const gridMgr = new TestGridsManager({ modules: [ClientSideRowModelModule, CellSelectionModule] });

    beforeAll(() => {
        initPointerEventPolyfill();
        setupAgTestIds();
    });

    test.each([
        ['mouse, cellSelection: true', true, 'mouse'],
        ['pointer, cellSelection: true', true, 'pointer'],
        ['mouse, range handle enabled', { handle: { mode: 'range' as const } }, 'mouse'],
        ['pointer, range handle enabled', { handle: { mode: 'range' as const } }, 'pointer'],
    ] as const)('selects a range with one %s drag', async (_name, cellSelection, eventType) => {
        const host = document.createElement('div');
        document.body.appendChild(host);
        const shadowRoot = host.attachShadow({ mode: 'open' });
        const gridDiv = document.createElement('div');
        shadowRoot.appendChild(gridDiv);

        try {
            const api = gridMgr.createGrid(gridDiv, {
                columnDefs: [{ field: 'athlete' }, { field: 'age' }, { field: 'country' }],
                rowData: [
                    { athlete: 'A', age: 20, country: 'UK' },
                    { athlete: 'B', age: 21, country: 'US' },
                    { athlete: 'C', age: 22, country: 'FR' },
                ],
                getRowId: (params) => params.data.athlete,
                cellSelection: cellSelection as GridOptions['cellSelection'],
            });

            const startCell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('A', 'athlete')));
            const endCell = getByTestId(gridDiv, agTestIdFor.cell('C', 'country'));

            const EventConstructor = eventType === 'pointer' ? PointerEvent : MouseEvent;
            const downInit: PointerEventInit = {
                bubbles: true,
                composed: true,
                button: 0,
                buttons: 1,
                clientX: 10,
                pointerId: 1,
                pointerType: 'mouse',
                isPrimary: true,
            };
            const down = new EventConstructor(`${eventType}down`, downInit);
            startCell.dispatchEvent(down);

            // Browsers retarget the saved down event to the host after it leaves the shadow root.
            Object.defineProperty(down, 'target', { configurable: true, value: host });

            // The first move starts the drag; the next move extends the selection.
            endCell.dispatchEvent(new EventConstructor(`${eventType}move`, { ...downInit, clientX: 30 }));
            endCell.dispatchEvent(new EventConstructor(`${eventType}move`, { ...downInit, clientX: 31 }));
            endCell.dispatchEvent(new EventConstructor(`${eventType}up`, { ...downInit, clientX: 31, buttons: 0 }));

            assertSelectedCellRanges(
                [{ rowStartIndex: 0, rowEndIndex: 2, columns: ['athlete', 'age', 'country'] }],
                api
            );
        } finally {
            gridMgr.reset();
            host.remove();
        }
    });
});
