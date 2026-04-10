import { ClientSideRowModelModule, PinnedRowModule } from 'ag-grid-community';

import { GridRows, TestGridsManager } from '../test-utils';
import { VERSION } from '../version';

describe('Pinned rows', () => {
    const gridsManager = new TestGridsManager({ modules: [PinnedRowModule, ClientSideRowModelModule] });

    const columnDefs = [{ field: 'athlete' }, { field: 'sport' }, { field: 'age' }];
    const topData = [{ athlete: 'Top Athlete', sport: 'Top Sport', age: 11 }];
    const bottomData = [{ athlete: 'Bottom Athlete', sport: 'Bottom Sport', age: 22 }];

    function assertPinnedRowData(data: any[], location: 'top' | 'bottom', rowIndices?: string[]) {
        const pinnedRows = document.querySelectorAll(`.ag-floating-${location} .ag-row-pinned`);

        expect(pinnedRows.length).toBe(data.length);

        Array.from(pinnedRows)
            // Have to sort because DOM order of nodes is not necessarily the same as the logical
            // order (because rows are positioned absolutely)
            .sort((a, b) => {
                const rowIndexA = a.getAttribute('row-index')!.split('-')[1];
                const rowIndexB = b.getAttribute('row-index')!.split('-')[1];
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

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    describe('top', () => {
        test('are shown', async () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs, pinnedTopRowData: topData });

            assertPinnedRowData(topData, 'top');
            await new GridRows(api, 'pinned top rows').check(`
                PINNED_TOP id:t-0 athlete:"Top Athlete" sport:"Top Sport" age:11
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('are shown then updated', async () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs, pinnedTopRowData: topData });

            assertPinnedRowData(topData, 'top');
            await new GridRows(api, 'initial').check(`
                PINNED_TOP id:t-0 athlete:"Top Athlete" sport:"Top Sport" age:11
                ROOT id:ROOT_NODE_ID
            `);

            const updatedTopData = [{ athlete: 'Updated Top Athlete', sport: 'Updated Top Sport', age: 33 }];
            api.setGridOption('pinnedTopRowData', updatedTopData);
            assertPinnedRowData(updatedTopData, 'top');
            await new GridRows(api, 'after update').check(`
                PINNED_TOP id:t-1 athlete:"Updated Top Athlete" sport:"Updated Top Sport" age:33
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('are shown then updated with getRowId', async () => {
            const getRowId = vitest.fn((p) => p.data.athlete);

            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                pinnedTopRowData: topData,
                getRowId,
            });

            assertPinnedRowData(topData, 'top');
            expect(getRowId).toHaveBeenLastCalledWith(expect.objectContaining({ data: topData[0], rowPinned: 'top' }));
            await new GridRows(api, 'initial').check(`
                PINNED_TOP id:"Top Athlete" athlete:"Top Athlete" sport:"Top Sport" age:11
                ROOT id:ROOT_NODE_ID
            `);

            const updatedTopData = [{ athlete: 'Updated Top Athlete', sport: 'Updated Top Sport', age: 33 }];
            api.setGridOption('pinnedTopRowData', updatedTopData);
            assertPinnedRowData(updatedTopData, 'top');

            expect(getRowId).toHaveBeenLastCalledWith(
                expect.objectContaining({ data: updatedTopData[0], rowPinned: 'top' })
            );
            await new GridRows(api, 'after update').check(`
                PINNED_TOP id:"Updated Top Athlete" athlete:"Updated Top Athlete" sport:"Updated Top Sport" age:33
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('row data with matching ID is correctly updated', async () => {
            const getRowId = vitest.fn((p) => p.data.id);
            const pinnedTopRowData = [{ id: '3', athlete: 'Jake', sport: 'Top sport', age: 11 }];

            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                pinnedTopRowData,
                getRowId,
            });

            assertPinnedRowData(pinnedTopRowData, 'top');
            expect(getRowId).toHaveBeenLastCalledWith(
                expect.objectContaining({ data: pinnedTopRowData[0], rowPinned: 'top' })
            );
            await new GridRows(api, 'initial').check(`
                PINNED_TOP id:3 athlete:"Jake" sport:"Top sport" age:11
                ROOT id:ROOT_NODE_ID
            `);

            const updatedTop = [
                { id: '3', athlete: 'Peter', sport: 'Updated top sport', age: 12 },
                { id: '4', athlete: 'Victor', sport: 'new sport', age: 22 },
            ];

            api.setGridOption('pinnedTopRowData', updatedTop);

            assertPinnedRowData(updatedTop, 'top');
            expect(getRowId).toHaveBeenLastCalledWith(
                expect.objectContaining({ data: updatedTop[1], rowPinned: 'top' })
            );
            await new GridRows(api, 'after update').check(`
                PINNED_TOP id:3 athlete:"Peter" sport:"Updated top sport" age:12
                PINNED_TOP id:4 athlete:"Victor" sport:"new sport" age:22
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('row data with matching ID is correctly updated with a new row order', async () => {
            const getRowId = vitest.fn((p) => p.data.id);
            const pinnedTopRowData = [{ id: '3', athlete: 'Jake', sport: 'Top sport', age: 11 }];

            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                pinnedTopRowData,
                getRowId,
            });

            assertPinnedRowData(pinnedTopRowData, 'top');
            expect(getRowId).toHaveBeenLastCalledWith(
                expect.objectContaining({ data: pinnedTopRowData[0], rowPinned: 'top' })
            );
            await new GridRows(api, 'initial').check(`
                PINNED_TOP id:3 athlete:"Jake" sport:"Top sport" age:11
                ROOT id:ROOT_NODE_ID
            `);

            const updatedTop = [
                { id: '4', athlete: 'Victor', sport: 'new sport', age: 22 },
                { id: '3', athlete: 'Peter', sport: 'Updated top sport', age: 12 },
            ];

            api.setGridOption('pinnedTopRowData', updatedTop);

            assertPinnedRowData(updatedTop, 'top');
            expect(getRowId).toHaveBeenLastCalledWith(
                expect.objectContaining({ data: updatedTop[1], rowPinned: 'top' })
            );
            await new GridRows(api, 'after reorder').check(`
                PINNED_TOP id:4 athlete:"Victor" sport:"new sport" age:22
                PINNED_TOP id:3 athlete:"Peter" sport:"Updated top sport" age:12
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('remove and re-order rows', async () => {
            const getRowId = vitest.fn((p) => p.data.id);
            const pinnedTopRowData = [
                { id: '3', athlete: 'Jake', sport: 'Top sport 0', age: 11 },
                { id: '4', athlete: 'Peter', sport: 'Top sport 1', age: 12 },
                { id: '5', athlete: 'Victor', sport: 'Top sport 2', age: 22 },
            ];

            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                pinnedTopRowData,
                getRowId,
            });

            assertPinnedRowData(pinnedTopRowData, 'top', ['t-0', 't-1', 't-2']);
            expect(getRowId).toHaveBeenLastCalledWith(
                expect.objectContaining({ data: pinnedTopRowData[2], rowPinned: 'top' })
            );
            await new GridRows(api, 'initial').check(`
                PINNED_TOP id:3 athlete:"Jake" sport:"Top sport 0" age:11
                PINNED_TOP id:4 athlete:"Peter" sport:"Top sport 1" age:12
                PINNED_TOP id:5 athlete:"Victor" sport:"Top sport 2" age:22
                ROOT id:ROOT_NODE_ID
            `);

            const updatedTop = [
                { id: '5', athlete: 'Charles', sport: 'new sport 0', age: 22 },
                { id: '3', athlete: 'Jake', sport: 'new sport 1', age: 14 },
            ];

            api.setGridOption('pinnedTopRowData', updatedTop);

            assertPinnedRowData(updatedTop, 'top', ['t-0', 't-1']);
            expect(getRowId).toHaveBeenLastCalledWith(
                expect.objectContaining({ data: updatedTop[1], rowPinned: 'top' })
            );
            await new GridRows(api, 'after remove and reorder').check(`
                PINNED_TOP id:5 athlete:"Charles" sport:"new sport 0" age:22
                PINNED_TOP id:3 athlete:"Jake" sport:"new sport 1" age:14
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('rows are cleared on setting undefined rowData', async () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs, pinnedTopRowData: topData });

            assertPinnedRowData(topData, 'top');
            await new GridRows(api, 'initial').check(`
                PINNED_TOP id:t-0 athlete:"Top Athlete" sport:"Top Sport" age:11
                ROOT id:ROOT_NODE_ID
            `);

            api.setGridOption('pinnedTopRowData', undefined);
            assertPinnedRowData([], 'top');
            await new GridRows(api, 'after clear').check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('cannot render duplicate rows with getRowId', () => {
            const consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
            const getRowId = vitest.fn((p) => JSON.stringify(p.data));
            gridsManager.createGrid('myGrid', { columnDefs, pinnedTopRowData: topData.concat(topData), getRowId });

            assertPinnedRowData(topData, 'top', ['t-0']);
            expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
            expect(consoleWarnSpy).toHaveBeenLastCalledWith(
                'AG Grid: warning #96',
                'Duplicate ID',
                JSON.stringify(topData[0]),
                'found for pinned row with data',
                topData[0],
                'When `getRowId` is defined, it must return unique IDs for all pinned rows. Use the `rowPinned` parameter.',
                expect.stringContaining(
                    `/javascript-data-grid/errors/96?_version_=${VERSION}&id=%7B%22athlete%22%3A%22Top+Athlete%22%2C%22sport%22%3A%22Top+Sport%22%2C%22age%22%3A11%7D&data=%7B%22athlete%22%3A%22Top+Athlete%22%2C%22sport%22%3A%22Top+Sport%22%2C%22age%22%3A11%7D`
                )
            );
            consoleWarnSpy.mockRestore();
        });
    });

    describe('bottom', () => {
        test('are shown', async () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs, pinnedBottomRowData: bottomData });

            assertPinnedRowData(bottomData, 'bottom');
            await new GridRows(api, 'pinned bottom rows').check(`
                ROOT id:ROOT_NODE_ID
                PINNED_BOTTOM id:b-0 athlete:"Bottom Athlete" sport:"Bottom Sport" age:22
            `);
        });

        test('are shown then updated', async () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs, pinnedBottomRowData: bottomData });

            assertPinnedRowData(bottomData, 'bottom');
            await new GridRows(api, 'initial').check(`
                ROOT id:ROOT_NODE_ID
                PINNED_BOTTOM id:b-0 athlete:"Bottom Athlete" sport:"Bottom Sport" age:22
            `);

            const updatedBottom = [{ athlete: 'Updated Bottom Athlete', sport: 'Updated Bottom Sport', age: 33 }];
            api.setGridOption('pinnedBottomRowData', updatedBottom);
            assertPinnedRowData(updatedBottom, 'bottom');
            await new GridRows(api, 'after update').check(`
                ROOT id:ROOT_NODE_ID
                PINNED_BOTTOM id:b-1 athlete:"Updated Bottom Athlete" sport:"Updated Bottom Sport" age:33
            `);
        });

        test('are shown then updated with getRowId', async () => {
            const getRowId = vitest.fn((p) => p.data.athlete);

            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                pinnedBottomRowData: bottomData,
                getRowId,
            });

            expect(getRowId).toHaveBeenLastCalledWith(
                expect.objectContaining({ data: bottomData[0], rowPinned: 'bottom' })
            );

            assertPinnedRowData(bottomData, 'bottom');
            await new GridRows(api, 'initial').check(`
                ROOT id:ROOT_NODE_ID
                PINNED_BOTTOM id:"Bottom Athlete" athlete:"Bottom Athlete" sport:"Bottom Sport" age:22
            `);

            const updatedBottom = [{ athlete: 'Updated Bottom Athlete', sport: 'Updated Bottom Sport', age: 33 }];
            api.setGridOption('pinnedBottomRowData', updatedBottom);
            assertPinnedRowData(updatedBottom, 'bottom');

            expect(getRowId).toHaveBeenLastCalledWith(
                expect.objectContaining({ data: updatedBottom[0], rowPinned: 'bottom' })
            );
            await new GridRows(api, 'after update').check(`
                ROOT id:ROOT_NODE_ID
                PINNED_BOTTOM id:"Updated Bottom Athlete" athlete:"Updated Bottom Athlete" sport:"Updated Bottom Sport" age:33
            `);
        });

        test('row data with matching ID is correctly updated', async () => {
            const getRowId = vitest.fn((p) => p.data.id);
            const pinnedBottomRowData = [{ id: '3', athlete: 'Jake', sport: 'Top sport', age: 11 }];

            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                pinnedBottomRowData,
                getRowId,
            });

            assertPinnedRowData(pinnedBottomRowData, 'bottom');
            expect(getRowId).toHaveBeenLastCalledWith(
                expect.objectContaining({ data: pinnedBottomRowData[0], rowPinned: 'bottom' })
            );
            await new GridRows(api, 'initial').check(`
                ROOT id:ROOT_NODE_ID
                PINNED_BOTTOM id:3 athlete:"Jake" sport:"Top sport" age:11
            `);

            const updatedBottom = [
                { id: '3', athlete: 'Peter', sport: 'Updated bottom sport', age: 12 },
                { id: '4', athlete: 'Victor', sport: 'new sport', age: 22 },
            ];

            api.setGridOption('pinnedBottomRowData', updatedBottom);

            assertPinnedRowData(updatedBottom, 'bottom');
            expect(getRowId).toHaveBeenLastCalledWith(
                expect.objectContaining({ data: updatedBottom[1], rowPinned: 'bottom' })
            );
            await new GridRows(api, 'after update').check(`
                ROOT id:ROOT_NODE_ID
                PINNED_BOTTOM id:3 athlete:"Peter" sport:"Updated bottom sport" age:12
                PINNED_BOTTOM id:4 athlete:"Victor" sport:"new sport" age:22
            `);
        });

        test('row data with matching ID is correctly updated with a new row order', async () => {
            const getRowId = vitest.fn((p) => p.data.id);
            const pinnedBottomRowData = [{ id: '3', athlete: 'Jake', sport: 'Top sport', age: 11 }];

            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                pinnedBottomRowData,
                getRowId,
            });

            assertPinnedRowData(pinnedBottomRowData, 'bottom');
            expect(getRowId).toHaveBeenLastCalledWith(
                expect.objectContaining({ data: pinnedBottomRowData[0], rowPinned: 'bottom' })
            );
            await new GridRows(api, 'initial').check(`
                ROOT id:ROOT_NODE_ID
                PINNED_BOTTOM id:3 athlete:"Jake" sport:"Top sport" age:11
            `);

            const updatedBottom = [
                { id: '4', athlete: 'Victor', sport: 'new sport', age: 22 },
                { id: '3', athlete: 'Peter', sport: 'Updated bottom sport', age: 12 },
            ];

            api.setGridOption('pinnedBottomRowData', updatedBottom);

            assertPinnedRowData(updatedBottom, 'bottom');
            expect(getRowId).toHaveBeenLastCalledWith(
                expect.objectContaining({ data: updatedBottom[1], rowPinned: 'bottom' })
            );
            await new GridRows(api, 'after reorder').check(`
                ROOT id:ROOT_NODE_ID
                PINNED_BOTTOM id:4 athlete:"Victor" sport:"new sport" age:22
                PINNED_BOTTOM id:3 athlete:"Peter" sport:"Updated bottom sport" age:12
            `);
        });

        test('remove and re-order rows', async () => {
            const getRowId = vitest.fn((p) => p.data.id);
            const pinnedBottomRowData = [
                { id: '3', athlete: 'Jake', sport: 'Bottom sport 0', age: 11 },
                { id: '4', athlete: 'Peter', sport: 'Bottom sport 1', age: 12 },
                { id: '5', athlete: 'Victor', sport: 'Bottom sport 2', age: 22 },
            ];

            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                pinnedBottomRowData,
                getRowId,
            });

            assertPinnedRowData(pinnedBottomRowData, 'bottom', ['b-0', 'b-1', 'b-2']);
            expect(getRowId).toHaveBeenLastCalledWith(
                expect.objectContaining({ data: pinnedBottomRowData[2], rowPinned: 'bottom' })
            );
            await new GridRows(api, 'initial').check(`
                ROOT id:ROOT_NODE_ID
                PINNED_BOTTOM id:3 athlete:"Jake" sport:"Bottom sport 0" age:11
                PINNED_BOTTOM id:4 athlete:"Peter" sport:"Bottom sport 1" age:12
                PINNED_BOTTOM id:5 athlete:"Victor" sport:"Bottom sport 2" age:22
            `);

            const updatedBottom = [
                { id: '5', athlete: 'Charles', sport: 'new sport 0', age: 22 },
                { id: '3', athlete: 'Jake', sport: 'new sport 1', age: 14 },
            ];

            api.setGridOption('pinnedBottomRowData', updatedBottom);

            assertPinnedRowData(updatedBottom, 'bottom', ['b-0', 'b-1']);
            expect(getRowId).toHaveBeenLastCalledWith(
                expect.objectContaining({ data: updatedBottom[1], rowPinned: 'bottom' })
            );
            await new GridRows(api, 'after remove and reorder').check(`
                ROOT id:ROOT_NODE_ID
                PINNED_BOTTOM id:5 athlete:"Charles" sport:"new sport 0" age:22
                PINNED_BOTTOM id:3 athlete:"Jake" sport:"new sport 1" age:14
            `);
        });

        test('rows are cleared on setting undefined rowData', async () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs, pinnedBottomRowData: bottomData });

            assertPinnedRowData(bottomData, 'bottom');
            await new GridRows(api, 'initial').check(`
                ROOT id:ROOT_NODE_ID
                PINNED_BOTTOM id:b-0 athlete:"Bottom Athlete" sport:"Bottom Sport" age:22
            `);

            api.setGridOption('pinnedBottomRowData', undefined);
            assertPinnedRowData([], 'bottom');
            await new GridRows(api, 'after clear').check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('cannot render duplicate rows with getRowId', () => {
            const consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
            const getRowId = vitest.fn((p) => JSON.stringify(p.data));
            gridsManager.createGrid('myGrid', {
                columnDefs,
                pinnedBottomRowData: bottomData.concat(bottomData),
                getRowId,
            });

            assertPinnedRowData(bottomData, 'bottom', ['b-0']);
            expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
            expect(consoleWarnSpy).toHaveBeenLastCalledWith(
                'AG Grid: warning #96',
                'Duplicate ID',
                JSON.stringify(bottomData[0]),
                'found for pinned row with data',
                bottomData[0],
                'When `getRowId` is defined, it must return unique IDs for all pinned rows. Use the `rowPinned` parameter.',
                expect.stringContaining(
                    `/javascript-data-grid/errors/96?_version_=${VERSION}&id=%7B%22athlete%22%3A%22Bottom+Athlete%22%2C%22sport%22%3A%22Bottom+Sport%22%2C%22age%22%3A22%7D&data=%7B%22athlete%22%3A%22Bottom+Athlete%22%2C%22sport%22%3A%22Bottom+Sport%22%2C%22age%22%3A22%7D`
                )
            );
            consoleWarnSpy.mockRestore();
        });
    });
});
