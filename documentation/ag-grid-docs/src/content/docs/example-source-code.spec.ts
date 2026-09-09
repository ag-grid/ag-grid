import { expect, test } from '@playwright/test';

// Docs pages embed a hidden, build-time copy of each example's source so crawlers can index it.
// The example runner island then removes that copy and shows the same files behind its Code button.
// Both halves matter: the raw HTML has to carry the code, and the page a user sees must not carry
// it twice or show anything a crawler could not.

// The HTML embeds the TypeScript variant, matching the markdown twin page. A first visit to a React
// page shows the JavaScript variant in the code viewer (the docs default), so the two main files differ.
const PAGES = [
    {
        path: 'react-data-grid/aggregation/',
        exampleName: 'aggregation-overview',
        embeddedMainFile: 'index.tsx',
        viewerMainFile: 'index.jsx',
    },
    {
        path: 'javascript-data-grid/aggregation/',
        exampleName: 'aggregation-overview',
        embeddedMainFile: 'main.ts',
        viewerMainFile: 'main.ts',
    },
];

test.describe('Example source embedded for crawlers', () => {
    for (const { path, exampleName, embeddedMainFile, viewerMainFile } of PAGES) {
        test(`${path} serves the ${exampleName} source in its HTML`, async ({ request, baseURL }) => {
            const response = await request.get(new URL(path, baseURL).href);
            expect(response.ok()).toBe(true);
            const html = await response.text();

            const panel = html.match(
                new RegExp(
                    `<div id="example-${exampleName}"[\\s\\S]*?<div class="example-runner-source-code"[^>]*>([\\s\\S]*?)</div>`
                )
            );
            expect(panel, 'hidden source panel inside the example container').not.toBeNull();

            const panelHtml = panel![0];
            expect(panelHtml).toContain(' hidden');
            expect(panelHtml).toContain(`<figcaption>${embeddedMainFile}</figcaption>`);
            expect(panelHtml).toContain(`<code data-file-name="${embeddedMainFile}">`);
            // Aggregation overview groups and aggregates the Olympic winners data
            expect(panelHtml).toContain('aggFunc');
            // Test specs and the generator's harness are not part of what the Code button shows
            expect(panelHtml).not.toContain('data-file-name="example.spec.');
            expect(panelHtml).not.toContain('DARK INTEGRATED');
        });

        test(`${path} shows the same ${exampleName} source behind the Code button`, async ({ page }) => {
            await page.goto(path);

            const container = page.locator(`#example-${exampleName}`);
            // `exact`, so the CodeSandbox button in the same footer cannot match
            const codeButton = container.getByRole('button', { name: 'Code', exact: true });
            await expect(codeButton).toBeVisible();
            // The island owns the code viewer once mounted, so the build-time copy is gone
            await expect(container.locator('[data-example-source-code]')).toHaveCount(0);

            await codeButton.click();
            await expect(container.getByRole('button', { name: viewerMainFile })).toBeVisible();
            await expect(container.locator('pre.code')).toContainText('aggFunc');
        });
    }
});
