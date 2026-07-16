import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('clicking chart series and legend fires standalone chart events', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // onFirstDataRendered auto-creates a grouped-column chart into the #myChart container.
        const canvas = page.locator('#myChart canvas').first();
        await expect(canvas).toBeVisible();

        const logs: string[] = [];
        page.on('console', (msg) => {
            if (msg.type() === 'log') {
                logs.push(msg.text());
            }
        });

        const box = (await canvas.boundingBox())!;
        expect(box).toBeTruthy();

        const clickAt = async (fx: number, fy: number) => {
            await page.mouse.click(box.x + box.width * fx, box.y + box.height * fy);
        };
        const seen = (needle: string) => logs.some((l) => l.includes(needle));

        // Columns are drawn on a canvas, so we scan across the plot area's x-axis clicking at a
        // few heights until we land on a bar and the standalone seriesNodeClick listener fires.
        for (let i = 0; i < 12 && !seen('seriesNodeClick'); i++) {
            const fx = 0.1 + (i / 12) * 0.8;
            for (const fy of [0.75, 0.6, 0.85]) {
                await clickAt(fx, fy);
                if (seen('seriesNodeClick')) {
                    break;
                }
            }
        }
        expect(seen('seriesNodeClick')).toBe(true);

        // The legend renders along the bottom of the chart. Scan across it to hit a legend item
        // and fire the standalone legendItemClick listener.
        for (let i = 0; i < 16 && !seen('legendItemClick'); i++) {
            const fx = 0.15 + (i / 16) * 0.7;
            for (const fy of [0.93, 0.9, 0.96, 0.88, 0.98, 0.85]) {
                await clickAt(fx, fy);
                if (seen('legendItemClick')) {
                    break;
                }
            }
        }
        expect(seen('legendItemClick')).toBe(true);
    });
});
