import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'Update buttons bump the version only on rows matching the predicate',
        async ({ agIdFor, page }) => {
            await waitForGridContent(page);

            // getRowId is `${athlete}-${date}`, so rows have stable, content-derived ids.
            const phelps2008 = agIdFor.cell('Michael Phelps-24/08/2008', 'version');
            const phelps2004 = agIdFor.cell('Michael Phelps-29/08/2004', 'version');
            const nemov = agIdFor.cell('Aleksey Nemov-01/10/2000', 'version');

            // Every loaded row starts on the initial server version.
            await expect(phelps2008).toContainText('0 - 0 - 0');
            await expect(phelps2004).toContainText('0 - 0 - 0');
            await expect(nemov).toContainText('0 - 0 - 0');

            // Update a single athlete+date pair — only that row's version changes.
            await page.getByRole('button', { name: 'Update Michael Phelps, 29/08/2004' }).click();
            await expect(phelps2004).toContainText('1 - 1 - 1');
            await expect(phelps2008).toContainText('0 - 0 - 0');
            await expect(nemov).toContainText('0 - 0 - 0');

            // Update all rows for an athlete — every Michael Phelps row changes, others do not.
            await page.getByRole('button', { name: 'Update All Michael Phelps Records' }).click();
            await expect(phelps2008).toContainText('2 - 2 - 2');
            await expect(phelps2004).toContainText('2 - 2 - 2');
            await expect(nemov).toContainText('0 - 0 - 0');
        }
    );
});
