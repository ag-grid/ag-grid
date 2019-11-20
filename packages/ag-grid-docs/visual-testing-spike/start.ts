import { launch, Page, Browser } from 'puppeteer';
import { runSuite, Spec } from './visual-testing-engine';

const specs: Spec[] = [
    {
        name: 'demo',
        autoRtl: true,
        viewport: {
            width: 1800,
            height: 1000
        },
        steps: [
            {
                name: 'default'
            },
            {
                name: 'column-menu',
                prepare: async page => {
                    await page.click('.ag-header-cell-menu-button');
                    await page.click('.ag-menu-option');
                }
            },
            {
                name: 'filter-tool-panel',
                prepare: async page => {
                    await page.click('.ag-side-button:nth-child(2)');
                }
            }
        ]
    }
];

(async () => {
    await runSuite({
        folder: './compare/dev',
        mode: 'update',
        specs,
        themes: ['alpine', 'balham', 'material', 'fresh']
    });
})();
