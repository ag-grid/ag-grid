import { fireEvent, getByText, waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';

import type { ColDef, ColGroupDef, GridApi, GridOptions } from 'ag-grid-community';
import { getGridElement } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

const COLUMN_DEFS: (ColDef | ColGroupDef)[] = [
    {
        headerName: 'Athlete Details',
        children: [{ field: 'athlete' }, { field: 'country', hide: true }],
    },
    {
        headerName: 'Medals',
        children: [{ field: 'gold' }, { field: 'silver' }],
    },
    {
        headerName: 'Hidden Group',
        children: [{ field: 'year', hide: true }],
    },
    { field: 'total', lockVisible: true },
];

describe('column select items expose their checked state', () => {
    const gridsManager = new TestGridsManager({ modules: [AllEnterpriseModule] });

    afterEach(() => {
        gridsManager.reset();
    });

    async function createGrid(
        options: GridOptions = {},
        toolPanelParams: Record<string, unknown> = {}
    ): Promise<{ api: GridApi; viewport: HTMLElement }> {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs: COLUMN_DEFS,
            rowData: [{ athlete: 'Michael Phelps', country: 'USA', gold: 8, silver: 0, year: 2008, total: 8 }],
            sideBar: {
                toolPanels: [
                    {
                        id: 'columns',
                        labelDefault: 'Columns',
                        labelKey: 'columns',
                        iconKey: 'columns',
                        toolPanel: 'agColumnsToolPanel',
                        toolPanelParams,
                    },
                ],
                defaultToolPanel: 'columns',
            },
            ...options,
        });
        const panel = await waitFor(() => {
            const el = getGridElement(api)!.querySelector<HTMLElement>('.ag-column-panel');
            expect(el).not.toBeNull();
            return el!;
        });
        return { api, viewport: await renderRows(panel) };
    }

    /** happy-dom needs a viewport height to render the virtual-list rows. */
    async function renderRows(container: Element): Promise<HTMLElement> {
        const viewport = container.querySelector<HTMLElement>('.ag-column-select-virtual-list-viewport')!;
        Object.defineProperty(viewport, 'offsetHeight', { value: 500, configurable: true });
        viewport.dispatchEvent(new Event('scroll'));
        await waitFor(() => expect(viewport.querySelector('.ag-virtual-list-item')).not.toBeNull());
        return viewport;
    }

    /** Re-queried every time, as a refresh can replace the row elements. */
    function getRow(viewport: HTMLElement, label: string): HTMLElement {
        return getByText(viewport, label).closest<HTMLElement>('[role="treeitem"]')!;
    }

    function expectChecked(viewport: HTMLElement, expected: Record<string, string>): Promise<void> {
        return waitFor(() => {
            const actual: Record<string, string | null> = {};
            for (const label of Object.keys(expected)) {
                actual[label] = getRow(viewport, label).getAttribute('aria-checked');
            }
            expect(actual).toEqual(expected);
        });
    }

    test('columns and groups expose checked, unchecked and mixed states', async () => {
        const { viewport } = await createGrid();

        await expectChecked(viewport, {
            Athlete: 'true',
            Country: 'false',
            'Athlete Details': 'mixed',
            Medals: 'true',
            'Hidden Group': 'false',
            Total: 'true',
        });
    });

    test('Space on the focused item updates its state and its group state', async () => {
        const { api, viewport } = await createGrid();

        const athlete = getRow(viewport, 'Athlete');
        athlete.focus();
        fireEvent.keyDown(athlete, { key: ' ' });
        await expectChecked(viewport, { Athlete: 'false', 'Athlete Details': 'false' });
        expect(api.getColumn('athlete')!.isVisible()).toBe(false);

        const group = getRow(viewport, 'Athlete Details');
        group.focus();
        fireEvent.keyDown(group, { key: ' ' });
        await expectChecked(viewport, { Athlete: 'true', Country: 'true', 'Athlete Details': 'true' });
    });

    test('checkbox and label clicks give the same state and leave focus on the item', async () => {
        const { viewport } = await createGrid();

        for (const label of ['Gold', 'Silver']) {
            const row = getRow(viewport, label);
            const mouseDown = fireEvent.mouseDown(row.querySelector('input')!);
            expect(mouseDown).toBe(false);
            expect(document.activeElement).toBe(row);
        }

        fireEvent.click(getRow(viewport, 'Gold').querySelector('input')!);
        fireEvent.click(getByText(viewport, 'Silver'));

        await expectChecked(viewport, { Gold: 'false', Silver: 'false', Medals: 'false' });
    });

    test('changes made outside the panel update the state, including locked columns', async () => {
        const { api, viewport } = await createGrid();

        api.setColumnsVisible(['gold', 'total'], false);

        await expectChecked(viewport, { Gold: 'false', Medals: 'mixed', Total: 'false' });
    });

    test('in pivot mode the state follows whether the column has a function', async () => {
        const { api, viewport } = await createGrid({
            defaultColDef: { enableRowGroup: true, enableValue: true, enablePivot: true },
        });
        api.setGridOption('pivotMode', true);

        await expectChecked(viewport, { Athlete: 'false', Gold: 'false' });

        api.setRowGroupColumns(['athlete']);

        await expectChecked(viewport, { Athlete: 'true', Gold: 'false' });
    });

    test('with an Apply button the state follows the staged change', async () => {
        const { api, viewport } = await createGrid({}, { buttons: ['apply', 'cancel'] });

        const athlete = getRow(viewport, 'Athlete');
        athlete.focus();
        fireEvent.keyDown(athlete, { key: ' ' });

        await expectChecked(viewport, { Athlete: 'false' });
        expect(api.getColumn('athlete')!.isVisible()).toBe(true);
    });

    test('Choose Columns dialog items expose the same state', async () => {
        const { api } = await createGrid();
        api.showColumnChooser();

        const dialog = await waitFor(() => {
            const el = document.querySelector('.ag-dialog .ag-column-select');
            expect(el).not.toBeNull();
            return el!;
        });
        const viewport = await renderRows(dialog);

        await expectChecked(viewport, { Athlete: 'true', Country: 'false', 'Athlete Details': 'mixed' });
    });
});
