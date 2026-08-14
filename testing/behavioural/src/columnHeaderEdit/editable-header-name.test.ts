import { findByText, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import type { AgColumn, ColDef, GridApi } from 'ag-grid-community';
import { getGridElement } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';

/**
 * Editable header name (UI): opening the editor prefills with the `headerValueGetter` output (called
 * with the `header` location) but dispatches no `columnHeaderNameChanged`. The event fires exactly
 * once, and only when the committed name differs from what the editor opened with. While the editor
 * is open, an override change underneath it (e.g. a programmatic rename) refreshes the input.
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

    async function createGrid(
        columnDefs: ColDef[],
        extraOptions?: Record<string, any>
    ): Promise<{ api: GridApi; gridDiv: HTMLElement; toolPanel: any }> {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            defaultColDef: { flex: 1, minWidth: 100 },
            ...extraOptions,
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
        // The tool panel component is attached from a promise, so it is not available synchronously.
        const toolPanel = await waitFor(() => {
            const instance = api.getToolPanelInstance('columns') as any;
            expect(instance).toBeTruthy();
            return instance;
        });
        return {
            api,
            gridDiv: getGridElement(api)! as HTMLElement,
            toolPanel,
        };
    }

    /** Materialise the tool-panel entry for `label` and dispatch a real `contextmenu` event on it. */
    async function openContextMenu(toolPanel: any, gridDiv: HTMLElement, label: string): Promise<void> {
        const { listPanel, displayedColsList, rowIndex } = await waitFor(() => {
            const panel = toolPanel.primaryColsPanel?.primaryColsListPanel;
            const cols = (panel?.getDisplayedColsList() as any[]) ?? [];
            const index = cols.findIndex((item) => item.displayName === label);
            if (index < 0) {
                throw new Error(`Tool-panel column entry not found for displayName="${label}"`);
            }
            return { listPanel: panel, displayedColsList: cols, rowIndex: index };
        });

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
    }

    /**
     * The virtual list only materialises rows that are in view, and jsdom gives it no height, so a
     * child row has to be brought into view (or built from its model item, as the list itself does)
     * before its rendered label can be read.
     */
    async function childColumnLabel(toolPanel: any, gridDiv: HTMLElement, colId: string): Promise<string | null> {
        const listPanel = toolPanel.primaryColsPanel.primaryColsListPanel;
        const items = (listPanel.getDisplayedColsList() as any[]) ?? [];
        const rowIndex = items.findIndex((item) => !item.group && item.column?.getColId() === colId);
        if (rowIndex < 0) {
            throw new Error(`Tool-panel column entry not found for colId="${colId}"`);
        }

        listPanel['virtualList'].ensureIndexVisible(rowIndex);
        await asyncSetTimeout(0);

        const rendered = listPanel['virtualList'].getComponentAt(rowIndex) as any;
        if (rendered) {
            return rendered.getGui().querySelector('.ag-column-select-column-label')?.textContent ?? null;
        }

        const wrapper = document.createElement('div');
        wrapper.classList.add('ag-virtual-list-item');
        gridDiv.appendChild(wrapper);
        const comp = listPanel['createComponentFromItem'](items[rowIndex], wrapper);
        wrapper.appendChild(comp.getGui());
        return wrapper.querySelector('.ag-column-select-column-label')?.textContent ?? null;
    }

    /** Open the "Edit Column Name" editor for a column via its tool-panel context menu. */
    async function openEditor(toolPanel: any, gridDiv: HTMLElement, label: string): Promise<HTMLInputElement> {
        await openContextMenu(toolPanel, gridDiv, label);
        const menuItem = await findByText(gridDiv, 'Edit Column Name');
        await userEvent.click(menuItem);
        return waitFor(() => {
            const input = document.querySelector(
                '.ag-column-header-edit-popup-editor input'
            ) as HTMLInputElement | null;
            expect(input).toBeTruthy();
            return input!;
        });
    }

    /** The editor popup is removed from the DOM when it closes, so its absence marks the close as done. */
    const editorPopup = () => document.querySelector('.ag-column-header-edit-popup-editor');
    const waitForEditorClosed = () => waitFor(() => expect(editorPopup()).toBeNull());

    /** Commit the editor with the ENTER key (bubbles to the dialog gui listener). */
    function pressEnter(input: HTMLInputElement): void {
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    }

    function pressEscape(input: HTMLInputElement): void {
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    }

    // Columns and groups both notify header-name changes through the public `columnHeaderNameChanged`
    // event (carrying the renamed column or columnGroup), so capture it from the event service.
    function captureColumnHeaderNameChanged(column: AgColumn): any[] {
        const events: any[] = [];
        (column as any).beans.eventSvc.addGlobalListener((type: string, e: any) => {
            if (type === 'columnHeaderNameChanged') {
                events.push(e);
            }
        });
        return events;
    }

    test('opening the editor dispatches no columnHeaderNameChanged event', async () => {
        const { api, gridDiv, toolPanel } = await createGrid([{ field: 'athlete', headerNameEditable: true }]);
        const column = api.getColumn('athlete') as unknown as AgColumn;
        const events = captureColumnHeaderNameChanged(column);

        const input = await openEditor(toolPanel, gridDiv, 'Athlete');
        expect(input.value).toBe('Athlete');
        expect(events.length).toBe(0);

        pressEscape(input);
        await waitForEditorClosed();
        expect(events.length).toBe(0);
    });

    test('opening the editor prefills with the headerValueGetter output, called with the header location', async () => {
        const locations: (string | null)[] = [];
        const { gridDiv, toolPanel } = await createGrid([
            {
                field: 'athlete',
                headerNameEditable: true,
                headerValueGetter: (p) => {
                    locations.push(p.location);
                    return 'Athlete (custom)';
                },
            },
        ]);

        const input = await openEditor(toolPanel, gridDiv, 'Athlete (custom)');

        expect(input.value).toBe('Athlete (custom)');
        expect(locations).toContain('header');
    });

    test('an edited name wins over the headerValueGetter, which is no longer called', async () => {
        let getterCalls = 0;
        const { api, gridDiv, toolPanel } = await createGrid([
            {
                field: 'athlete',
                headerNameEditable: true,
                headerValueGetter: () => {
                    getterCalls++;
                    return 'From Getter';
                },
            },
        ]);
        const column = api.getColumn('athlete') as unknown as AgColumn;

        const input = await openEditor(toolPanel, gridDiv, 'From Getter');
        await userEvent.clear(input);
        await userEvent.type(input, 'Renamed');
        pressEnter(input);
        await waitForEditorClosed();

        const callsAfterCommit = getterCalls;
        // Resolving the display name again must return the override without consulting the getter.
        expect(api.getDisplayNameForColumn(column, 'header')).toBe('Renamed');
        expect(getterCalls).toBe(callsAfterCommit);
    });

    test('committing an unchanged name dispatches no columnHeaderNameChanged event', async () => {
        const { api, gridDiv, toolPanel } = await createGrid([{ field: 'athlete', headerNameEditable: true }]);
        const column = api.getColumn('athlete') as unknown as AgColumn;
        const events = captureColumnHeaderNameChanged(column);

        const input = await openEditor(toolPanel, gridDiv, 'Athlete');
        pressEnter(input);
        await waitForEditorClosed();

        expect(events.length).toBe(0);
        expect(api.getDisplayNameForColumn(column, 'header')).toBe('Athlete');
    });

    test('deferred mode commits a changed name once on Enter and updates the display name', async () => {
        const { api, gridDiv, toolPanel } = await createGrid([{ field: 'athlete', headerNameEditable: true }], {
            columnHeaderEdit: { applyMode: 'deferred' },
        });
        const column = api.getColumn('athlete') as unknown as AgColumn;
        const events = captureColumnHeaderNameChanged(column);

        const input = await openEditor(toolPanel, gridDiv, 'Athlete');
        await userEvent.clear(input);
        await userEvent.type(input, 'Competitor');
        // Deferred mode does not apply while typing.
        expect(events.length).toBe(0);
        pressEnter(input);
        await waitFor(() => expect(events.length).toBe(1));

        expect(events[0].column.getColId()).toBe('athlete');
        expect(api.getDisplayNameForColumn(column, 'header')).toBe('Competitor');
    });

    test('deferred mode: closing the editor via the close button cancels the edit', async () => {
        const { api, gridDiv, toolPanel } = await createGrid([{ field: 'athlete', headerNameEditable: true }], {
            columnHeaderEdit: { applyMode: 'deferred' },
        });
        const column = api.getColumn('athlete') as unknown as AgColumn;
        const events = captureColumnHeaderNameChanged(column);

        const input = await openEditor(toolPanel, gridDiv, 'Athlete');
        await userEvent.clear(input);
        await userEvent.type(input, 'Competitor');

        const closeButton = document.querySelector(
            '.ag-column-header-edit-panel .ag-panel-title-bar-button'
        ) as HTMLElement | null;
        expect(closeButton).toBeTruthy();
        await userEvent.click(closeButton!);
        await waitForEditorClosed();

        expect(events.length).toBe(0);
        expect(api.getDisplayNameForColumn(column, 'header')).toBe('Athlete');
    });

    test('a colDef change while the editor is open refreshes the input', async () => {
        const { api, gridDiv, toolPanel } = await createGrid([{ field: 'athlete', headerNameEditable: true }]);
        const input = await openEditor(toolPanel, gridDiv, 'Athlete');
        expect(input.value).toBe('Athlete');

        api.applyColumnState({ state: [{ colId: 'athlete', headerName: 'Renamed' }] });

        await waitFor(() => expect(input.value).toBe('Renamed'));
    });

    test('a column header name edit is saved to grid state', async () => {
        const { api } = await createGrid([{ field: 'athlete', headerNameEditable: true }]);

        api.applyColumnState({ state: [{ colId: 'athlete', headerName: 'Renamed' }] });

        await waitFor(() =>
            expect(api.getState().columnHeaderName?.columnHeaderNames).toEqual([
                { colId: 'athlete', headerName: 'Renamed' },
            ])
        );
    });

    test('an edited column header name is restored from initialState', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'athlete', headerNameEditable: true }],
            rowData,
            initialState: {
                columnHeaderName: { columnHeaderNames: [{ colId: 'athlete', headerName: 'Renamed' }] },
            },
        });

        const column = api.getColumn('athlete') as unknown as AgColumn;
        await waitFor(() => expect(api.getDisplayNameForColumn(column, 'header')).toBe('Renamed'));
    });

    test('a saved grid state with an edited column header name round-trips through api.setState', async () => {
        const { api } = await createGrid([{ field: 'athlete', headerNameEditable: true }]);
        const column = api.getColumn('athlete') as unknown as AgColumn;

        api.applyColumnState({ state: [{ colId: 'athlete', headerName: 'Renamed' }] });
        await waitFor(() => expect(api.getDisplayNameForColumn(column, 'header')).toBe('Renamed'));
        const savedState = api.getState();

        api.applyColumnState({ state: [{ colId: 'athlete', headerName: null }] });
        await waitFor(() => expect(api.getDisplayNameForColumn(column, 'header')).toBe('Athlete'));

        api.setState(savedState);

        await waitFor(() => expect(api.getDisplayNameForColumn(column, 'header')).toBe('Renamed'));
    });

    test('applying a grid state without columnHeaderName clears a previously-edited name', async () => {
        const { api } = await createGrid([{ field: 'athlete', headerNameEditable: true }]);
        const column = api.getColumn('athlete') as unknown as AgColumn;

        api.applyColumnState({ state: [{ colId: 'athlete', headerName: 'Renamed' }] });
        await waitFor(() => expect(api.getDisplayNameForColumn(column, 'header')).toBe('Renamed'));

        api.setState({});

        await waitFor(() => expect(api.getDisplayNameForColumn(column, 'header')).toBe('Athlete'));
    });

    test('a reset clears the edited header name, reverting to the colDef value', async () => {
        const { api } = await createGrid([{ field: 'athlete', headerNameEditable: true }]);
        const column = api.getColumn('athlete') as unknown as AgColumn;

        api.applyColumnState({ state: [{ colId: 'athlete', headerName: 'Renamed' }] });
        await waitFor(() => expect(api.getDisplayNameForColumn(column, 'header')).toBe('Renamed'));

        api.resetColumnState();

        await waitFor(() => expect(api.getDisplayNameForColumn(column, 'header')).toBe('Athlete'));
    });

    test('deferred mode commits whitespace around the name verbatim (input is not trimmed)', async () => {
        const { api, gridDiv, toolPanel } = await createGrid([{ field: 'athlete', headerNameEditable: true }], {
            columnHeaderEdit: { applyMode: 'deferred' },
        });
        const column = api.getColumn('athlete') as unknown as AgColumn;
        const events = captureColumnHeaderNameChanged(column);

        const input = await openEditor(toolPanel, gridDiv, 'Athlete');
        await userEvent.clear(input);
        await userEvent.type(input, '  Athlete  ');
        pressEnter(input);
        await waitFor(() => expect(events.length).toBe(1));

        expect(api.getDisplayNameForColumn(column, 'header')).toBe('  Athlete  ');
    });

    test('committing an empty name sets an empty header name (empty names are allowed)', async () => {
        const { api, gridDiv, toolPanel } = await createGrid([{ field: 'athlete', headerNameEditable: true }]);
        const column = api.getColumn('athlete') as unknown as AgColumn;

        const input = await openEditor(toolPanel, gridDiv, 'Athlete');
        await userEvent.clear(input);
        pressEnter(input);
        await waitFor(() => expect(api.getDisplayNameForColumn(column, 'header')).toBe(''));

        expect(api.getState().columnHeaderName?.columnHeaderNames).toEqual([{ colId: 'athlete', headerName: '' }]);
    });

    test('applying a null header name via column state reverts to the colDef name', async () => {
        const { api } = await createGrid([{ field: 'athlete', headerNameEditable: true }]);
        const column = api.getColumn('athlete') as unknown as AgColumn;

        api.applyColumnState({ state: [{ colId: 'athlete', headerName: 'Renamed' }] });
        await waitFor(() => expect(api.getDisplayNameForColumn(column, 'header')).toBe('Renamed'));

        api.applyColumnState({ state: [{ colId: 'athlete', headerName: null }] });

        await waitFor(() => expect(api.getDisplayNameForColumn(column, 'header')).toBe('Athlete'));
        expect(api.getState().columnHeaderName).toBeUndefined();
    });

    test('renaming a column group updates its label in the columns tool panel', async () => {
        const { api, gridDiv, toolPanel } = await createGrid([
            {
                groupId: 'athleteGroup',
                headerName: 'Group',
                headerNameEditable: true,
                children: [{ field: 'athlete' }, { field: 'age' }],
            } as any,
        ]);

        const groupLabel = () =>
            Array.from(gridDiv.querySelectorAll('.ag-column-select-column-label')).map((el) => el.textContent);
        await waitFor(() => expect(groupLabel()).toContain('Group'));

        const events = captureColumnHeaderNameChanged(api.getColumn('athlete') as unknown as AgColumn);
        const input = await openEditor(toolPanel, gridDiv, 'Group');
        await userEvent.clear(input);
        await userEvent.type(input, 'Renamed');
        pressEnter(input);
        // The tool panel (and column chooser, which shares agPrimaryColsList) label reflects the new name.
        await waitFor(() => expect(groupLabel()).toContain('Renamed'));

        // The public event carries the renamed columnGroup (and no column) for a group rename.
        // Live mode (the default) dispatches per keystroke, so assert on the latest event.
        expect(events.length).toBeGreaterThan(0);
        const lastEvent = events[events.length - 1];
        expect(lastEvent.columnGroup.getGroupId()).toBe('athleteGroup');
        expect(lastEvent.column).toBeNull();

        const columnGroup = api.getColumnGroup('athleteGroup')!;
        expect(api.getDisplayNameForColumnGroup(columnGroup, 'header')).toBe('Renamed');
        // The UI-driven rename is persisted to grid state, not just reflected in the display name.
        expect(api.getState().columnGroup?.headerNames).toEqual([{ groupId: 'athleteGroup', headerName: 'Renamed' }]);
    });

    test('an edited group label survives collapsing and expanding the group in the columns tool panel', async () => {
        const { gridDiv, toolPanel } = await createGrid([
            {
                groupId: 'athleteGroup',
                headerName: 'Group',
                headerNameEditable: true,
                children: [{ field: 'athlete' }, { field: 'age' }],
            } as any,
        ]);

        const labels = () =>
            Array.from(gridDiv.querySelectorAll('.ag-column-select-column-label')).map((el) => el.textContent);
        await waitFor(() => expect(labels()).toContain('Group'));

        const input = await openEditor(toolPanel, gridDiv, 'Group');
        await userEvent.clear(input);
        await userEvent.type(input, 'Renamed');
        pressEnter(input);
        await waitFor(() => expect(labels()).toContain('Renamed'));

        // Toggling destroys and recreates the row components from their tool-panel model items.
        toolPanel.collapseColumnGroups();
        await asyncSetTimeout(0);
        expect(labels()).toContain('Renamed');

        toolPanel.expandColumnGroups();
        await asyncSetTimeout(0);
        expect(labels()).toContain('Renamed');
    });

    test('an edited child column label survives collapsing and expanding its group in the columns tool panel', async () => {
        const { gridDiv, toolPanel } = await createGrid([
            {
                groupId: 'athleteGroup',
                headerName: 'Group',
                children: [{ field: 'athlete', headerNameEditable: true }, { field: 'age' }],
            } as any,
        ]);

        await waitFor(async () => expect(await childColumnLabel(toolPanel, gridDiv, 'athlete')).toBe('Athlete'));

        const input = await openEditor(toolPanel, gridDiv, 'Athlete');
        await userEvent.clear(input);
        await userEvent.type(input, 'Renamed');
        pressEnter(input);
        await waitFor(async () => expect(await childColumnLabel(toolPanel, gridDiv, 'athlete')).toBe('Renamed'));

        toolPanel.collapseColumnGroups();
        await asyncSetTimeout(0);
        toolPanel.expandColumnGroups();
        await asyncSetTimeout(0);

        expect(await childColumnLabel(toolPanel, gridDiv, 'athlete')).toBe('Renamed');
    });

    test('the tool-panel filter matches a name edited while the filter is already active', async () => {
        const { api, gridDiv, toolPanel } = await createGrid([{ field: 'athlete' }, { field: 'age' }]);

        const labels = () =>
            Array.from(gridDiv.querySelectorAll('.ag-column-select-column-label')).map((el) => el.textContent);
        await waitFor(() => expect(labels()).toContain('Athlete'));

        // Filtering first is what discriminates: `setFilterText` re-marks the items itself, so a
        // filter applied after the rename would match whether or not the rename refreshed them.
        const listPanel = toolPanel.primaryColsPanel.primaryColsListPanel;
        listPanel.setFilterText('Renamed');
        await waitFor(() => expect(labels()).toEqual([]));

        api.applyColumnState({ state: [{ colId: 'athlete', headerName: 'Renamed' }] });

        await waitFor(() => expect(labels()).toEqual(['Renamed']));
    });

    test('renaming one group does not recompute the header name of another group', async () => {
        let ageGroupGetterCalls = 0;
        const { api, gridDiv, toolPanel } = await createGrid([
            {
                groupId: 'athleteGroup',
                headerName: 'Athletes',
                headerNameEditable: true,
                children: [{ field: 'athlete' }],
            } as any,
            {
                groupId: 'ageGroup',
                headerNameEditable: true,
                headerValueGetter: () => {
                    ageGroupGetterCalls++;
                    return 'Ages';
                },
                children: [{ field: 'age' }],
            } as any,
        ]);

        const input = await openEditor(toolPanel, gridDiv, 'Athletes');
        await userEvent.clear(input);
        await userEvent.type(input, 'Swimmers');

        // Baseline captured after opening/typing so only the commit's refresh is measured.
        const callsBeforeCommit = ageGroupGetterCalls;
        pressEnter(input);
        await waitForEditorClosed();

        // The athleteGroup rename carries its groupId, so untouched groups skip the display-name recompute.
        expect(ageGroupGetterCalls).toBe(callsBeforeCommit);
        const athleteGroup = api.getColumnGroup('athleteGroup')!;
        expect(api.getDisplayNameForColumnGroup(athleteGroup, 'header')).toBe('Swimmers');
    });

    test('renaming a column does not recompute the tool-panel name of an unrendered group', async () => {
        let innerGroupToolPanelCalls = 0;
        const { gridDiv, toolPanel } = await createGrid([
            { field: 'athlete', headerNameEditable: true },
            {
                groupId: 'outerGroup',
                headerName: 'Outer',
                children: [
                    {
                        groupId: 'innerGroup',
                        headerValueGetter: (params: any) => {
                            // Rendered rows and the grid header refresh themselves on any rename, so
                            // the group is collapsed out of view below and only the tool panel's own
                            // resolutions are counted, isolating the model-item refresh.
                            if (params.location === 'columnToolPanel') {
                                innerGroupToolPanelCalls++;
                            }
                            return 'Inner';
                        },
                        children: [{ field: 'age' }],
                    },
                ],
            } as any,
        ]);
        await waitFor(() => expect(innerGroupToolPanelCalls).toBeGreaterThan(0));

        toolPanel.collapseColumnGroups();
        await asyncSetTimeout(0);

        // Baseline before typing: `columnHeaderEdit.applyMode` defaults to `live`, so the rename
        // event fires per keystroke and a baseline taken after typing would miss the extra work.
        const callsBeforeEdit = innerGroupToolPanelCalls;
        const input = await openEditor(toolPanel, gridDiv, 'Athlete');
        await userEvent.clear(input);
        await userEvent.type(input, 'Renamed');
        pressEnter(input);
        await waitForEditorClosed();

        // A column rename dispatches a null columnGroup, so treating that alone as "refresh
        // everything" would re-resolve every group's display name in the panel.
        expect(innerGroupToolPanelCalls).toBe(callsBeforeEdit);
    });

    const headerText = () =>
        document.querySelector('.ag-header-cell[col-id="athlete"] .ag-header-cell-text')?.textContent;
    const isHighlighted = () =>
        !!document
            .querySelector('.ag-header-cell[col-id="athlete"]')
            ?.classList.contains('ag-column-header-edit-highlighted');

    test('live mode applies each change to the header as the user types', async () => {
        const { gridDiv, toolPanel } = await createGrid([{ field: 'athlete', headerNameEditable: true }]);
        const input = await openEditor(toolPanel, gridDiv, 'Athlete');

        await userEvent.clear(input);
        await userEvent.type(input, 'Comp');
        // Live: the header reflects the in-progress edit without committing.
        await waitFor(() => expect(headerText()).toBe('Comp'));

        pressEscape(input);
        await waitForEditorClosed();
        // Escape keeps the live change (Calculated Columns parity).
        expect(headerText()).toBe('Comp');
    });

    test('deferred mode shows Apply/Cancel; Apply commits, Cancel discards', async () => {
        const { gridDiv, toolPanel } = await createGrid([{ field: 'athlete', headerNameEditable: true }], {
            columnHeaderEdit: { applyMode: 'deferred' },
        });

        let input = await openEditor(toolPanel, gridDiv, 'Athlete');
        await userEvent.clear(input);
        await userEvent.type(input, 'Cancelled');
        // Deferred: no live preview on the header.
        expect(headerText()).toBe('Athlete');
        const cancelBtn = document.querySelector(
            '.ag-column-header-edit-action:not(.ag-column-header-edit-action-apply)'
        ) as HTMLElement;
        expect(cancelBtn).toBeTruthy();
        await userEvent.click(cancelBtn);
        await waitForEditorClosed();
        expect(headerText()).toBe('Athlete');

        input = await openEditor(toolPanel, gridDiv, 'Athlete');
        await userEvent.clear(input);
        await userEvent.type(input, 'Applied');
        const applyBtn = document.querySelector('.ag-column-header-edit-action-apply') as HTMLElement;
        await userEvent.click(applyBtn);
        await waitFor(() => expect(headerText()).toBe('Applied'));
    });

    test('editing highlights the header cell and clears it on close', async () => {
        const { gridDiv, toolPanel } = await createGrid([{ field: 'athlete', headerNameEditable: true }]);
        expect(isHighlighted()).toBe(false);

        const input = await openEditor(toolPanel, gridDiv, 'Athlete');
        await waitFor(() => expect(isHighlighted()).toBe(true));

        pressEscape(input);
        await waitFor(() => expect(isHighlighted()).toBe(false));
    });

    test('suppressColumnHighlighting disables the edit highlight', async () => {
        const { gridDiv, toolPanel } = await createGrid([{ field: 'athlete', headerNameEditable: true }], {
            columnHeaderEdit: { suppressColumnHighlighting: true },
        });

        // The highlight is toggled synchronously as the editor opens, so no further wait is needed.
        await openEditor(toolPanel, gridDiv, 'Athlete');
        expect(isHighlighted()).toBe(false);
    });
});

