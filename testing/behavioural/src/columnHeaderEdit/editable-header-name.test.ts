import { findByText } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import type { AgColumn, ColDef, GridApi } from 'ag-grid-community';
import { getGridElement } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';

/**
 * Editable header name (UI): opening the editor prefills with the `headerValueGetter` output (called
 * with the `columnHeaderEdit` location) but dispatches no `colDefChanged`. The event fires exactly
 * once, and only when the committed name differs from what the editor opened with. While the editor
 * is open, a colDef change underneath it (e.g. a programmatic rename) refreshes the input.
 */
describe('Editable header name', () => {
    const gridMgr = new TestGridsManager({
        modules: [AllEnterpriseModule],
    });

    afterEach(() => {
        gridMgr.reset();
        vi.resetAllMocks();
        vi.clearAllMocks();
    });

    const rowData = [{ athlete: 'Michael Phelps', age: 23 }];

    async function createGrid(columnDefs: ColDef[]): Promise<{ api: GridApi; gridDiv: HTMLElement; toolPanel: any }> {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            defaultColDef: { flex: 1, minWidth: 100 },
            sideBar: {
                toolPanels: [
                    {
                        id: 'columns',
                        labelDefault: 'Columns',
                        labelKey: 'columns',
                        iconKey: 'columns',
                        toolPanel: 'agColumnsToolPanel',
                    },
                ],
                defaultToolPanel: 'columns',
            },
        });
        await asyncSetTimeout(1);
        return {
            api,
            gridDiv: getGridElement(api)! as HTMLElement,
            toolPanel: api.getToolPanelInstance('columns') as any,
        };
    }

    /** Materialise the tool-panel entry for `label` and dispatch a real `contextmenu` event on it. */
    async function openContextMenu(toolPanel: any, gridDiv: HTMLElement, label: string): Promise<void> {
        const listPanel = toolPanel.primaryColsPanel.primaryColsListPanel;
        const displayedColsList = listPanel.getDisplayedColsList() as any[];
        const rowIndex = displayedColsList.findIndex((item) => item.displayName === label);
        if (rowIndex < 0) {
            throw new Error(`Tool-panel column entry not found for displayName="${label}"`);
        }

        listPanel['virtualList'].ensureIndexVisible(rowIndex);
        await asyncSetTimeout(0);

        let entry: HTMLElement;
        const rendered = listPanel['virtualList'].getComponentAt(rowIndex) as any;
        if (rendered) {
            const renderedEl = rendered.getGui() as HTMLElement;
            entry = (renderedEl.closest('.ag-virtual-list-item') as HTMLElement | null) ?? renderedEl;
        } else {
            const focusWrapper = document.createElement('div');
            focusWrapper.classList.add('ag-virtual-list-item');
            gridDiv.appendChild(focusWrapper);
            const comp = listPanel['createComponentFromItem'](displayedColsList[rowIndex], focusWrapper);
            focusWrapper.appendChild(comp.getGui());
            entry = focusWrapper;
        }

        entry.dispatchEvent(
            new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 })
        );
        await asyncSetTimeout(1);
    }

    /** Open the "Edit Column Name" editor for a column via its tool-panel context menu. */
    async function openEditor(toolPanel: any, gridDiv: HTMLElement, label: string): Promise<HTMLInputElement> {
        await openContextMenu(toolPanel, gridDiv, label);
        const menuItem = await findByText(gridDiv, 'Edit Column Name');
        await userEvent.click(menuItem);
        await asyncSetTimeout(1);
        const input = document.querySelector('.ag-column-header-edit-popup-editor input') as HTMLInputElement | null;
        expect(input).toBeTruthy();
        return input!;
    }

    /** Commit the editor with the ENTER key (bubbles to the dialog gui listener). */
    function pressEnter(input: HTMLInputElement): void {
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    }

    function pressEscape(input: HTMLInputElement): void {
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    }

    function captureColDefChanged(column: AgColumn): any[] {
        const events: any[] = [];
        (column as any).__addEventListener('colDefChanged', (e: any) => events.push(e));
        return events;
    }

    test('opening the editor dispatches no colDefChanged event', async () => {
        const { api, gridDiv, toolPanel } = await createGrid([{ field: 'athlete', editableHeaderName: true }]);
        const column = api.getColumn('athlete') as unknown as AgColumn;
        const events = captureColDefChanged(column);

        const input = await openEditor(toolPanel, gridDiv, 'Athlete');
        expect(input.value).toBe('Athlete');
        expect(events.length).toBe(0);

        pressEscape(input);
        await asyncSetTimeout(1);
        expect(events.length).toBe(0);
    });

    test('opening the editor prefills with the headerValueGetter output, called with the columnHeaderEdit location', async () => {
        const locations: (string | null)[] = [];
        const { gridDiv, toolPanel } = await createGrid([
            {
                field: 'athlete',
                editableHeaderName: true,
                headerValueGetter: (p) => {
                    locations.push(p.location);
                    return p.headerNameOverride ?? 'Athlete (custom)';
                },
            },
        ]);

        const input = await openEditor(toolPanel, gridDiv, 'Athlete (custom)');

        expect(input.value).toBe('Athlete (custom)');
        expect(locations).toContain('columnHeaderEdit');
    });

    test('committing an unchanged name dispatches no colDefChanged event', async () => {
        const { api, gridDiv, toolPanel } = await createGrid([{ field: 'athlete', editableHeaderName: true }]);
        const column = api.getColumn('athlete') as unknown as AgColumn;
        const events = captureColDefChanged(column);

        const input = await openEditor(toolPanel, gridDiv, 'Athlete');
        pressEnter(input);
        await asyncSetTimeout(1);

        expect(events.length).toBe(0);
        expect(api.getDisplayNameForColumn(column, 'header')).toBe('Athlete');
    });

    test('committing a changed name dispatches colDefChanged once and updates the display name', async () => {
        const { api, gridDiv, toolPanel } = await createGrid([{ field: 'athlete', editableHeaderName: true }]);
        const column = api.getColumn('athlete') as unknown as AgColumn;
        const events = captureColDefChanged(column);

        const input = await openEditor(toolPanel, gridDiv, 'Athlete');
        await userEvent.clear(input);
        await userEvent.type(input, 'Competitor');
        pressEnter(input);
        await asyncSetTimeout(1);

        expect(events.length).toBe(1);
        expect(api.getDisplayNameForColumn(column, 'header')).toBe('Competitor');
    });

    test('closing the editor via the close button cancels the edit', async () => {
        const { api, gridDiv, toolPanel } = await createGrid([{ field: 'athlete', editableHeaderName: true }]);
        const column = api.getColumn('athlete') as unknown as AgColumn;
        const events = captureColDefChanged(column);

        const input = await openEditor(toolPanel, gridDiv, 'Athlete');
        await userEvent.clear(input);
        await userEvent.type(input, 'Competitor');

        const closeButton = document.querySelector(
            '.ag-column-header-edit-panel .ag-panel-title-bar-button'
        ) as HTMLElement | null;
        expect(closeButton).toBeTruthy();
        await userEvent.click(closeButton!);
        await asyncSetTimeout(1);

        expect(events.length).toBe(0);
        expect(api.getDisplayNameForColumn(column, 'header')).toBe('Athlete');
    });

    test('a colDef change while the editor is open refreshes the input', async () => {
        const { api, gridDiv, toolPanel } = await createGrid([{ field: 'athlete', editableHeaderName: true }]);
        const input = await openEditor(toolPanel, gridDiv, 'Athlete');
        expect(input.value).toBe('Athlete');

        api.applyColumnState({ state: [{ colId: 'athlete', headerName: 'Renamed' }] });
        await asyncSetTimeout(1);

        expect(input.value).toBe('Renamed');
    });
});
