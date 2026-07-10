import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // 10,000 rows grouped by city then laptop, filtered to value > 50.
    // Delhi and Seoul are open by default (isGroupOpenByDefault).
    test.eachFramework('Grouped data renders with the default open groups', async ({ agIdFor }) => {
        await expect(agIdFor.autoGroupCell('row-group-city-Delhi')).toContainText('Delhi', { useInnerText: true });
        await expect(agIdFor.autoGroupCell('row-group-city-Seoul')).toContainText('Seoul', { useInnerText: true });
        await expect(agIdFor.autoGroupCell('row-group-city-Tokyo')).toContainText('Tokyo', { useInnerText: true });
    });

    test.eachFramework('Collapsed city groups can be expanded and collapsed again', async ({ agIdFor }) => {
        // Tokyo is collapsed by default.
        await expect(agIdFor.autoGroupContracted('row-group-city-Tokyo')).toBeVisible();

        // Expanding it reveals its nested laptop sub-groups.
        await agIdFor.autoGroupContracted('row-group-city-Tokyo').click();
        await expect(agIdFor.autoGroupExpanded('row-group-city-Tokyo')).toBeVisible();

        // Collapsing it again restores the contracted state.
        await agIdFor.autoGroupExpanded('row-group-city-Tokyo').click();
        await expect(agIdFor.autoGroupContracted('row-group-city-Tokyo')).toBeVisible();
    });
});
