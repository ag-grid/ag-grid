import { dragOverTo, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.describe('Fill Handle', () => {
        test.vanilla('Drag Fill', async ({ page, remoteGrid, agIdFor }) => {
            const remoteApi = remoteGrid(page, '1');

            await remoteApi.updateGridOptions({
                columnDefs: [
                    {
                        field: 'athlete',
                        editable: true,
                    },
                ],
                cellSelection: {
                    handle: {
                        mode: 'fill',
                    },
                },
            });

            const source = agIdFor.cell('0', 'athlete');
            const target = agIdFor.cell('1', 'athlete');

            await source.click();

            const fillHandle = agIdFor.fillHandle();

            await dragOverTo(fillHandle, target);

            await expect(source).toHaveText('Natalie Coughlin');
            await expect(target).toHaveText('Natalie Coughlin');
        });

        test.vanilla('Drag Doubleclick', async ({ page, agIdFor, remoteGrid }) => {
            const remoteApi = remoteGrid(page, '1');

            await remoteApi.updateGridOptions({
                columnDefs: [
                    {
                        field: 'athlete',
                        editable: true,
                    },
                ],
                cellSelection: {
                    handle: {
                        mode: 'fill',
                    },
                },
                rowData: [
                    { athlete: 'Natalie Coughlin' },
                    { athlete: 'Aleksey Nemov' },
                    { athlete: 'Alicia Coutts' },
                    { athlete: 'Missy Franklin' },
                ],
            });

            await remoteApi.logEvent('cellValueChanged', ['newValue', 'oldValue', 'source']);

            const cells = [0, 1, 2, 3].map((i) => agIdFor.cell(`${i}`, 'athlete'));
            const [source, target] = cells;

            await source.click();

            await dragOverTo(source, target);

            const fillHandle = agIdFor.fillHandle();

            await expect(cells[0]).toHaveText('Natalie Coughlin');
            await expect(cells[1]).toHaveText('Aleksey Nemov');
            await expect(cells[2]).toHaveText('Alicia Coutts');
            await expect(cells[3]).toHaveText('Missy Franklin');

            await fillHandle.dblclick();

            await expect(cells[0]).toHaveText('Natalie Coughlin');
            await expect(cells[1]).toHaveText('Aleksey Nemov');
            await expect(cells[2]).toHaveText('Natalie Coughlin');
            await expect(cells[3]).toHaveText('Aleksey Nemov');

            const eventLog = await remoteGrid.waitForEventlog(250);

            expect(eventLog.length).toBe(2);
            expect(eventLog).toEqual([
                [
                    'cellValueChanged',
                    {
                        newValue: 'Natalie Coughlin',
                        oldValue: 'Alicia Coutts',
                        source: 'rangeSvc',
                    },
                ],
                [
                    'cellValueChanged',
                    {
                        newValue: 'Aleksey Nemov',
                        oldValue: 'Missy Franklin',
                        source: 'rangeSvc',
                    },
                ],
            ]);
        });
    });
});
