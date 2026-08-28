import { waitFor } from '@testing-library/dom';

import type { GridApi, IToolPanelComp, IToolPanelParams, SideBarDef } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { TestGridsManager } from '../test-utils';

const rowData = [{ athlete: 'Michael Phelps' }, { athlete: 'Ian Thorpe' }];

// Collects every instance the grid creates so the test can inspect the params each one was given.
const instances: RecordingToolPanel[] = [];

/** A custom tool panel that records the initialState it receives on init and on every refresh. */
class RecordingToolPanel implements IToolPanelComp {
    private readonly eGui = document.createElement('div');
    public initInitialState: unknown;
    public readonly refreshInitialStates: unknown[] = [];
    public liveValue = 'untouched';

    public init(params: IToolPanelParams): void {
        instances.push(this);
        this.initInitialState = params.initialState;
        this.eGui.textContent = String(this.liveValue);
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

    public refresh(params: IToolPanelParams): boolean {
        this.refreshInitialStates.push(params.initialState);
        return true;
    }
}

describe('custom tool panel refresh keeps receiving its initialState', () => {
    const gridsManager = new TestGridsManager({ modules: [AllEnterpriseModule] });

    afterEach(() => gridsManager.reset());

    test('api.refreshToolPanel refreshes a reused custom panel with its saved initialState (non-breaking)', async () => {
        instances.length = 0;
        const sideBar: SideBarDef = {
            toolPanels: [
                {
                    id: 'custom',
                    labelDefault: 'Custom',
                    labelKey: 'custom',
                    iconKey: 'columns',
                    toolPanel: RecordingToolPanel,
                },
            ],
            defaultToolPanel: 'custom',
        };

        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'athlete' }],
            rowData,
            sideBar,
            initialState: {
                sideBar: {
                    visible: true,
                    position: 'right',
                    openToolPanel: 'custom',
                    toolPanels: { custom: { marker: 'saved' } },
                },
            },
        });

        await waitFor(() => expect(instances.length).toBeGreaterThan(0));
        const panel = instances[0];
        // Construction applies the saved initialState (restore on grid creation still works).
        expect(panel.initInitialState).toEqual({ marker: 'saved' });

        // A live edit the user could have made after the panel restored.
        panel.liveValue = 'user-edited';

        // A plain refresh must keep handing the custom panel its params.initialState: a custom component
        // may legitimately read it on refresh, so the grid must not silently strip it (non-breaking). It
        // stays the panel's own responsibility whether to re-apply — the grid never clobbers live state.
        api.refreshToolPanel();

        await waitFor(() => expect(panel.refreshInitialStates.length).toBeGreaterThan(0));
        expect(panel.refreshInitialStates.every((state) => state !== undefined)).toBe(true);
        expect(panel.refreshInitialStates.at(-1)).toEqual({ marker: 'saved' });
        expect(panel.liveValue).toBe('user-edited');
    });
});
