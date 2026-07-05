import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Custom props switch the icon renderer', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Row 0 = SpaceX / CRS SpX-25, successful === true (small-space-mission-data.json)
        await expect(agIdFor.cell('0', 'company')).toContainText('SpaceX');

        // Default MissionResultRenderer uses the ag-grid tick-in-circle icon
        await expect(agIdFor.cell('0', 'successful').locator('img.missionIcon')).toHaveAttribute(
            'src',
            /tick-in-circle/
        );

        // The second column overrides the icon source via cellRendererParams.src => svg-icons/tick.svg
        await expect(agIdFor.cell('0', 'successful_1').locator('img.missionIcon')).toHaveAttribute(
            'src',
            /svg-icons\/tick\.svg/
        );

        // CustomButtonComponent renders "Launch {company}!" using the custom onClick prop
        await expect(agIdFor.cell('0', 'actions')).toContainText('Launch SpaceX!');
    });

    test.eachFramework('Refresh Data re-renders the mission icons', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'Refresh Data' }).click();

        // After the refresh the cells re-render and still show a mission icon (tick or cross)
        await expect(agIdFor.cell('0', 'successful').locator('img.missionIcon')).toHaveAttribute('src', /(tick|cross)/);
    });
});
