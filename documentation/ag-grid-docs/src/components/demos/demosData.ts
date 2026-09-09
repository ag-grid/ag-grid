// Shared source for the demo tabs on /example (DemosTabs.astro) and the /example.md twin
// (buildExampleMarkdown.ts). Paths are root-relative and resolved with urlWithBaseUrl (HTML)
// or toAbsoluteUrl (markdown) at render time. `altLight`/`altDark` are kept distinct because
// the HR tab uses different alt text per image.
export interface DemoTab {
    key: 'complete' | 'finance' | 'crm' | 'inventory';
    label: string;
    href: string;
    github: string;
    imgLight: string;
    imgDark: string;
    altLight: string;
    altDark: string;
}

// The video tour of the demos. Linked from the header of every demo page and from the markdown
// twins, so the label and URL live here rather than being repeated per page.
export const VIDEO_TOUR_URL = 'https://youtu.be/bcMvTUVbMvI';
export const VIDEO_TOUR_TEXT = 'Video Tour';

export const demoTabs: DemoTab[] = [
    {
        key: 'complete',
        label: 'Performance',
        href: '/example/',
        github: 'https://github.com/ag-grid/ag-grid-demos/tree/main/performance',
        imgLight: '/example/performance.png',
        imgDark: '/example/performance-dark.png',
        altLight: 'Performance Grid illustration',
        altDark: 'Performance Grid illustration',
    },
    {
        key: 'finance',
        label: 'Finance',
        href: '/example-finance/',
        github: 'https://github.com/ag-grid/ag-grid-demos/tree/main/finance',
        imgLight: '/example/finance.png',
        imgDark: '/example/finance-dark.png',
        altLight: 'Finance Grid illustration',
        altDark: 'Finance Grid illustration',
    },
    {
        key: 'crm',
        label: 'HR',
        href: '/example-hr/',
        github: 'https://github.com/ag-grid/ag-grid-demos/tree/main/hr',
        imgLight: '/example/hr.png',
        imgDark: '/example/hr-dark.png',
        altLight: 'Grid illustration',
        altDark: 'HR Grid illustration',
    },
    {
        key: 'inventory',
        label: 'Inventory',
        href: '/example-inventory/',
        github: 'https://github.com/ag-grid/ag-grid-demos/tree/main/inventory',
        imgLight: '/example/inventory.png',
        imgDark: '/example/inventory-dark.png',
        altLight: 'Inventory Grid illustration',
        altDark: 'Inventory Grid illustration',
    },
];
