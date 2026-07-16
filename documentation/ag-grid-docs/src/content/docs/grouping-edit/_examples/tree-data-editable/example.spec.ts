import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Editing a tree parent budget cascades equally to children', async ({ page, agIdFor }) => {
        // Tree data: departments contain teams, teams contain employees. Budget uses aggFunc
        // 'sum' with groupRowEditable. Editing a parent's budget distributes the new total
        // equally among its children (precision 0), recursing through the hierarchy.
        const engineering = 'Engineering';
        const frontend = 'Frontend';
        const dave = 'Dave (DevOps)';

        await waitForGridContent(page);

        // Engineering is the aggregated sum of all descendants:
        // Frontend (85000+92000+78000=255000) + Backend (95000+88000=183000) + Dave 90000.
        const engBudget = agIdFor.cell(engineering, 'budget').first();
        await expect(engBudget).toHaveText('528000');
        await expect(agIdFor.cell(frontend, 'budget').first()).toHaveText('255000');

        // Edit Engineering's budget to 300000. Uniform distribution divides it equally among
        // its 3 immediate children (Frontend, Backend, Dave) = 100000 each.
        await engBudget.dblclick();
        const editor = engBudget.locator('input');
        await expect(editor).toBeVisible();
        await editor.fill('');
        await page.keyboard.type('300000');
        await page.keyboard.press('Enter');
        await expect(editor).toHaveCount(0);

        // Parent re-aggregates to the edited total; children share it equally, cascading down.
        await expect(engBudget).toHaveText('300000');
        await expect(agIdFor.cell(frontend, 'budget').first()).toHaveText('100000');
        await expect(agIdFor.cell(dave, 'budget').first()).toHaveText('100000');
    });
});
