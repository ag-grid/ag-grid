import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // 10,000 rows grouped by city then laptop, filtered to value > 50.
    // Delhi and Seoul are open by default (isGroupOpenByDefault).
    //
    // The city groups render in reverse insertion order, so Tokyo, Delhi and Jakarta
    // sit at the very bottom of the ~35 rendered rows. A short viewport (e.g. Firefox's
    // default) virtualises the bottom groups out of the DOM, so make the viewport tall
    // enough to mount every group before asserting.
    test.eachFramework('Grouped data renders with the default open groups', async ({ agIdFor, page }) => {
        await page.setViewportSize({ width: 1280, height: 1600 });
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.autoGroupCell('row-group-city-Delhi')).toContainText('Delhi', { useInnerText: true });
        await expect(agIdFor.autoGroupCell('row-group-city-Seoul')).toContainText('Seoul', { useInnerText: true });
        await expect(agIdFor.autoGroupCell('row-group-city-Tokyo')).toContainText('Tokyo', { useInnerText: true });
    });

    test.eachFramework('Initialisation reports the work done loading the data', async ({ page }) => {
        const logs: string[] = [];
        const handler = (msg: { type: () => string; text: () => string }) => {
            if (msg.type() === 'log') {
                logs.push(msg.text());
            }
        };
        page.on('console', handler);

        // The log is emitted during load, so reload with the listener already attached.
        await page.reload();
        await ensureGridReady(page);
        await waitForGridContent(page);

        let initialisation: string | undefined;
        await expect(() => {
            initialisation = logs.find((l) => l.startsWith('Initialisation finished in'));
            expect(initialisation).toBeDefined();
        }).toPass();
        page.off('console', handler);

        const countOf = (name: string) => Number(initialisation!.match(new RegExp(`${name} = (\\d+)`))![1]);

        // 19 cities x 8 laptops, plus the 19 city groups and the root.
        expect(countOf('aggCallCount')).toBe(171);
        // One filter pass per row, over 10,000 rows.
        expect(countOf('filterCallCount')).toBeGreaterThanOrEqual(10000);
        expect(countOf('compareCallCount')).toBeGreaterThan(1000);
    });

    test.eachFramework('Collapsed city groups can be expanded and collapsed again', async ({ agIdFor, page }) => {
        await page.setViewportSize({ width: 1280, height: 1600 });
        await ensureGridReady(page);
        await waitForGridContent(page);

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
