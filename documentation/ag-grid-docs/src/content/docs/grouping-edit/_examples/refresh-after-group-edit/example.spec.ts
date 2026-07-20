import { expect, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Grouped by department then team, both editable via a select editor. refreshAfterGroupEdit
    // with getRowId re-evaluates the grouping after every committed edit, moving the edited row
    // into its new group immediately. groupDefaultExpanded: -1 renders every group expanded.
    const frontend = 'row-group-department-Engineering-team-Frontend';
    const backend = 'row-group-department-Engineering-team-Backend';

    test.eachFramework('rows start grouped under their department and team', async ({ page, agIdFor }) => {
        await waitForGridContent(page);

        // Frontend has Alice + Bob (2); Backend has Carol + Dave (2). Counts show in the auto column.
        await expect(agIdFor.autoGroupCell(frontend)).toContainText('Frontend', { useInnerText: true });
        await expect(agIdFor.autoGroupCell(frontend)).toContainText('(2)', { useInnerText: true });
        await expect(agIdFor.autoGroupCell(backend)).toContainText('(2)', { useInnerText: true });

        // Alice (row id '1') sits in the Frontend team.
        await expect(agIdFor.cell('1', 'team')).toContainText('Frontend');
    });

    test.eachFramework('editing a row team moves it to the correct group instantly', async ({ page, agIdFor }) => {
        await waitForGridContent(page);

        // Edit Alice's team from Frontend to Backend using the select editor. Focus the cell and
        // press Enter so the agSelectCellEditor opens its option list automatically.
        const teamCell = agIdFor.cell('1', 'team');
        await teamCell.click();
        await page.keyboard.press('Enter');
        const backendOption = page.getByRole('option', { name: 'Backend', exact: true });
        await expect(backendOption).toBeVisible();
        await backendOption.click();
        await waitForRowAnimations(page);

        // The row now carries the new team and has moved: Frontend drops to 1, Backend rises to 3.
        await expect(agIdFor.cell('1', 'team')).toContainText('Backend');
        await expect(agIdFor.autoGroupCell(frontend)).toContainText('(1)', { useInnerText: true });
        await expect(agIdFor.autoGroupCell(backend)).toContainText('(3)', { useInnerText: true });
    });
});
