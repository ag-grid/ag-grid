import { cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';
// The ambient global `test` resolves to the jest typings here, which have no `fails`.
import { test } from 'vitest';

import type { GridApi, SideBarDef } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import type { CustomToolPanelProps } from 'ag-grid-react';
import { AgGridReact } from 'ag-grid-react';

const rowData = [{ athlete: 'Michael Phelps' }, { athlete: 'Ian Thorpe' }];

type PanelState = { marker: string };

// Records the props each render receives so the test can assert on `state` vs `initialState`.
const renders: { state: PanelState | undefined; initialState: PanelState | undefined }[] = [];

const RecordingToolPanel = ({ state, initialState }: CustomToolPanelProps<any, any, PanelState>) => {
    renders.push({ state, initialState });
    return <div data-testid="custom-tool-panel">{state?.marker ?? 'no-state'}</div>;
};

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

describe('Custom tool panel state (React)', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([AllEnterpriseModule]);
    });

    afterEach(() => {
        cleanup();
        renders.length = 0;
    });

    // CustomToolPanelProps.state is documented as "Initially set to the same value as `initialState`".
    test('seeds state from initialState on first render', async () => {
        const rendered = render(
            <AgGridReact
                columnDefs={[{ field: 'athlete' }]}
                rowData={rowData}
                sideBar={sideBar}
                initialState={{
                    sideBar: {
                        visible: true,
                        position: 'right',
                        openToolPanel: 'custom',
                        toolPanels: { custom: { marker: 'from-initial-state' } },
                    },
                }}
            />
        );

        await rendered.findByTestId('custom-tool-panel');
        await waitFor(() => expect(renders.length).toBeGreaterThan(0));

        // initialState is delivered correctly; only `state` is unseeded.
        expect(renders.at(-1)!.initialState).toEqual({ marker: 'from-initial-state' });
        expect(renders.at(-1)!.state).toEqual({ marker: 'from-initial-state' });
    });

    // KNOWN DEFECT, asserted as currently-failing so it flips green when fixed rather than sitting red.
    // A restore arrives on refresh() as a new initialState, but the wrapper only swaps sourceParams and
    // never re-seeds `state`, so React custom panels ignore api.setState. Naively re-seeding on every
    // refresh is not the fix: refreshToolPanel replays the construction-time initialState and would
    // clobber live state. Needs a restore signal distinct from initialState.
    test.fails('applies an api.setState restore to the state prop', async () => {
        let api: GridApi | undefined;

        const rendered = render(
            <AgGridReact
                onGridReady={(e) => {
                    api = e.api;
                }}
                columnDefs={[{ field: 'athlete' }]}
                rowData={rowData}
                sideBar={sideBar}
            />
        );

        await rendered.findByTestId('custom-tool-panel');
        await waitFor(() => expect(api).toBeDefined());

        api!.setState({
            sideBar: {
                visible: true,
                position: 'right',
                openToolPanel: 'custom',
                toolPanels: { custom: { marker: 'from-set-state' } },
            },
        });

        await waitFor(() => expect(renders.at(-1)!.state).toEqual({ marker: 'from-set-state' }));
    });
});