describe('Editable group header name', () => {
    const gridMgr = new TestGridsManager({
        modules: [AllEnterpriseModule],
    });

    afterEach(() => {
        gridMgr.reset();
        vi.resetAllMocks();
        vi.clearAllMocks();
    });

    const rowData = [{ athlete: 'Michael Phelps', age: 23 }];

    const groupDefs = (extra: Record<string, any> = {}) => [
        {
            groupId: 'athleteGroup',
            headerName: 'Group',
            headerNameEditable: true,
            children: [{ field: 'athlete' }, { field: 'age' }],
            ...extra,
        },
    ];

    test('a group header name from grid state overrides the colGroupDef name', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: groupDefs(),
            rowData,
            initialState: {
                columnGroup: {
                    openColumnGroupIds: [],
                    headerNames: [{ groupId: 'athleteGroup', headerName: 'Renamed' }],
                },
            },
        });

        await waitFor(() =>
            expect(api.getDisplayNameForColumnGroup(api.getColumnGroup('athleteGroup')!, 'header')).toBe('Renamed')
        );
    });

    test('a group header name round-trips through grid state', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: groupDefs(),
            rowData,
            initialState: {
                columnGroup: {
                    openColumnGroupIds: [],
                    headerNames: [{ groupId: 'athleteGroup', headerName: 'Renamed' }],
                },
            },
        });

        await waitFor(() =>
            expect(api.getState().columnGroup?.headerNames).toEqual([
                { groupId: 'athleteGroup', headerName: 'Renamed' },
            ])
        );
    });

    test('a saved grid state with an edited group header name round-trips through api.setState', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: groupDefs(),
            rowData,
            initialState: {
                columnGroup: {
                    openColumnGroupIds: [],
                    headerNames: [{ groupId: 'athleteGroup', headerName: 'Renamed' }],
                },
            },
        });
        await waitFor(() =>
            expect(api.getDisplayNameForColumnGroup(api.getColumnGroup('athleteGroup')!, 'header')).toBe('Renamed')
        );
        const savedState = api.getState();

        api.resetColumnState();
        await waitFor(() =>
            expect(api.getDisplayNameForColumnGroup(api.getColumnGroup('athleteGroup')!, 'header')).toBe('Group')
        );

        api.setState(savedState);

        await waitFor(() =>
            expect(api.getDisplayNameForColumnGroup(api.getColumnGroup('athleteGroup')!, 'header')).toBe('Renamed')
        );
    });

    test('a reset clears the edited group header name, reverting to the colGroupDef value', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: groupDefs(),
            rowData,
            initialState: {
                columnGroup: {
                    openColumnGroupIds: [],
                    headerNames: [{ groupId: 'athleteGroup', headerName: 'Renamed' }],
                },
            },
        });

        await waitFor(() =>
            expect(api.getDisplayNameForColumnGroup(api.getColumnGroup('athleteGroup')!, 'header')).toBe('Renamed')
        );

        api.resetColumnState();

        await waitFor(() =>
            expect(api.getDisplayNameForColumnGroup(api.getColumnGroup('athleteGroup')!, 'header')).toBe('Group')
        );
    });

    test('an edited group name wins over the group headerValueGetter', async () => {
        let getterCalls = 0;
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: groupDefs({
                headerValueGetter: () => {
                    getterCalls++;
                    return 'From Getter';
                },
            }),
            rowData,
            initialState: {
                columnGroup: {
                    openColumnGroupIds: [],
                    headerNames: [{ groupId: 'athleteGroup', headerName: 'Renamed' }],
                },
            },
        });

        // Poll for the group itself, not its display name — resolving the name is what the test measures.
        const columnGroup = await waitFor(() => {
            const group = api.getColumnGroup('athleteGroup');
            expect(group).toBeTruthy();
            return group!;
        });
        const callsBefore = getterCalls;
        expect(api.getDisplayNameForColumnGroup(columnGroup, 'header')).toBe('Renamed');
        expect(getterCalls).toBe(callsBefore);
    });

    test('an edited group name is shared across split instances and survives re-merge', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                {
                    groupId: 'athleteGroup',
                    headerName: 'Group',
                    headerNameEditable: true,
                    children: [
                        { field: 'athlete', pinned: 'left' },
                        { field: 'age' },
                        { field: 'country', pinned: 'right' },
                    ],
                },
            ],
            rowData: [{ athlete: 'Michael Phelps', age: 23, country: 'United States' }],
            initialState: {
                columnGroup: {
                    openColumnGroupIds: [],
                    headerNames: [{ groupId: 'athleteGroup', headerName: 'Renamed' }],
                },
            },
        });

        // The group's children span three pinned sections, so it is replicated as one instance per section.
        // The override is keyed by groupId, so the single edited name applies to every split instance.
        const groupInstances = () =>
            [
                ...api.getLeftDisplayedColumnGroups(),
                ...api.getCenterDisplayedColumnGroups(),
                ...api.getRightDisplayedColumnGroups(),
            ].filter((cg) => (cg as any).getGroupId?.() === 'athleteGroup');
        const displayNames = () => groupInstances().map((cg) => api.getDisplayNameForColumnGroup(cg as any, 'header'));

        await waitFor(() => expect(displayNames()).toEqual(['Renamed', 'Renamed', 'Renamed']));

        // Un-pinning re-merges the children into a single instance, which keeps the edited name.
        api.applyColumnState({ defaultState: { pinned: null } });
        await waitFor(() => expect(groupInstances().length).toBe(1));

        const merged = groupInstances();
        expect(api.getDisplayNameForColumnGroup(merged[0] as any, 'header')).toBe('Renamed');
        expect(api.getState().columnGroup?.headerNames).toEqual([{ groupId: 'athleteGroup', headerName: 'Renamed' }]);
    });
});

