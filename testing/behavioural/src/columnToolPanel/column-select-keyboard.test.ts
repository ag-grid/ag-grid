import { waitFor } from '@testing-library/dom';
import { TestGridsManager, asyncSetTimeout } from 'ag-test-utils';

import type { ColGroupDef, GridApi } from 'ag-grid-community';
import { getGridElement } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

const COLUMN_DEFS: ColGroupDef[] = [
    { groupId: 'athleteDetails', headerName: 'Athlete Details', children: [{ field: 'athlete' }] },
    { groupId: 'medals', headerName: 'Medals', children: [{ field: 'gold' }, { field: 'silver' }] },
];

describe('column tool panel keyboard selection', () => {
    const gridsManager = new TestGridsManager({ modules: [AllEnterpriseModule] });

    afterEach(() => {
        gridsManager.reset();
    });

    async function getListItem(api: GridApi, label: string): Promise<HTMLElement> {
        const gridEl = getGridElement(api)! as HTMLElement;
        const viewport = gridEl.querySelector<HTMLElement>('.ag-column-select-virtual-list-viewport')!;
        // happy-dom has no layout, so the virtual list renders nothing until it is given a height
        Object.defineProperty(viewport, 'offsetHeight', { value: 200, configurable: true });
        viewport.dispatchEvent(new Event('scroll'));

        return waitFor(() => {
            const items = Array.from(gridEl.querySelectorAll<HTMLElement>('.ag-column-select-virtual-list-item'));
            const item = items.find((el) => el.textContent?.trim() === label);
            expect(item).toBeDefined();
            return item!;
        });
    }

    function dispatchSpace(target: HTMLElement, type: 'keydown' | 'keyup', repeat = false): void {
        target.dispatchEvent(new KeyboardEvent(type, { key: ' ', repeat, bubbles: true, cancelable: true }));
    }

    test.each([
        { label: 'Gold', colIds: ['gold'] },
        { label: 'Medals', colIds: ['gold', 'silver'] },
    ])(
        'holding Space on the $label row toggles its columns once, when Space is released',
        async ({ label, colIds }) => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs: COLUMN_DEFS,
                rowData: [{ athlete: 'A', gold: 1, silver: 2 }],
                sideBar: { toolPanels: ['columns'], defaultToolPanel: 'columns' },
            });
            const areVisible = () => colIds.map((colId) => api.getColumn(colId)!.isVisible());
            const item = await getListItem(api, label);
            item.focus();

            dispatchSpace(item, 'keydown');
            dispatchSpace(item, 'keydown', true);
            dispatchSpace(item, 'keydown', true);
            await asyncSetTimeout(0);
            expect(areVisible()).toEqual(colIds.map(() => true));

            dispatchSpace(item, 'keyup');
            await waitFor(() => expect(areVisible()).toEqual(colIds.map(() => false)));
        }
    );
});
