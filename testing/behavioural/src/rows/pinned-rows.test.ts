import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { GridOptions } from '@ag-grid-community/core';
import { ModuleRegistry, createGrid } from '@ag-grid-community/core';

describe('Pinned rows', () => {
    const columnDefs = [{ field: 'athlete' }, { field: 'sport' }, { field: 'age' }];
    const topData = [{ athlete: 'Top Athlete', sport: 'Top Sport', age: 11 }];
    const bottomData = [{ athlete: 'Bottom Athlete', sport: 'Bottom Sport', age: 22 }];

    function createMyGrid(gridOptions: GridOptions) {
        return createGrid(document.getElementById('myGrid')!, gridOptions);
    }

    function resetGrids() {
        document.body.innerHTML = '<div id="myGrid"></div>';
    }

    function assertPinnedRowData(data: any[], location: 'top' | 'bottom', rowIndices?: string[]) {
        const pinnedRows = document.querySelectorAll(`.ag-floating-${location} .ag-row-pinned`);

        expect(pinnedRows.length).toBe(data.length);

        Array.from(pinnedRows)
            // Have to sort because DOM order of nodes is not necessarily the same as the logical
            // order (because rows are positioned absolutely)
            .sort((a, b) => {
                const rowIndexA = a.getAttribute('row-index').split('-')[1];
                const rowIndexB = b.getAttribute('row-index').split('-')[1];
                return Number(rowIndexA) - Number(rowIndexB);
            })
            .forEach((row, i) => {
                const rowData = data[i];
                if (rowIndices?.[i] != null) {
                    expect(row.getAttribute('row-index')).toEqual(rowIndices[i]);
                }
                row.querySelectorAll('.ag-cell').forEach((cell, colIndex) => {
                    expect(cell.textContent).toBe(rowData[columnDefs[colIndex].field].toString());
                });
            });
    }

    beforeAll(() => {
        ModuleRegistry.register(ClientSideRowModelModule);
    });

    beforeEach(() => {
        resetGrids();
    });

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
            const getRowId = jest.fn((p) => p.data.athlete);

            const api = createMyGrid({
                columnDefs,
                pinnedTopRowData: topData,
                getRowId,
            });

            assertPinnedRowData(topData, 'top');
            expect(getRowId).toHaveBeenLastCalledWith(expect.objectContaining({ data: topData[0], rowPinned: 'top' }));

            const updatedTopData = [{ athlete: 'Updated Top Athlete', sport: 'Updated Top Sport', age: 33 }];
            api.setGridOption('pinnedTopRowData', updatedTopData);
            assertPinnedRowData(updatedTopData, 'top');

            expect(getRowId).toHaveBeenLastCalledWith(
                expect.objectContaining({ data: updatedTopData[0], rowPinned: 'top' })
            );
        });

        test('row data with matching ID is correctly updated', () => {
            const getRowId = jest.fn((p) => p.data.id);
            const pinnedTopRowData = [{ id: '3', athlete: 'Jake', sport: 'Top sport', age: 11 }];

            const api = createMyGrid({
                columnDefs,
                pinnedTopRowData,
                getRowId,
            });

            assertPinnedRowData(pinnedTopRowData, 'top');
            expect(getRowId).toHaveBeenLastCalledWith(
                expect.objectContaining({ data: pinnedTopRowData[0], rowPinned: 'top' })
            );

            const updatedTop = [
                { id: '3', athlete: 'Peter', sport: 'Updated top sport', age: 12 },
                { id: '4', athlete: 'Victor', sport: 'new sport', age: 22 },
            ];

            api.setGridOption('pinnedTopRowData', updatedTop);

            assertPinnedRowData(updatedTop, 'top');
            expect(getRowId).toHaveBeenLastCalledWith(
                expect.objectContaining({ data: updatedTop[1], rowPinned: 'top' })
            );
        });

        test('row data with matching ID is correctly updated with a new row order', () => {
            const getRowId = jest.fn((p) => p.data.id);
            const pinnedTopRowData = [{ id: '3', athlete: 'Jake', sport: 'Top sport', age: 11 }];

            const api = createMyGrid({
                columnDefs,
                pinnedTopRowData,
                getRowId,
            });

            assertPinnedRowData(pinnedTopRowData, 'top');
            expect(getRowId).toHaveBeenLastCalledWith(
                expect.objectContaining({ data: pinnedTopRowData[0], rowPinned: 'top' })
            );

            const updatedTop = [
                { id: '4', athlete: 'Victor', sport: 'new sport', age: 22 },
                { id: '3', athlete: 'Peter', sport: 'Updated top sport', age: 12 },
            ];

            api.setGridOption('pinnedTopRowData', updatedTop);

            assertPinnedRowData(updatedTop, 'top');
            expect(getRowId).toHaveBeenLastCalledWith(
                expect.objectContaining({ data: updatedTop[1], rowPinned: 'top' })
            );
        });

        test('remove and re-order rows', () => {
            const getRowId = jest.fn((p) => p.data.id);
            const pinnedTopRowData = [
                { id: '3', athlete: 'Jake', sport: 'Top sport 0', age: 11 },
                { id: '4', athlete: 'Peter', sport: 'Top sport 1', age: 12 },
                { id: '5', athlete: 'Victor', sport: 'Top sport 2', age: 22 },
            ];

            const api = createMyGrid({
                columnDefs,
                pinnedTopRowData,
                getRowId,
            });

            assertPinnedRowData(pinnedTopRowData, 'top', ['t-0', 't-1', 't-2']);
            expect(getRowId).toHaveBeenLastCalledWith(
                expect.objectContaining({ data: pinnedTopRowData[2], rowPinned: 'top' })
            );

            const updatedTop = [
                { id: '5', athlete: 'Charles', sport: 'new sport 0', age: 22 },
                { id: '3', athlete: 'Jake', sport: 'new sport 1', age: 14 },
            ];

            api.setGridOption('pinnedTopRowData', updatedTop);

            assertPinnedRowData(updatedTop, 'top', ['t-0', 't-1']);
            expect(getRowId).toHaveBeenLastCalledWith(
                expect.objectContaining({ data: updatedTop[1], rowPinned: 'top' })
            );
        });

        test('rows are cleared on setting undefined rowData', () => {
            const api = createMyGrid({ columnDefs, pinnedTopRowData: topData });

            assertPinnedRowData(topData, 'top');

            api.setGridOption('pinnedTopRowData', undefined);
            assertPinnedRowData([], 'top');
        });

        test('cannot render duplicate rows with getRowId', () => {
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
            const getRowId = jest.fn((p) => JSON.stringify(p.data));
            createMyGrid({ columnDefs, pinnedTopRowData: topData.concat(topData), getRowId });

            assertPinnedRowData(topData, 'top', ['t-0']);
            expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
            expect(consoleWarnSpy).toHaveBeenLastCalledWith(
                'AG Grid: Duplicate ID',
                JSON.stringify(topData[0]),
                'found for pinned row with data',
                topData[0],
                'When `getRowId` is defined, it must return unique IDs for all pinned rows. Use the `rowPinned` parameter.'
            );
            consoleWarnSpy.mockRestore();
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
            const getRowId = jest.fn((p) => p.data.athlete);

            const api = createMyGrid({
                columnDefs,
                pinnedBottomRowData: bottomData,
                getRowId,
            });

            expect(getRowId).toHaveBeenLastCalledWith(
                expect.objectContaining({ data: bottomData[0], rowPinned: 'bottom' })
            );

            assertPinnedRowData(bottomData, 'bottom');

            const updatedBottom = [{ athlete: 'Updated Bottom Athlete', sport: 'Updated Bottom Sport', age: 33 }];
            api.setGridOption('pinnedBottomRowData', updatedBottom);
            assertPinnedRowData(updatedBottom, 'bottom');

            expect(getRowId).toHaveBeenLastCalledWith(
                expect.objectContaining({ data: updatedBottom[0], rowPinned: 'bottom' })
            );
        });

        test('row data with matching ID is correctly updated', () => {
            const getRowId = jest.fn((p) => p.data.id);
            const pinnedBottomRowData = [{ id: '3', athlete: 'Jake', sport: 'Top sport', age: 11 }];

            const api = createMyGrid({
                columnDefs,
                pinnedBottomRowData,
                getRowId,
            });

            assertPinnedRowData(pinnedBottomRowData, 'bottom');
            expect(getRowId).toHaveBeenLastCalledWith(
                expect.objectContaining({ data: pinnedBottomRowData[0], rowPinned: 'bottom' })
            );

            const updatedBottom = [
                { id: '3', athlete: 'Peter', sport: 'Updated bottom sport', age: 12 },
                { id: '4', athlete: 'Victor', sport: 'new sport', age: 22 },
            ];

            api.setGridOption('pinnedBottomRowData', updatedBottom);

            assertPinnedRowData(updatedBottom, 'bottom');
            expect(getRowId).toHaveBeenLastCalledWith(
                expect.objectContaining({ data: updatedBottom[1], rowPinned: 'bottom' })
            );
        });

        test('row data with matching ID is correctly updated with a new row order', () => {
            const getRowId = jest.fn((p) => p.data.id);
            const pinnedBottomRowData = [{ id: '3', athlete: 'Jake', sport: 'Top sport', age: 11 }];

            const api = createMyGrid({
                columnDefs,
                pinnedBottomRowData,
                getRowId,
            });

            assertPinnedRowData(pinnedBottomRowData, 'bottom');
            expect(getRowId).toHaveBeenLastCalledWith(
                expect.objectContaining({ data: pinnedBottomRowData[0], rowPinned: 'bottom' })
            );

            const updatedBottom = [
                { id: '4', athlete: 'Victor', sport: 'new sport', age: 22 },
                { id: '3', athlete: 'Peter', sport: 'Updated bottom sport', age: 12 },
            ];

            api.setGridOption('pinnedBottomRowData', updatedBottom);

            assertPinnedRowData(updatedBottom, 'bottom');
            expect(getRowId).toHaveBeenLastCalledWith(
                expect.objectContaining({ data: updatedBottom[1], rowPinned: 'bottom' })
            );
        });

        test('remove and re-order rows', () => {
            const getRowId = jest.fn((p) => p.data.id);
            const pinnedBottomRowData = [
                { id: '3', athlete: 'Jake', sport: 'Bottom sport 0', age: 11 },
                { id: '4', athlete: 'Peter', sport: 'Bottom sport 1', age: 12 },
                { id: '5', athlete: 'Victor', sport: 'Bottom sport 2', age: 22 },
            ];

            const api = createMyGrid({
                columnDefs,
                pinnedBottomRowData,
                getRowId,
            });

            assertPinnedRowData(pinnedBottomRowData, 'bottom', ['b-0', 'b-1', 'b-2']);
            expect(getRowId).toHaveBeenLastCalledWith(
                expect.objectContaining({ data: pinnedBottomRowData[2], rowPinned: 'bottom' })
            );

            const updatedBottom = [
                { id: '5', athlete: 'Charles', sport: 'new sport 0', age: 22 },
                { id: '3', athlete: 'Jake', sport: 'new sport 1', age: 14 },
            ];

            api.setGridOption('pinnedBottomRowData', updatedBottom);

            assertPinnedRowData(updatedBottom, 'bottom', ['b-0', 'b-1']);
            expect(getRowId).toHaveBeenLastCalledWith(
                expect.objectContaining({ data: updatedBottom[1], rowPinned: 'bottom' })
            );
        });

        test('rows are cleared on setting undefined rowData', () => {
            const api = createMyGrid({ columnDefs, pinnedBottomRowData: bottomData });

            assertPinnedRowData(bottomData, 'bottom');

            api.setGridOption('pinnedBottomRowData', undefined);
            assertPinnedRowData([], 'bottom');
        });

        test('cannot render duplicate rows with getRowId', () => {
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
            const getRowId = jest.fn((p) => JSON.stringify(p.data));
            createMyGrid({ columnDefs, pinnedBottomRowData: bottomData.concat(bottomData), getRowId });

            assertPinnedRowData(bottomData, 'bottom', ['b-0']);
            expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
            expect(consoleWarnSpy).toHaveBeenLastCalledWith(
                'AG Grid: Duplicate ID',
                JSON.stringify(bottomData[0]),
                'found for pinned row with data',
                bottomData[0],
                'When `getRowId` is defined, it must return unique IDs for all pinned rows. Use the `rowPinned` parameter.'
            );
            consoleWarnSpy.mockRestore();
        });
    });
});
