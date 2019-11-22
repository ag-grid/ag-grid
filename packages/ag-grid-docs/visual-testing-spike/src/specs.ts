import { SpecDefinition } from './types';
import { wait, dragFromTo } from './utils';

export const specs: SpecDefinition[] = [
    {
        name: 'demo',
        autoRtl: true,
        defaultViewport: { width: 1000, height: 600 },
        steps: [
            {
                name: 'column-tool-panel',
                viewport: { width: 600, height: 1000 },
                prepare: async page => {
                    await page.click('.ag-side-button:nth-child(1)');
                }
            },
            {
                name: 'filter-tool-panel',
                viewport: { width: 600, height: 1000 },
                prepare: async page => {
                    await page.click('.ag-side-button:nth-child(2)');
                }
            },
            {
                name: 'default',
                viewport: { width: 2000, height: 1000 },
                prepare: async page => {
                    await page.click('.ag-side-button:nth-child(2)');
                }
            },
            {
                name: 'column-menu',
                prepare: async page => {
                    await page.click('.ag-header-cell-menu-button');
                    await page.click('.ag-menu-option');
                }
            }
        ]
    },
    {
        exampleSection: 'column-header',
        exampleId: 'text-orientation'
    },
    {
        exampleSection: 'column-header',
        exampleId: 'header-tooltip',
        steps: [
            {
                name: 'default',
                prepare: async page => {
                    await page.hover('.ag-header-cell:nth-child(3)');
                    await wait(2000);
                }
            }
        ]
    },
    {
        exampleSection: 'column-header',
        exampleId: 'header-template',
        exampleType: 'vanilla',
        community: true,
        selector: '.ag-header'
    },
    {
        exampleSection: 'grouping-headers',
        exampleId: 'advanced-grouping',
        community: true,
        selector: '.ag-header'
    },
    {
        exampleSection: 'column-moving',
        exampleId: 'moving-simple',
        community: true,
        steps: [
            {
                name: 'drag-column',
                prepare: async page => {
                    await dragFromTo({
                        page,
                        from: '.ag-header-cell:nth-child(3)',
                        to: '.ag-header-cell:nth-child(4)',
                        leaveMouseDown: true
                    });
                }
            }
        ]
    },
    {
        exampleSection: 'pinning',
        exampleId: 'column-pinning',
        community: true
    },
    {
        exampleSection: 'full-width-rows',
        exampleId: 'simple-full-width',
        community: true
    },
    {
        exampleSection: 'row-spanning',
        exampleId: 'row-spanning-complex',
        community: true
    },
    {
        exampleSection: 'row-height',
        exampleId: 'row-height-complex',
        community: true
    },
    {
        exampleSection: 'row-height',
        exampleId: 'auto-row-height',
        community: true,
        steps: [
            {
                name: 'default',
                prepare: async () => {
                    await wait(2000);
                }
            }
        ],
        defaultViewport: {
            width: 400,
            height: 2000
        }
    },
    {
        exampleSection: 'icons',
        exampleId: 'icons',
        urlParams: {
            fontawesome: 1
        },
        community: true
    },
    {
        exampleSection: 'for-print',
        exampleId: 'for-print-complex',
        community: true,
        defaultViewport: { width: 800, height: 1000 },
        steps: [
            {
                name: 'default',
                prepare: async page => {
                    await page.click('button'); // first button on page is "Printer Friendly Layout"
                }
            }
        ]
    },
    {
        exampleSection: 'selection',
        exampleId: 'group-selection',
        community: true,
        defaultViewport: {width: 1200, height: 400},
        steps: [
            {
                name: 'default',
                prepare: async page => {
                    // support either native checkboxes or old-style ones
                    await page.click('.ag-row:nth-child(1) .ag-icon-checkbox-unchecked, .ag-row:nth-child(1) input[type="checkbox"]');
                    await page.click('.ag-row:nth-child(3) .ag-icon-checkbox-unchecked, .ag-row:nth-child(3) input[type="checkbox"]');
                }
            }
        ]
    },
    {
        exampleSection: 'range-selection',
        exampleId: 'range-selection-advanced',
        defaultViewport: { width: 1200, height: 800 },
        steps: [
            {
                name: 'default',
                prepare: async page => {
                    await dragFromTo({
                        page,
                        from: '.ag-row:nth-child(3) .ag-cell:nth-child(1)',
                        to: '.ag-row:nth-child(6) .ag-cell:nth-child(8)'
                    });
                    await page.keyboard.down('Meta');
                    await dragFromTo({
                        page,
                        from: '.ag-row:nth-child(1) .ag-cell:nth-child(3)',
                        to: '.ag-row:nth-child(8) .ag-cell:nth-child(6)'
                    });
                    await page.keyboard.up('Meta');
                }
            }
        ]
    }
];
