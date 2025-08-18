import { dragOverTo, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.describe('Bulk Edit', () => {
        test.vanilla('F2', async ({ page, agIdFor, remoteGrid }) => {
            const remoteApi = remoteGrid(page, '1');

            await remoteApi.updateGridOptions({
                columnDefs: [
                    {
                        field: 'athlete',
                        editable: true,
                    },
                ],
            });

            const source = agIdFor.cell('0', 'athlete');
            const target = agIdFor.cell('1', 'athlete');

            await dragOverTo(source, target);

            await source.press('F2');
            await page.keyboard.type(' test');
            await page.keyboard.press('Control+Enter');

            await expect(source).toHaveText('Natalie Coughlin test');
            await expect(target).toHaveText('Natalie Coughlin test');
        });

        test.vanilla('Typing', async ({ page, agIdFor, remoteGrid }) => {
            const remoteApi = remoteGrid(page, '1');

            await remoteApi.updateGridOptions({
                columnDefs: [
                    {
                        field: 'athlete',
                        editable: true,
                    },
                ],
            });

            const source = agIdFor.cell('0', 'athlete');
            const target = agIdFor.cell('1', 'athlete');

            await dragOverTo(source, target);

            await page.keyboard.press('t');
            await page.waitForTimeout(10);
            await page.keyboard.type('est');
            await page.keyboard.press('Control+Enter');

            await expect(source).toHaveText('test');
            await expect(target).toHaveText('test');
        });
    });
});
