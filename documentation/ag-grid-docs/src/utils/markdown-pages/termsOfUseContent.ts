import type { PolicyContent } from '@ag-website-shared/components/policies/policyContent';

/**
 * Prose for the Terms of Use page that lives outside its `.mdoc` body — the heading, the
 * last-updated line and the intro paragraph. Shared with the `/terms-of-use.md` twin so the two
 * cannot drift. The numbered body is `src/content/policies/terms-of-use.mdoc`.
 *
 * Grid-only, unlike the policies in `@ag-website-shared`: the terms cover the ag-grid.com site.
 */
export const TERMS_OF_USE_CONTENT: PolicyContent = {
    heading: 'AG Grid Terms of Use',
    metaTitle: 'Terms of Use',
    description:
        'The terms and conditions that govern your use of the AG Grid website, including the software, services and materials made available through it.',
    meta: ['Last Updated: 8 September 2026'],
    intro: ['Welcome to the Terms of Use for our website.'],
};
