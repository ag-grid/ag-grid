import type { IconName } from '@ag-website-shared/components/icon/Icon';

/**
 * Copy and links for the contact page, shared between `ContactPage.astro` and its markdown twin
 * (`@ag-website-shared/markdown-pages/buildContactMarkdown`) so the two cannot drift.
 */
export const CONTACT_CONTENT = {
    title: 'Contact AG Grid: Get in Touch with Our Team',
    description:
        'Have questions or need assistance? Contact the AG Grid team for support, licensing, or any other inquiries.',
    eyebrow: 'Get in touch',
    headline: 'Contact Us',
    subhead: 'Get help with pricing, explore use cases, understand how our products can help you, and more.',
    /** Structured-data name for the page. */
    structuredDataName: 'Contact AG Grid',
} as const;

export interface ContactSocialLink {
    label: string;
    /** Falls back to the label; only needed where the label alone is not self-describing. */
    ariaLabel?: string;
    icon: IconName;
    url: string;
}

const CONTACT_SOCIAL_LINKS: ContactSocialLink[] = [
    { label: 'X', ariaLabel: 'X (Twitter)', icon: 'xLogo', url: 'https://x.com/ag_grid' },
    { label: 'YouTube', icon: 'youtube', url: 'https://youtube.com/c/aggrid' },
    { label: 'LinkedIn', icon: 'linkedin', url: 'https://linkedin.com/company/ag-grid' },
];

export const GITHUB_URL_BY_LIBRARY = {
    charts: 'https://github.com/ag-grid/ag-charts',
    grid: 'https://github.com/ag-grid/ag-grid',
} as const;

export function contactGithubUrl(library: string): string {
    return library === 'charts' ? GITHUB_URL_BY_LIBRARY.charts : GITHUB_URL_BY_LIBRARY.grid;
}

/** Social links shown beside the contact form, in display order. GitHub differs per product. */
export function contactSocialLinks(library: string): ContactSocialLink[] {
    return [{ label: 'GitHub', icon: 'github', url: contactGithubUrl(library) }, ...CONTACT_SOCIAL_LINKS];
}
