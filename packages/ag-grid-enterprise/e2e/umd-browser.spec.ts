import { expect, test } from '@playwright/test';
import path from 'node:path';

const distDir = path.join(__dirname, '..', 'dist');

const UMD_FILES = {
    styles: 'ag-grid-enterprise.js',
    stylesMin: 'ag-grid-enterprise.min.js',
    noStyles: 'ag-grid-enterprise.noStyle.js',
    noStylesMin: 'ag-grid-enterprise.min.noStyle.js',
};

const STYLE_FILES: string[] = [UMD_FILES.styles, UMD_FILES.stylesMin];

for (const [, filename] of Object.entries(UMD_FILES)) {
    const hasStyles = STYLE_FILES.includes(filename);

    test(`${filename} — grid renders and ${hasStyles ? 'includes' : 'excludes'} legacy CSS`, async ({ page }) => {
        await page.setContent('<!DOCTYPE html><html><head></head><body><div id="myGrid"></div></body></html>');

        const scriptPath = path.join(distDir, filename);
        await page.addScriptTag({ path: scriptPath });

        // Check legacy CSS injection before grid creation (createGrid replaces legacy styles with Theming API styles)
        const legacyStyleCount = await page.evaluate(
            () => document.querySelectorAll('style[data-ag-scope="legacy"]').length
        );

        if (hasStyles) {
            expect(legacyStyleCount).toBeGreaterThan(0);
        } else {
            expect(legacyStyleCount).toBe(0);
        }

        // Create grid
        await page.evaluate(() => {
            const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
            (window as any).agGrid.createGrid(gridDiv, {
                columnDefs: [{ field: 'name' }, { field: 'age' }],
                rowData: [
                    { name: 'Alice', age: 30 },
                    { name: 'Bob', age: 25 },
                    { name: 'Charlie', age: 35 },
                ],
            });
        });

        // Verify grid DOM structure
        await expect(page.locator('.ag-root-wrapper')).toBeVisible();

        const headerCells = page.locator('.ag-header-cell');
        await expect(headerCells).not.toHaveCount(0);

        const rows = page.locator('.ag-row');
        await expect(rows).not.toHaveCount(0);
    });
}
