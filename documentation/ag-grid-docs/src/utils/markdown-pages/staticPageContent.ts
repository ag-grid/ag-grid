import { LICENSE_INSTALL_REDIRECT_PAGE } from '@components/docs/constants';

/**
 * Page metadata for the small pages whose copy would otherwise live only inside their `.astro`
 * files — the two framework-redirect stubs, the theme builder and the HTML sitemap.
 *
 * Shared with their markdown twins (`/reference.md`, `/licensing.md`, `/theme-builder.md`,
 * `/sitemap.md`) so the title and description cannot drift between the two renderings.
 */
export const STATIC_PAGE_CONTENT = {
    reference: {
        title: 'AG Grid: API Reference',
        description:
            'View the AG Grid API Reference Documentation - a feature-rich datagrid for major JavaScript frameworks, offering filtering, grouping, pivoting, and more.',
        heading: 'AG Grid API Reference',
        /** Docs page each framework variant redirects to. */
        redirectPageName: 'reference',
    },
    licensing: {
        title: 'AG Grid: Licensing',
        description: 'Installing Your Licence Key',
        heading: 'AG Grid Licensing',
        redirectPageName: LICENSE_INSTALL_REDIRECT_PAGE,
    },
    'theme-builder': {
        title: 'AG Grid Theme Builder',
        description:
            'Easily build and customise themes for AG Grid with our interactive tool. Use our templates or create your own style from scratch. Export styles to AG Grid compatible themes.',
        heading: 'AG Grid Theme Builder',
    },
    sitemap: {
        title: 'Sitemap | AG Grid',
        description: 'The AG Grid sitemap. Contains links to every page on the site, including docs.',
        heading: 'Sitemap',
    },
} as const;
