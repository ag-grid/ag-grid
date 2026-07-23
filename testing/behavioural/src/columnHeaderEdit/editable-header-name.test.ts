import { findByText } from '@testing-library/dom';
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

    // Columns and groups both notify header-name changes through the grid-level `columnHeaderNameChanged`
    // event (keyed by colId), so capture it from the internal event service.
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
        await asyncSetTimeout(1);
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
        await asyncSetTimeout(1);

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
        await asyncSetTimeout(1);

        expect(events.length).toBe(0);
        expect(api.getDisplayNameForColumn(column, 'header')).toBe('Athlete');
    });

    test('committing a changed name dispatches columnHeaderNameChanged once and updates the display name', async () => {
        const { api, gridDiv, toolPanel } = await createGrid([{ field: 'athlete', headerNameEditable: true }]);
        const column = api.getColumn('athlete') as unknown as AgColumn;
        const events = captureColumnHeaderNameChanged(column);

        const input = await openEditor(toolPanel, gridDiv, 'Athlete');
        await userEvent.clear(input);
        await userEvent.type(input, 'Competitor');
        pressEnter(input);
        await asyncSetTimeout(1);

        expect(events.length).toBe(1);
        expect(events[0].colId).toBe('athlete');
        expect(api.getDisplayNameForColumn(column, 'header')).toBe('Competitor');
    });

    test('closing the editor via the close button cancels the edit', async () => {
        const { api, gridDiv, toolPanel } = await createGrid([{ field: 'athlete', headerNameEditable: true }]);
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
        await asyncSetTimeout(1);

        expect(events.length).toBe(0);
        expect(api.getDisplayNameForColumn(column, 'header')).toBe('Athlete');
    });

    test('a colDef change while the editor is open refreshes the input', async () => {
        const { api, gridDiv, toolPanel } = await createGrid([{ field: 'athlete', headerNameEditable: true }]);
        const input = await openEditor(toolPanel, gridDiv, 'Athlete');
        expect(input.value).toBe('Athlete');

        api.applyColumnState({ state: [{ colId: 'athlete', headerName: 'Renamed' }] });
        await asyncSetTimeout(1);

        expect(input.value).toBe('Renamed');
    });

    test('a column header name edit is saved to grid state', async () => {
        const { api } = await createGrid([{ field: 'athlete', headerNameEditable: true }]);

        api.applyColumnState({ state: [{ colId: 'athlete', headerName: 'Renamed' }] });
        await asyncSetTimeout(1);

        expect(api.getState().columnHeaderName?.columnHeaderNames).toEqual([
            { colId: 'athlete', headerName: 'Renamed' },
        ]);
    });

    test('an edited column header name is restored from initialState', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'athlete', headerNameEditable: true }],
            rowData,
            initialState: {
                columnHeaderName: { columnHeaderNames: [{ colId: 'athlete', headerName: 'Renamed' }] },
            },
        });
        await asyncSetTimeout(1);

        const column = api.getColumn('athlete') as unknown as AgColumn;
        expect(api.getDisplayNameForColumn(column, 'header')).toBe('Renamed');
    });

    test('a saved grid state with an edited column header name round-trips through api.setState', async () => {
        const { api } = await createGrid([{ field: 'athlete', headerNameEditable: true }]);
        const column = api.getColumn('athlete') as unknown as AgColumn;

        api.applyColumnState({ state: [{ colId: 'athlete', headerName: 'Renamed' }] });
        await asyncSetTimeout(1);
        const savedState = api.getState();

        api.applyColumnState({ state: [{ colId: 'athlete', headerName: null }] });
        await asyncSetTimeout(1);
        expect(api.getDisplayNameForColumn(column, 'header')).toBe('Athlete');

        api.setState(savedState);
        await asyncSetTimeout(1);

        expect(api.getDisplayNameForColumn(column, 'header')).toBe('Renamed');
    });

    test('applying a grid state without columnHeaderName clears a previously-edited name', async () => {
        const { api } = await createGrid([{ field: 'athlete', headerNameEditable: true }]);
        const column = api.getColumn('athlete') as unknown as AgColumn;

        api.applyColumnState({ state: [{ colId: 'athlete', headerName: 'Renamed' }] });
        await asyncSetTimeout(1);
        expect(api.getDisplayNameForColumn(column, 'header')).toBe('Renamed');

        api.setState({});
        await asyncSetTimeout(1);

        expect(api.getDisplayNameForColumn(column, 'header')).toBe('Athlete');
    });

    test('a reset clears the edited header name, reverting to the colDef value', async () => {
        const { api } = await createGrid([{ field: 'athlete', headerNameEditable: true }]);
        const column = api.getColumn('athlete') as unknown as AgColumn;

        api.applyColumnState({ state: [{ colId: 'athlete', headerName: 'Renamed' }] });
        await asyncSetTimeout(1);

        api.resetColumnState();
        await asyncSetTimeout(1);

        expect(api.getDisplayNameForColumn(column, 'header')).toBe('Athlete');
    });

    test('committing whitespace around the name preserves it verbatim (input is not trimmed)', async () => {
        const { api, gridDiv, toolPanel } = await createGrid([{ field: 'athlete', headerNameEditable: true }]);
        const column = api.getColumn('athlete') as unknown as AgColumn;
        const events = captureColumnHeaderNameChanged(column);

        const input = await openEditor(toolPanel, gridDiv, 'Athlete');
        await userEvent.clear(input);
        await userEvent.type(input, '  Athlete  ');
        pressEnter(input);
        await asyncSetTimeout(1);

        expect(events.length).toBe(1);
        expect(api.getDisplayNameForColumn(column, 'header')).toBe('  Athlete  ');
    });

    test('committing an empty name sets an empty header name (empty names are allowed)', async () => {
        const { api, gridDiv, toolPanel } = await createGrid([{ field: 'athlete', headerNameEditable: true }]);
        const column = api.getColumn('athlete') as unknown as AgColumn;

        const input = await openEditor(toolPanel, gridDiv, 'Athlete');
        await userEvent.clear(input);
        pressEnter(input);
        await asyncSetTimeout(1);

        expect(api.getDisplayNameForColumn(column, 'header')).toBe('');
        expect(api.getState().columnHeaderName?.columnHeaderNames).toEqual([{ colId: 'athlete', headerName: '' }]);
    });

    test('applying a null header name via column state reverts to the colDef name', async () => {
        const { api } = await createGrid([{ field: 'athlete', headerNameEditable: true }]);
        const column = api.getColumn('athlete') as unknown as AgColumn;

        api.applyColumnState({ state: [{ colId: 'athlete', headerName: 'Renamed' }] });
        await asyncSetTimeout(1);
        expect(api.getDisplayNameForColumn(column, 'header')).toBe('Renamed');

        api.applyColumnState({ state: [{ colId: 'athlete', headerName: null }] });
        await asyncSetTimeout(1);

        expect(api.getDisplayNameForColumn(column, 'header')).toBe('Athlete');
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
        expect(groupLabel()).toContain('Group');

        const input = await openEditor(toolPanel, gridDiv, 'Group');
        await userEvent.clear(input);
        await userEvent.type(input, 'Renamed');
        pressEnter(input);
        await asyncSetTimeout(1);

        // The tool panel (and column chooser, which shares agPrimaryColsList) label reflects the new name.
        expect(groupLabel()).toContain('Renamed');
        const columnGroup = api.getColumnGroup('athleteGroup')!;
        expect(api.getDisplayNameForColumnGroup(columnGroup, 'header')).toBe('Renamed');
        // The UI-driven rename is persisted to grid state, not just reflected in the display name.
        expect(api.getState().columnGroup?.headerNames).toEqual([{ groupId: 'athleteGroup', headerName: 'Renamed' }]);
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
        await asyncSetTimeout(1);

        // The athleteGroup rename carries its groupId, so untouched groups skip the display-name recompute.
        expect(ageGroupGetterCalls).toBe(callsBeforeCommit);
        const athleteGroup = api.getColumnGroup('athleteGroup')!;
        expect(api.getDisplayNameForColumnGroup(athleteGroup, 'header')).toBe('Swimmers');
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
        await asyncSetTimeout(1);

        const columnGroup = api.getColumnGroup('athleteGroup')!;
        expect(api.getDisplayNameForColumnGroup(columnGroup, 'header')).toBe('Renamed');
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
        await asyncSetTimeout(1);

        expect(api.getState().columnGroup?.headerNames).toEqual([{ groupId: 'athleteGroup', headerName: 'Renamed' }]);
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
        await asyncSetTimeout(1);
        const savedState = api.getState();

        api.resetColumnState();
        await asyncSetTimeout(1);
        const columnGroup = api.getColumnGroup('athleteGroup')!;
        expect(api.getDisplayNameForColumnGroup(columnGroup, 'header')).toBe('Group');

        api.setState(savedState);
        await asyncSetTimeout(1);

        expect(api.getDisplayNameForColumnGroup(api.getColumnGroup('athleteGroup')!, 'header')).toBe('Renamed');
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
        await asyncSetTimeout(1);

        api.resetColumnState();
        await asyncSetTimeout(1);

        const columnGroup = api.getColumnGroup('athleteGroup')!;
        expect(api.getDisplayNameForColumnGroup(columnGroup, 'header')).toBe('Group');
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
        await asyncSetTimeout(1);

        const columnGroup = api.getColumnGroup('athleteGroup')!;
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
        await asyncSetTimeout(1);

        // The group's children span three pinned sections, so it is replicated as one instance per section.
        // The override is keyed by groupId, so the single edited name applies to every split instance.
        const groupInstances = () =>
            [
                ...api.getLeftDisplayedColumnGroups(),
                ...api.getCenterDisplayedColumnGroups(),
                ...api.getRightDisplayedColumnGroups(),
            ].filter((cg) => (cg as any).getGroupId?.() === 'athleteGroup');
        const displayNames = () => groupInstances().map((cg) => api.getDisplayNameForColumnGroup(cg as any, 'header'));

        expect(displayNames()).toEqual(['Renamed', 'Renamed', 'Renamed']);

        // Un-pinning re-merges the children into a single instance, which keeps the edited name.
        api.applyColumnState({ defaultState: { pinned: null } });
        await asyncSetTimeout(1);

        const merged = groupInstances();
        expect(merged.length).toBe(1);
        expect(api.getDisplayNameForColumnGroup(merged[0] as any, 'header')).toBe('Renamed');
        expect(api.getState().columnGroup?.headerNames).toEqual([{ groupId: 'athleteGroup', headerName: 'Renamed' }]);
    });
});
