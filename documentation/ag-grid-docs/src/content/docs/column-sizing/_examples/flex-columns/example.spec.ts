import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Column Flex Behavior', async ({ page, agIdFor }) => {
        // Set viewport size to ensure consistent column sizing
        await page.setViewportSize({ width: 800, height: 400 });

        // Check that cells contain width measurements (indicated by 'px' text)
        await expect(agIdFor.cell('0', 'a')).toContainText('300px');
        await expect(agIdFor.cell('0', 'b')).toContainText('311px');
        await expect(agIdFor.cell('0', 'c')).toContainText('155px');
        await expect(agIdFor.cell('1', 'a')).toContainText('Total width: 766px');
    });

    test.eachFramework('Column B Min/Max Width Constraints', async ({ page, agIdFor }) => {
        // Flexing ration
        await page.setViewportSize({ width: 800, height: 400 });
        await expect(agIdFor.cell('0', 'b')).toContainText('311px');

        // Check min width constraint
        await page.setViewportSize({ width: 500, height: 400 });
        await expect(agIdFor.cell('0', 'b')).toContainText('200px');

        // Check max width constraint
        await page.setViewportSize({ width: 1200, height: 400 });
        await expect(agIdFor.cell('0', 'b')).toContainText('350px');
    });
});
