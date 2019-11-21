import { Spec } from "./types";


export const specs: Spec[] = [
    {
        name: 'demo',
        // autoRtl: true,
        defaultViewport: { width: 1000, height: 800 },
        steps: [
            {
                name: 'column-tool-panel',
                prepare: async page => {
                    await page.click('.ag-side-button:nth-child(1)');
                }
            },
            {
                name: 'filter-tool-panel',
                prepare: async page => {
                    await page.click('.ag-side-button:nth-child(2)');
                }
            },
            {
                name: 'default',
                viewport: { width: 2000, height: 1000 },
                prepare: async page => {
                    page.click('.ag-side-button:nth-child(2)')
                }
            },
            {
                name: 'column-menu',
                prepare: async page => {
                    await page.click('.ag-header-cell-menu-button');
                    await page.click('.ag-menu-option');
                }
            },
        ]
    }
];