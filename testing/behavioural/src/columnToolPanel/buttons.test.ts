import { getByTestId, waitFor } from '@testing-library/dom';
import { ALL_SEVERITIES, TestGridsManager } from 'ag-test-utils';

import type {
    ColDef,
    ColumnToolPanelButtonActionParams,
    GridApi,
    GridOptions,
    IToolPanelColumnCompParams,
    SideBarDef,
} from 'ag-grid-community';
import { agTestIdFor, enableDevValidations, setupAgTestIds } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

describe('column tool panel buttons', () => {
    const gridMgr = new TestGridsManager({
        modules: [AllEnterpriseModule],
    });

    const columnDefs: ColDef[] = [
        { field: 'athlete' },
        { field: 'age' },
        { field: 'country', enableRowGroup: true, rowGroup: true },
    ];

    beforeAll(() => {
        setupAgTestIds();
    });

    afterEach(() => {
        gridMgr.reset();
        vi.restoreAllMocks();
        enableDevValidations({ throwOn: ALL_SEVERITIES });
    });

    async function createGrid(
        buttons: IToolPanelColumnCompParams['buttons'],
        gridOptions?: Pick<GridOptions, 'context' | 'localeText'>
    ): Promise<{ api: GridApi; toolPanel: any; toolPanelGui: HTMLElement }> {
        const sideBar: SideBarDef = {
            toolPanels: [
                {
                    id: 'columns',
                    labelDefault: 'Columns',
                    labelKey: 'columns',
                    iconKey: 'columns',
                    toolPanel: 'agColumnsToolPanel',
                    toolPanelParams: { buttons },
                },
            ],
            defaultToolPanel: 'columns',
        };
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs,
            rowData: [{ athlete: 'Michael Phelps', age: 23, country: 'United States' }],
            sideBar,
            ...gridOptions,
        });
        const toolPanel = await waitFor(() => {
            const panel = api.getToolPanelInstance('columns') as any;
            expect(panel).toBeDefined();
            return panel;
        });
        const toolPanelGui: HTMLElement = toolPanel.getGui();

        // happy-dom gives the virtual list no height, so the viewport needs one before it renders any row.
        const viewport = toolPanelGui.querySelector<HTMLElement>('.ag-column-select-virtual-list-viewport')!;
        Object.defineProperty(viewport, 'offsetHeight', { value: 300, configurable: true });
        viewport.dispatchEvent(new Event('scroll'));

        return { api, toolPanel, toolPanelGui };
    }

    function getButtons(toolPanelGui: HTMLElement): HTMLButtonElement[] {
        return Array.from(toolPanelGui.querySelectorAll<HTMLButtonElement>('.ag-column-panel-buttons-button'));
    }

    function getButton(toolPanelGui: HTMLElement, label: string): HTMLButtonElement {
        return getButtons(toolPanelGui).find((button) => button.textContent?.trim() === label)!;
    }

    /** The column list renders asynchronously, so wait for the item to appear. */
    function getColumnCheckbox(toolPanelGui: HTMLElement, label: string): Promise<HTMLInputElement> {
        return waitFor(
            () =>
                getByTestId(
                    toolPanelGui,
                    agTestIdFor.columnSelectListItemCheckbox(`${label} Column`)
                ) as HTMLInputElement
        );
    }

    test('renders the buttons in the configured order', async () => {
        const { toolPanelGui } = await createGrid(['reset', 'cancel', 'apply']);

        expect(getButtons(toolPanelGui).map((button) => button.textContent!.trim())).toEqual([
            'Reset',
            'Cancel',
            'Apply',
        ]);
    });

    test('uses the resetColumnToolPanel locale key for the label', async () => {
        const { toolPanelGui } = await createGrid(['reset'], { localeText: { resetColumnToolPanel: 'Zurücksetzen' } });

        expect(getButtons(toolPanelGui).map((button) => button.textContent!.trim())).toEqual(['Zurücksetzen']);
    });

    test('reset alone does not enable deferred updates', async () => {
        const { api, toolPanel, toolPanelGui } = await createGrid(['reset']);

        expect(toolPanel['isDeferModeEnabled']).toBe(false);
        expect(toolPanelGui.classList.contains('ag-column-panel-deferred')).toBe(false);

        // Changes made in the tool panel still apply immediately.
        (await getColumnCheckbox(toolPanelGui, 'Age')).click();
        expect(api.getColumn('age')!.isVisible()).toBe(false);
    });

    test('restores the column definitions state without apply', async () => {
        const { api, toolPanelGui } = await createGrid(['reset']);

        api.applyColumnState({
            state: [
                { colId: 'age', hide: true },
                { colId: 'country', rowGroup: false },
            ],
        });
        expect(api.getColumn('age')!.isVisible()).toBe(false);
        expect(api.getRowGroupColumns()).toEqual([]);

        getButton(toolPanelGui, 'Reset').click();

        expect(api.getColumn('age')!.isVisible()).toBe(true);
        expect(api.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country']);
    });

    test('with apply, discards pending changes and resets immediately', async () => {
        const { api, toolPanel, toolPanelGui } = await createGrid(['reset', 'cancel', 'apply']);
        const strategy = toolPanel['beans'].columnStateUpdateStrategy;

        // A committed change that differs from the column definitions.
        api.applyColumnState({ state: [{ colId: 'age', hide: true }] });

        // A staged change on top of it.
        (await getColumnCheckbox(toolPanelGui, 'Athlete')).click();
        expect(strategy.hasPendingChanges(true)).toBe(true);
        expect(api.getColumn('athlete')!.isVisible()).toBe(true);
        expect(getButton(toolPanelGui, 'Apply').disabled).toBe(false);

        getButton(toolPanelGui, 'Reset').click();

        // Applied without clicking Apply.
        expect(api.getColumn('age')!.isVisible()).toBe(true);
        // The staged change is discarded rather than left pending.
        expect(strategy.hasPendingChanges(true)).toBe(false);
        expect(api.getColumn('athlete')!.isVisible()).toBe(true);
        expect((await getColumnCheckbox(toolPanelGui, 'Athlete')).checked).toBe(true);
        expect((await getColumnCheckbox(toolPanelGui, 'Age')).checked).toBe(true);
        expect(getButton(toolPanelGui, 'Apply').disabled).toBe(true);
    });

    test('with apply, discards pending changes when the grid already matches the column definitions', async () => {
        const { api, toolPanel, toolPanelGui } = await createGrid(['reset', 'cancel', 'apply']);
        const strategy = toolPanel['beans'].columnStateUpdateStrategy;

        (await getColumnCheckbox(toolPanelGui, 'Athlete')).click();
        expect(strategy.hasPendingChanges(true)).toBe(true);

        // The reset leaves the grid itself unchanged; only the staged change is affected.
        getButton(toolPanelGui, 'Reset').click();

        expect(strategy.hasPendingChanges(true)).toBe(false);
        expect(api.getColumn('athlete')!.isVisible()).toBe(true);
        expect((await getColumnCheckbox(toolPanelGui, 'Athlete')).checked).toBe(true);
        expect(getButton(toolPanelGui, 'Apply').disabled).toBe(true);
    });

    test('renders a custom button with its label and calls its action with api and context on click', async () => {
        const action = vi.fn();
        const context = { name: 'test context' };
        const { api, toolPanelGui } = await createGrid([{ label: 'Do Something', action }, 'reset'], { context });

        expect(getButtons(toolPanelGui).map((button) => button.textContent!.trim())).toEqual(['Do Something', 'Reset']);

        getButton(toolPanelGui, 'Do Something').click();

        expect(action).toHaveBeenCalledTimes(1);
        const params: ColumnToolPanelButtonActionParams = action.mock.calls[0][0];
        expect(params.api).toBe(api);
        expect(params.context).toBe(context);
    });

    test('custom buttons alone do not enable deferred updates', async () => {
        const { toolPanel, toolPanelGui } = await createGrid([{ label: 'Do Something', action: () => {} }]);

        expect(toolPanel['isDeferModeEnabled']).toBe(false);
        expect(toolPanelGui.classList.contains('ag-column-panel-deferred')).toBe(false);
    });

    test('with apply, a custom action applies immediately and clears pending changes', async () => {
        const { api, toolPanel, toolPanelGui } = await createGrid([
            { label: 'Hide Age', action: ({ api }) => api.setColumnsVisible(['age'], false) },
            'cancel',
            'apply',
        ]);
        const strategy = toolPanel['beans'].columnStateUpdateStrategy;

        (await getColumnCheckbox(toolPanelGui, 'Athlete')).click();
        expect(strategy.hasPendingChanges(true)).toBe(true);

        getButton(toolPanelGui, 'Hide Age').click();

        expect(api.getColumn('age')!.isVisible()).toBe(false);
        expect(strategy.hasPendingChanges(true)).toBe(false);
        expect(api.getColumn('athlete')!.isVisible()).toBe(true);
        expect((await getColumnCheckbox(toolPanelGui, 'Athlete')).checked).toBe(true);
        expect(getButton(toolPanelGui, 'Apply').disabled).toBe(true);
    });

    test('warns when cancel is configured without apply', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [298] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        await createGrid(['cancel']);

        expect(warnSpy.mock.calls.flat().join(' ')).toContain('warning #298');
    });

    test('does not warn when reset or custom buttons are configured without apply', async () => {
        // Any diagnostic throws under the default dev validations, so creating the grid is the assertion.
        await createGrid(['reset', { label: 'Do Something', action: () => {} }]);
    });
});
