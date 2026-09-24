import { waitFor } from '@testing-library/dom';
import { ALL_SEVERITIES, TestGridsManager } from 'ag-test-utils';

import type {
    ColDef,
    ColumnToolPanelButtonActionParams,
    GridApi,
    IToolPanelColumnCompParams,
    SideBarDef,
} from 'ag-grid-community';
import { enableDevValidations, setupAgTestIds } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

describe('column tool panel custom buttons', () => {
    const gridMgr = new TestGridsManager({
        modules: [AllEnterpriseModule],
    });

    const columnDefs: ColDef[] = [{ field: 'athlete' }, { field: 'age' }, { field: 'country' }];

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
        context?: any
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
            context,
        });
        const toolPanel = await waitFor(() => {
            const panel = api.getToolPanelInstance('columns') as any;
            expect(panel).toBeDefined();
            return panel;
        });
        return { api, toolPanel, toolPanelGui: toolPanel.getGui() };
    }

    function getButtonLabels(toolPanelGui: HTMLElement): string[] {
        return Array.from(toolPanelGui.querySelectorAll<HTMLButtonElement>('.ag-column-panel-buttons-button')).map(
            (button) => button.textContent!.trim()
        );
    }

    function getButton(toolPanelGui: HTMLElement, label: string): HTMLButtonElement {
        return Array.from(toolPanelGui.querySelectorAll<HTMLButtonElement>('.ag-column-panel-buttons-button')).find(
            (button) => button.textContent?.trim() === label
        )!;
    }

    test('renders a custom button with its label and calls its action with api and context on click', async () => {
        const action = vi.fn();
        const context = { name: 'test context' };
        const { api, toolPanelGui } = await createGrid([{ label: 'Do Something', action }], context);

        expect(getButtonLabels(toolPanelGui)).toEqual(['Do Something']);

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

    test('custom buttons render alongside the provided buttons in the configured order', async () => {
        const { toolPanel, toolPanelGui } = await createGrid([
            { label: 'First', action: () => {} },
            'cancel',
            'apply',
            { label: 'Last', action: () => {} },
        ]);

        expect(getButtonLabels(toolPanelGui)).toEqual(['First', 'Cancel', 'Apply', 'Last']);
        expect(toolPanel['isDeferModeEnabled']).toBe(true);
    });

    test('a custom button can reset the column state', async () => {
        const { api, toolPanelGui } = await createGrid([
            { label: 'Reset', action: ({ api }) => api.resetColumnState() },
        ]);

        api.applyColumnState({ state: [{ colId: 'age', hide: true }] });
        expect(api.getColumn('age')!.isVisible()).toBe(false);

        getButton(toolPanelGui, 'Reset').click();

        expect(api.getColumn('age')!.isVisible()).toBe(true);
    });

    test('warns when cancel is configured without apply', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [298] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        await createGrid(['cancel']);

        expect(warnSpy.mock.calls.flat().join(' ')).toContain('warning #298');
    });

    test('does not warn when buttons are configured without apply or cancel', async () => {
        // Any diagnostic throws under the default dev validations, so creating the grid is the assertion.
        await createGrid([{ label: 'Do Something', action: () => {} }]);
    });
});
