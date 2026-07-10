import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('postProcessPopup shifts the age menu down by 25px', async ({ agIdFor, page }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        // open the athlete menu (not repositioned) and record its top
        await agIdFor.headerCell('athlete').hover();
        await agIdFor.headerCellMenuButton('athlete').click();
        await expect(agIdFor.menu()).toBeVisible();
        const athleteTop = await agIdFor.menu().evaluate((el) => el.getBoundingClientRect().top);
        await page.keyboard.press('Escape');
        await expect(agIdFor.menu()).toHaveCount(0);

        // open the age menu (repositioned) and record its top
        await agIdFor.headerCell('age').hover();
        await agIdFor.headerCellMenuButton('age').click();
        await expect(agIdFor.menu()).toBeVisible();
        const ageTop = await agIdFor.menu().evaluate((el) => el.getBoundingClientRect().top);

        // the age menu is pushed 25px lower than a default-positioned menu
        expect(ageTop).toBeGreaterThan(athleteTop + 20);
    });
});