describe('Editable group header name — custom header components', () => {
    const gridMgr = new TestGridsManager({ modules: [AllEnterpriseModule] });

    afterEach(() => {
        gridMgr.reset();
        vi.resetAllMocks();
    });

    // A custom group header component that supports in-place refresh.
    let refreshableInits = 0;
    let refreshableRefreshes = 0;
    class RefreshableGroupHeader {
        private eGui!: HTMLElement;
        public init(params: any): void {
            refreshableInits++;
            this.eGui = document.createElement('div');
            this.eGui.className = 'custom-group-header';
            this.eGui.textContent = params.displayName;
        }
        public refresh(params: any): boolean {
            refreshableRefreshes++;
            this.eGui.textContent = params.displayName;
            return true;
        }
        public getGui(): HTMLElement {
            return this.eGui;
        }
    }

    // A custom group header component without refresh — the grid must recreate it.
    let staticInits = 0;
    class StaticGroupHeader {
        private eGui!: HTMLElement;
        public init(params: any): void {
            staticInits++;
            this.eGui = document.createElement('div');
            this.eGui.className = 'custom-group-header';
            this.eGui.textContent = params.displayName;
        }
        public getGui(): HTMLElement {
            return this.eGui;
        }
    }

    const groupText = () => document.querySelector('.custom-group-header')?.textContent;

    test('a refreshable custom group header is refreshed in place, not recreated', async () => {
        refreshableInits = 0;
        refreshableRefreshes = 0;
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                {
                    groupId: 'athleteGroup',
                    headerName: 'Group',
                    headerNameEditable: true,
                    headerGroupComponent: RefreshableGroupHeader,
                    children: [{ field: 'athlete' }],
                },
            ],
            rowData: [{ athlete: 'Michael Phelps' }],
        });
        await waitFor(() => expect(groupText()).toBe('Group'));
        const initsAfterRender = refreshableInits;

        api.setState({
            columnGroup: { openColumnGroupIds: [], headerNames: [{ groupId: 'athleteGroup', headerName: 'Renamed' }] },
        });
        await waitFor(() => expect(groupText()).toBe('Renamed'));

        // Refreshed in place: refresh called, no new instance created.
        expect(refreshableRefreshes).toBeGreaterThan(0);
        expect(refreshableInits).toBe(initsAfterRender);
    });

    test('a non-refreshable custom group header is recreated on rename', async () => {
        staticInits = 0;
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                {
                    groupId: 'athleteGroup',
                    headerName: 'Group',
                    headerNameEditable: true,
                    headerGroupComponent: StaticGroupHeader,
                    children: [{ field: 'athlete' }],
                },
            ],
            rowData: [{ athlete: 'Michael Phelps' }],
        });
        await waitFor(() => expect(groupText()).toBe('Group'));
        const initsAfterRender = staticInits;

        api.setState({
            columnGroup: { openColumnGroupIds: [], headerNames: [{ groupId: 'athleteGroup', headerName: 'Renamed' }] },
        });
        await waitFor(() => expect(groupText()).toBe('Renamed'));

        // No refresh method, so the grid recreates the component.
        expect(staticInits).toBeGreaterThan(initsAfterRender);
    });
});
