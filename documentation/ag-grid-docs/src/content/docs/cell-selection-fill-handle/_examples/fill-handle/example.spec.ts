import { dragFillHandleOverTo, expect, gridApiHandle, gridEventLog, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.describe('Fill Handle', () => {
        test.eachFramework('should fill cells when dragging fill handle down', async ({ agIdFor }) => {
            const source = agIdFor.cell('0', 'athlete');
            const target = agIdFor.cell('1', 'athlete');

            await expect(source).toHaveText('Natalie Coughlin');
            await expect(target).toHaveText('Aleksey Nemov');

            await source.click();

            const fillHandle = agIdFor.fillHandle();
            await expect(fillHandle).toBeVisible();

            await dragFillHandleOverTo(fillHandle, target);

            await expect(source).toHaveText('Natalie Coughlin');
            await expect(target).toHaveText('Natalie Coughlin');
        });

        test.vanilla('Drag Doubleclick', async ({ page, agIdFor }) => {
            const api = await gridApiHandle(page, '1');

            await api.evaluate((api) =>
                api.updateGridOptions({
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
                })
            );

            const log = await gridEventLog(page, '1');
            await log.record('cellValueChanged', ['newValue', 'oldValue', 'source']);

            const cells = [0, 1, 2, 3].map((i) => agIdFor.cell(`${i}`, 'athlete'));
            const [source, target] = cells;

            await source.click();

            await dragFillHandleOverTo(source, target);

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

            await expect.poll(async () => (await log.entries()).length).toBe(2);
            expect(await log.entries()).toEqual([
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
