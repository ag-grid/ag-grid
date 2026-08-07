import { expect, test } from '@utils/grid/test-utils';

import { GROUP_AUTO_COLUMN_ID } from 'ag-grid-community';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor, page, remoteGrid }) => {
        const remoteApi = remoteGrid(page, '1');

        // Grouped by the `athlete` object, keyed by `id`, displayed via the `name` valueFormatter.
        // Usain Bolt (id 1) has three leaf rows in the data.
        const boltGroupId = 'row-group-athlete-1';

        // Group row shows the formatted name (not the raw object) with its child count.
        await expect(agIdFor.autoGroupCell(boltGroupId)).toContainText('Usain Bolt (3)', { useInnerText: true });

        // Groups are collapsed by default: expand the Usain Bolt group.
        await agIdFor.groupContracted(boltGroupId, GROUP_AUTO_COLUMN_ID).click();
        await expect(agIdFor.autoGroupExpanded(boltGroupId)).toBeVisible();

        // Leaf rows for that athlete are now revealed (all from Jamaica).
        await expect(agIdFor.cell('0', 'country')).toContainText('Jamaica');
        await expect(agIdFor.cell('0', 'year')).toContainText('2008');

        // A different athlete grouped by a distinct id (Michael Phelps, id 2).
        await expect(agIdFor.autoGroupCell('row-group-athlete-2')).toContainText('Michael Phelps (3)', {
            useInnerText: true,
        });

        // AG-18094: removing then re-adding the row group re-runs `keyCreator`/`valueFormatter`
        // against the (re-created) group rows, which have no leaf `athlete` value of their own -
        // this is the reproduction path for the callbacks dereferencing `params.value` directly.
        await remoteApi.removeRowGroupColumns(['athlete']);
        await remoteApi.addRowGroupColumns(['athlete']);
        await expect(agIdFor.autoGroupCell(boltGroupId)).toContainText('Usain Bolt (3)', { useInnerText: true });
    });
});
