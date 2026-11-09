import { getByTestId, waitFor, within } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import { TestGridsManager, waitForPopup } from 'ag-test-utils';

import { LargeTextEditorModule, agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';
import type { ColDef } from 'ag-grid-community';
import { RichSelectModule } from 'ag-grid-enterprise';

describe('Popup cell editor accessible name', () => {
    const gridMgr = new TestGridsManager({
        includeDefaultModules: true,
        modules: [LargeTextEditorModule, RichSelectModule],
    });

    beforeAll(() => setupAgTestIds());
    afterEach(() => gridMgr.reset());

    async function openPopupEditor(colDef: ColDef): Promise<HTMLElement> {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'athlete' },
                { editable: true, cellEditor: 'agLargeTextCellEditor', cellEditorPopup: true, ...colDef },
            ],
            rowData: [{ athlete: 'Aleksey Einar', notes: 'Qualified for the final' }],
        });
        const gridDiv = getGridElement(api)! as HTMLElement;
        const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', colDef.field!)));
        await userEvent.dblClick(cell);
        return waitForPopup(gridDiv);
    }

    test('names the large text editor dialog after the column being edited', async () => {
        const popup = await openPopupEditor({ field: 'notes' });

        expect(within(popup).getByRole('dialog', { name: 'Notes' })).toBeTruthy();
    });

    test('falls back to a generic name when the column has no header name', async () => {
        const popup = await openPopupEditor({ field: 'notes', headerName: '' });

        expect(within(popup).getByRole('dialog', { name: 'Cell Editor' })).toBeTruthy();
    });

    test('names a rich select popup editor dialog after the column being edited', async () => {
        const popup = await openPopupEditor({
            field: 'notes',
            cellEditor: 'agRichSelectCellEditor',
            cellEditorParams: { values: ['Qualified for the final', 'Eliminated'] },
        });

        expect(within(popup).getByRole('dialog', { name: 'Notes' })).toBeTruthy();
    });
});
