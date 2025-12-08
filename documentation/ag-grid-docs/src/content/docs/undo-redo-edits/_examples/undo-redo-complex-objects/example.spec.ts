import { dragOverTo, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.describe('Events', () => {
        test.eachFramework(`Copydown`, async ({ page, remoteGrid, agIdFor }) => {
            const remoteApi = remoteGrid(page, '1');

            await remoteApi.logEvent('cellValueChanged', ['newValue', 'oldValue', 'source']);

            const cells = [1, 2, 3, 4].map((i) => agIdFor.cell(`${i}`, 'a'));
            const [source, target] = cells;

            await source.click();

            await dragOverTo(source, target);

            const fillHandle = agIdFor.fillHandle();

            await expect(cells[0]).toHaveText('a-1');
            await expect(cells[1]).toHaveText('a-2');
            await expect(cells[2]).toHaveText('a-3');
            await expect(cells[3]).toHaveText('a-4');

            await fillHandle.dblclick();

            await expect(cells[0]).toHaveText('a-1');
            await expect(cells[1]).toHaveText('a-2');
            await expect(cells[2]).toHaveText('a-1');
            await expect(cells[3]).toHaveText('a-2');

            const eventLog = await remoteGrid.waitForEventlog(250);

            expect(eventLog.length).toBe(97);
            expect(eventLog.slice(0, 2)).toEqual([
                [
                    'cellValueChanged',
                    {
                        newValue: {
                            actualValueA: 'a-1',
                            anotherPropertyA: 'a',
                        },
                        oldValue: {
                            actualValueA: 'a-3',
                            anotherPropertyA: 'a',
                        },
                        source: 'rangeSvc',
                    },
                ],
                [
                    'cellValueChanged',
                    {
                        newValue: {
                            actualValueA: 'a-2',
                            anotherPropertyA: 'a',
                        },
                        oldValue: {
                            actualValueA: 'a-4',
                            anotherPropertyA: 'a',
                        },
                        source: 'rangeSvc',
                    },
                ],
            ]);
        });
    });
});
