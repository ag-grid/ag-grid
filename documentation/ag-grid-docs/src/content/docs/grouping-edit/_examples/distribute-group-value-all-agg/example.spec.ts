import { expect, test, waitForGridContent } from '@utils/grid/test-utils';
import type { Locator, Page } from 'playwright/test';

test.agExample(import.meta, () => {
    // Grouped by department then team. Each column uses a different distribution strategy:
    // salary (sum -> uniform), bonus (avg -> overwrite), projects (no aggFunc -> overwrite).
    // groupDefaultExpanded: -1 renders every group expanded.
    const engineering = 'row-group-department-Engineering';
    const frontend = 'row-group-department-Engineering-team-Frontend';

    // Double-click a group cell, replace its value, and commit with Enter.
    const editGroupCell = async (page: Page, cell: Locator, value: string) => {
        await cell.dblclick();
        const editor = cell.locator('input');
        await expect(editor).toBeVisible();
        await editor.fill('');
        await page.keyboard.type(value);
        await page.keyboard.press('Enter');
        await expect(editor).toHaveCount(0);
    };

    test.eachFramework('group rows aggregate each column per its aggFunc', async ({ page, agIdFor }) => {
        await waitForGridContent(page);

        // salary is summed: Frontend = 90 + 85 + 78 = 253;
        // Engineering = Frontend 253 + Backend 265 + QA 145 = 663.
        await expect(agIdFor.cell(frontend, 'salary').first()).toHaveText('253');
        await expect(agIdFor.cell(engineering, 'salary').first()).toHaveText('663');

        // bonus is averaged: Frontend = (15 + 12 + 10) / 3 = 12.33 (formatted to 2 dp).
        await expect(agIdFor.cell(frontend, 'bonus').first()).toHaveText('12.33');

        // projects has no aggFunc, so the group cell is blank but still editable.
        await expect(agIdFor.cell(frontend, 'projects').first()).toHaveText('');
    });

    test.eachFramework('editing a summed column divides the total uniformly', async ({ page, agIdFor }) => {
        await waitForGridContent(page);

        // Edit Frontend salary to 300 -> uniform distribution, precision 0 -> 100 per child.
        await editGroupCell(page, agIdFor.cell(frontend, 'salary').first(), '300');

        await expect(agIdFor.cell('1', 'salary')).toHaveText('100');
        await expect(agIdFor.cell('2', 'salary')).toHaveText('100');
        await expect(agIdFor.cell('3', 'salary')).toHaveText('100');
        await expect(agIdFor.cell(frontend, 'salary').first()).toHaveText('300');
    });

    test.eachFramework('editing an averaged column overwrites every child', async ({ page, agIdFor }) => {
        await waitForGridContent(page);

        // avg default strategy is 'overwrite': editing the group average to 20 sets every
        // child's bonus to 20, so the re-aggregated average is also 20.
        await editGroupCell(page, agIdFor.cell(frontend, 'bonus').first(), '20');

        await expect(agIdFor.cell('1', 'bonus')).toHaveText('20.00');
        await expect(agIdFor.cell('2', 'bonus')).toHaveText('20.00');
        await expect(agIdFor.cell('3', 'bonus')).toHaveText('20.00');
        await expect(agIdFor.cell(frontend, 'bonus').first()).toHaveText('20.00');
    });

    test.eachFramework('editing a non-aggregated column overwrites every child', async ({ page, agIdFor }) => {
        await waitForGridContent(page);

        // projects has no aggFunc, so distribution defaults to 'overwrite'.
        await editGroupCell(page, agIdFor.cell(frontend, 'projects').first(), '9');

        await expect(agIdFor.cell('1', 'projects')).toHaveText('9');
        await expect(agIdFor.cell('2', 'projects')).toHaveText('9');
        await expect(agIdFor.cell('3', 'projects')).toHaveText('9');
    });
});
