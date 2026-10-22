import { waitFor } from '@testing-library/dom';
import { cleanup, render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { clipboardUtils } from 'ag-test-utils';
import React, { StrictMode } from 'react';

import type { GridApi, ProcessDataFromClipboardParams } from 'ag-grid-community';
import { ClientSideRowModelApiModule, ClientSideRowModelModule, ModuleRegistry } from 'ag-grid-community';
import { ClipboardModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

describe('Clipboard Paste Behaviour: empty grid (React)', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule, ClientSideRowModelApiModule, ClipboardModule]);
    });

    afterEach(() => {
        cleanup();
        clipboardUtils.reset();
    });

    test('clicking the empty viewport and pressing Ctrl+V lets processDataFromClipboard add the rows', async () => {
        let api: GridApi | undefined;
        const processDataFromClipboard = ({ data }: ProcessDataFromClipboardParams) => {
            api!.applyTransaction({ add: data.map(([athlete]) => ({ athlete })) });
            return null;
        };
        const { container } = render(
            <StrictMode>
                <AgGridReact
                    columnDefs={[{ field: 'athlete' }]}
                    rowData={[]}
                    processDataFromClipboard={processDataFromClipboard}
                    onGridReady={(e) => (api = e.api)}
                />
            </StrictMode>
        );
        const viewport = () => container.querySelector<HTMLElement>('.ag-grid-viewport')!;
        await waitFor(() => expect(viewport().getAttribute('tabindex')).toBe('-1'));

        const user = userEvent.setup({ skipHover: true });
        // userEvent.setup installs its own clipboard
        clipboardUtils.init();
        clipboardUtils.setText('Ann\nBob');
        await user.click(viewport());
        expect(document.activeElement).toBe(viewport());
        await user.keyboard('{Control>}v{/Control}');

        await waitFor(() =>
            expect(
                Array.from(container.querySelectorAll('.ag-cell[col-id="athlete"]'), (cell) => cell.textContent)
            ).toEqual(['Ann', 'Bob'])
        );
        expect(viewport().hasAttribute('tabindex')).toBe(false);
        await waitFor(() => expect(document.activeElement?.getAttribute('col-id')).toBe('athlete'));
    });
});
