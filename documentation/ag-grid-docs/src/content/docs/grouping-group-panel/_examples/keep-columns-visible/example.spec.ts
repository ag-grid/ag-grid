import { expect, test } from '@utils/grid/test-utils';

type SuppressValue = 'false' | 'true' | 'suppressHideOnGroup' | 'suppressShowOnUngroup';

interface Case {
    value: SuppressValue;
    hiddenAfterGroup: boolean;
    hiddenAfterUngroup: boolean;
}

// The four combinations documented for `suppressGroupChangesColumnVisibility`,
// plus the default `'false'`. After grouping the column should be hidden unless
// hiding is suppressed; after ungrouping it should be visible again unless
// showing is suppressed.
const cases: Case[] = [
    { value: 'false', hiddenAfterGroup: true, hiddenAfterUngroup: false },
    { value: 'true', hiddenAfterGroup: false, hiddenAfterUngroup: false },
    { value: 'suppressHideOnGroup', hiddenAfterGroup: false, hiddenAfterUngroup: false },
    { value: 'suppressShowOnUngroup', hiddenAfterGroup: true, hiddenAfterUngroup: true },
];

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor, page, remoteGrid }) => {
        const remoteApi = remoteGrid(page, '1');
        const dropdown = page.locator('#visibility-behaviour');
        const resetButton = page.getByRole('button', { name: 'Reset Column Visibility' });
        const countryHeader = agIdFor.headerCell('country');

        await expect(countryHeader).toBeVisible();

        for (const { value, hiddenAfterGroup, hiddenAfterUngroup } of cases) {
            await dropdown.selectOption(value);

            await remoteApi.addRowGroupColumns(['country']);
            if (hiddenAfterGroup) {
                await expect(countryHeader, `${value}: country header should be hidden after grouping`).toBeHidden();
            } else {
                await expect(
                    countryHeader,
                    `${value}: country header should stay visible after grouping`
                ).toBeVisible();
            }

            await remoteApi.removeRowGroupColumns(['country']);
            if (hiddenAfterUngroup) {
                await expect(
                    countryHeader,
                    `${value}: country header should stay hidden after ungrouping`
                ).toBeHidden();
            } else {
                await expect(
                    countryHeader,
                    `${value}: country header should be visible again after ungrouping`
                ).toBeVisible();
            }

            // Reset replaces `columnDefs` with all columns visible and ungrouped,
            // giving each case a clean starting state.
            await resetButton.click();
            await expect(countryHeader).toBeVisible();
        }
    });
});
