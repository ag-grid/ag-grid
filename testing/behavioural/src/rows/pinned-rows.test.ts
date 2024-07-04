import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { GetRowIdParams, GridOptions } from '@ag-grid-community/core';
import { ModuleRegistry, createGrid } from '@ag-grid-community/core';
import exp from 'constants';

describe('pinned rows', () => {
    const columnDefs = [{ field: 'athlete' }, { field: 'sport' }, { field: 'age' }];
    const topData = [{ athlete: 'Top Athlete', sport: 'Top Sport', age: 11 }];
    const bottomData = [{ athlete: 'Bottom Athlete', sport: 'Bottom Sport', age: 22 }];

    function createMyGrid(gridOptions: GridOptions) {
        return createGrid(document.getElementById('myGrid')!, gridOptions);
    }

    function resetGrids() {
        document.body.innerHTML = '<div id="myGrid"></div>';
    }

    function assertPinnedRowData(data: any[], location: 'top' | 'bottom') {
        document
            .querySelector(`.ag-floating-${location}`)
            .querySelector('.ag-row-pinned')
            .querySelectorAll('.ag-cell')
            .forEach((cell, index) => {
                expect(cell.textContent).toBe(data[0][columnDefs[index].field].toString());
            });
    }

    beforeAll(() => {
        ModuleRegistry.register(ClientSideRowModelModule);
    });

    beforeEach(() => {
        resetGrids();
    });

    afterEach(() => {});

    describe('top', () => {
        test('are shown', () => {
            createMyGrid({ columnDefs, pinnedTopRowData: topData });

            assertPinnedRowData(topData, 'top');
        });

        test('are shown then updated', () => {
            const api = createMyGrid({ columnDefs, pinnedTopRowData: topData });

            assertPinnedRowData(topData, 'top');

            const updatedTopData = [{ athlete: 'Updated Top Athlete', sport: 'Updated Top Sport', age: 33 }];
            api.setGridOption('pinnedTopRowData', updatedTopData);
            assertPinnedRowData(updatedTopData, 'top');
        });

        test('are shown then updated with getRowId', () => {
            let getRowIdParams: GetRowIdParams | null = null;

            const api = createMyGrid({
                columnDefs,
                pinnedTopRowData: topData,
                getRowId: (p) => {
                    getRowIdParams = p;
                    return p.data.athlete;
                },
            });

            assertPinnedRowData(topData, 'top');
            expect(getRowIdParams.data).toBe(topData[0]);
            expect(getRowIdParams.rowPinned).toBe('top');

            const updatedTopData = [{ athlete: 'Updated Top Athlete', sport: 'Updated Top Sport', age: 33 }];
            api.setGridOption('pinnedTopRowData', updatedTopData);
            assertPinnedRowData(updatedTopData, 'top');
        });
    });

    describe('bottom', () => {
        test('are shown', () => {
            createMyGrid({ columnDefs, pinnedBottomRowData: bottomData });

            assertPinnedRowData(bottomData, 'bottom');
        });

        test('are shown then updated', () => {
            const api = createMyGrid({ columnDefs, pinnedBottomRowData: bottomData });

            assertPinnedRowData(bottomData, 'bottom');

            const updatedBottom = [{ athlete: 'Updated Bottom Athlete', sport: 'Updated Bottom Sport', age: 33 }];
            api.setGridOption('pinnedBottomRowData', updatedBottom);
            assertPinnedRowData(updatedBottom, 'bottom');
        });

        test('are shown then updated with getRowId', () => {
            let getRowIdParams: GetRowIdParams | null = null;

            const api = createMyGrid({
                columnDefs,
                pinnedBottomRowData: bottomData,
                getRowId: (p) => {
                    getRowIdParams = p;
                    return p.data.athlete;
                },
            });

            expect(getRowIdParams.data).toBe(bottomData[0]);
            expect(getRowIdParams.rowPinned).toBe('bottom');

            assertPinnedRowData(bottomData, 'bottom');

            const updatedBottom = [{ athlete: 'Updated Bottom Athlete', sport: 'Updated Bottom Sport', age: 33 }];
            api.setGridOption('pinnedBottomRowData', updatedBottom);
            assertPinnedRowData(updatedBottom, 'bottom');
        });
    });
});
