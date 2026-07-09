import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('floating pinned rows use pinnedRowBackgroundColor', async ({ page }) => {
        await waitForGridContent(page);

        const { pinned, expected, base } = await page.evaluate(() => {
            // Resolve colours through the browser so the comparison is agnostic to
            // how the engine serialises color-mix (rgb() vs color(srgb ...)).
            const resolve = (color: string) => {
                const probe = document.createElement('div');
                probe.style.backgroundColor = color;
                document.querySelector('.ag-root-wrapper')!.appendChild(probe);
                const resolved = getComputedStyle(probe).backgroundColor;
                probe.remove();
                return resolved;
            };

            return {
                pinned: Array.from(document.querySelectorAll('.ag-row-pinned')).map(
                    (row) => getComputedStyle(row).backgroundColor
                ),
                expected: resolve('color-mix(in srgb, var(--ag-background-color), #ffeb3b 18%)'),
                base: resolve('var(--ag-background-color)'),
            };
        });

        // Sanity: the override is a genuinely different colour to the normal row background.
        expect(expected).not.toBe(base);

        expect(pinned.length).toBeGreaterThan(0);
        for (const background of pinned) {
            expect(background).toBe(expected);
        }
    });
});
