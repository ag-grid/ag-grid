import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Data (data.ts) cycles category by i % 3 over 10 rows:
    // Sold => i 0,3,6,9 (4 rows); For Sale => i 1,4,7 (3 rows); In Workshop => i 2,5,8 (3 rows).
    test.eachFramework('Groups keep their row counts intact', async ({ agIdFor }) => {
        await expect(agIdFor.autoGroupCell('row-group-category-Sold')).toContainText('Sold (4)', {
            useInnerText: true,
        });
        await expect(agIdFor.autoGroupCell('row-group-category-For Sale')).toContainText('For Sale (3)', {
            useInnerText: true,
        });
        await expect(agIdFor.autoGroupCell('row-group-category-In Workshop')).toContainText('In Workshop (3)', {
            useInnerText: true,
        });
    });

    test.eachFramework('Add For Sale grows the For Sale group', async ({ agIdFor, page }) => {
        await expect(agIdFor.autoGroupCell('row-group-category-For Sale')).toContainText('For Sale (3)', {
            useInnerText: true,
        });

        await page.getByRole('button', { name: 'Add For Sale' }).click();

        await expect(agIdFor.autoGroupCell('row-group-category-For Sale')).toContainText('For Sale (4)', {
            useInnerText: true,
        });
    });
});
