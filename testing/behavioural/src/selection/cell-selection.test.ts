import { getByTestId } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import type { MockInstance } from 'vitest';

import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';
import { CellSelectionModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout, waitForEvent } from '../test-utils';
import { GridActions } from './utils';

describe('Cell Selection', () => {
    let consoleErrorSpy: MockInstance;
    let consoleWarnSpy: MockInstance;

    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, CellSelectionModule],
    });

    async function createGrid(go: GridOptions): Promise<[GridApi, GridActions]> {
        const api = gridMgr.createGrid('myGrid', go);
        const actions = new GridActions(api);

        await waitForEvent('firstDataRendered', api);

        return [api, actions];
    }

    beforeAll(() => {
        setupAgTestIds();
    });

    beforeEach(() => {
        gridMgr.reset();

        consoleErrorSpy = vitest.spyOn(console, 'error').mockImplementation(() => {});
        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        gridMgr.reset();

        consoleErrorSpy.mockRestore();
        consoleWarnSpy.mockRestore();
    });

    const columnDefs = [{ field: 'sport' }, { field: 'year' }];
    const rowData = [
        { sport: 'football', year: 2021 },
        { sport: 'rugby', year: 2020 },
        { sport: 'tennis', year: 2018 },
        { sport: 'cricket', year: 2003 },
        { sport: 'golf', year: 2021 },
        { sport: 'swimming', year: 2020 },
        { sport: 'rowing', year: 2019 },
    ];

    describe('Fill Handle', () => {
        test('Double click on fill handle fills down', async () => {
            const [api] = await createGrid({
                columnDefs,
                rowData,
                cellSelection: {
                    handle: {
                        mode: 'fill',
                    },
                },
                defaultColDef: {
                    editable: true,
                },
                getRowId(params) {
                    return params.data?.sport;
                },
            });
            const gridDiv = getGridElement(api)! as HTMLElement;

            const cell = getByTestId(gridDiv, agTestIdFor.cell('tennis', 'sport'));

            const cellSelectionChanged = waitForEvent('cellSelectionChanged', api);
            // Need to manually dispatch touchstart because when running in JSDOM the grid will only attach touchstart not mousedown
            cell.dispatchEvent(new MouseEvent('touchstart', { bubbles: true }));

            await cellSelectionChanged;
            await asyncSetTimeout(1);

            const fillHandle = getByTestId(gridDiv, agTestIdFor.fillHandle());

            const fillEnd = waitForEvent('fillEnd', api);

            await userEvent.dblClick(fillHandle);

            await fillEnd;

            const sports: string[] = [];
            api.forEachNode((node) => {
                sports.push(api.getCellValue({ rowNode: node, colKey: 'sport' }) ?? '');
            });

            expect(sports).toEqual(['football', 'rugby', 'tennis', 'tennis', 'tennis', 'tennis', 'tennis']);
        });
    });
});
