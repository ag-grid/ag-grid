import { SpecDefinition } from './types';
import { wait, dragFromTo, cellSelector, untickCheckBoxWithin, tickCheckBoxWithin } from './utils';
import { toUnicode } from 'punycode';

export const specs: SpecDefinition[] = [
    {
        name: 'demo',
        autoRtl: true,
        defaultViewport: { width: 1000, height: 600 },
        steps: [
            {
                name: 'context-menu',
                prepare: async page => {
                    await page.click(cellSelector('language', 1), { button: 'right' });
                }
            },
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
                    await page.click('.ag-side-button:nth-child(2)');
                }
            },
            {
                name: 'edit-inline',
                prepare: async page => {
                    await page.click(cellSelector('language', 0), { clickCount: 2 });
                }
            },
            {
                name: 'edit-rich-select',
                viewport: { width: 800, height: 800 },
                prepare: async page => {
                    await page.click(cellSelector('country', 0));
                    await page.click(cellSelector('country', 0), { clickCount: 2 });
                    await page.hover('.ag-virtual-list-item:nth-child(4)');
                }
            }
        ]
    },
    {
        exampleSection: 'column-menu',
        exampleId: 'column-menu',
        defaultViewport: {
            width: 700,
            height: 450
        },
        steps: [
            {
                name: 'menu-tab',
                prepare: async page => {
                    await page.click('.ag-header-cell-menu-button');
                    await page.click('.ag-menu-option');
                }
            },
            {
                name: 'filter-tab',
                prepare: async page => {
                    await page.click('.ag-tab:nth-child(2)');
                    await untickCheckBoxWithin(page, '.ag-virtual-list-item:nth-child(2)');
                    await page.click('.ag-filter-filter');
                }
            },
            {
                name: 'columns-tab',
                prepare: async page => {
                    await page.click('.ag-tab:nth-child(3)');
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
                        from: '.ag-header-cell[col-id="age"]',
                        to: '.ag-header-cell[col-id="year"]',
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
        selector: 'body',
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
        defaultViewport: { width: 1200, height: 400 },
        steps: [
            {
                name: 'default',
                prepare: async page => {
                    await wait(1000); // data takes time to load
                    await tickCheckBoxWithin(page, cellSelector('ag-Grid-AutoColumn', 1));
                    await tickCheckBoxWithin(page, cellSelector('ag-Grid-AutoColumn', 3));
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
                        from: cellSelector(1, 3),
                        to: cellSelector(8, 6)
                    });
                    await page.keyboard.down('Meta');
                    await dragFromTo({
                        page,
                        from: cellSelector(3, 1),
                        to: cellSelector(6, 8)
                    });
                    await page.keyboard.up('Meta');
                }
            }
        ]
    },
    {
        exampleSection: 'charts-range-chart',
        exampleId: 'defining-categories-and-series',
        defaultViewport: {
            width: 500,
            height: 1200
        },
        selector: '.ag-chart',
        steps: [
            {
                name: 'settings-tab',
                prepare: async page => {
                    await page.click('.ag-chart-menu .ag-icon-menu');
                }
            },
            {
                name: 'data-tab',
                prepare: async page => {
                    await page.click('.ag-tab:nth-child(2)');
                }
            },
            {
                name: 'format-tab',
                prepare: async page => {
                    await page.click('.ag-tab:nth-child(3)');
                }
            },
            {
                name: 'format-tab-all-expanded',
                selector: '.ag-chart-format-wrapper',
                prepare: async page => {
                    await page.click('.ag-collapsed');
                    await page.click('.ag-collapsed');
                    await page.click('.ag-collapsed');
                    await page.click('.ag-collapsed');
                }
            }
        ]
    },
    {
        exampleSection: 'master-detail',
        exampleId: 'simple'
    },
    {
        exampleSection: 'tree-data',
        exampleId: 'file-browser',
        urlParams: {
            fontawesome: 1
        }
    },
    {
        exampleSection: 'status-bar',
        exampleId: 'status-bar-simple',
        steps: [
            {
                name: 'with-selection',
                prepare: async page => {
                    await dragFromTo({
                        page,
                        from: cellSelector('athlete', 0),
                        to: cellSelector('year', 3)
                    });
                }
            }
        ]
    },
    {
        exampleSection: 'overlays',
        exampleId: 'overlays',
        steps: [
            {
                name: 'show-overlay',
                prepare: async page => {
                    await page.click('button'); // first button is "Show Overlay"
                }
            }
        ]
    }
];
