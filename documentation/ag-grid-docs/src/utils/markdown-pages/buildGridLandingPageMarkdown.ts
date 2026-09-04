import type {
    BuildLandingPageMarkdownOptions,
    LandingPageVersion,
} from '@ag-website-shared/markdown-pages/landing-pages/buildLandingPageMarkdown';
import { buildLandingPageMarkdown } from '@ag-website-shared/markdown-pages/landing-pages/buildLandingPageMarkdown';
import { getFrameworkFromInternalFramework } from '@utils/framework';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import { urlWithPrefix } from '@utils/urlWithPrefix';

import { gridSiteFrontmatter } from './gridFrontmatter';

/**
 * Bind the shared landing-page markdown builder to AG Grid's URL helpers. Kept separate from the
 * endpoint so it is free of `astro:content` and therefore unit-testable against the real
 * landing-page JSON (see buildGridLandingPageMarkdown.test.ts).
 */
export function buildGridLandingPageMarkdown({
    content,
    versions,
    siteRoot,
}: {
    content: BuildLandingPageMarkdownOptions['content'];
    versions?: LandingPageVersion[];
    siteRoot?: string;
}): string {
    const framework = getFrameworkFromInternalFramework(content.internalFramework);

    return buildLandingPageMarkdown({
        content,
        versions,
        siteRoot,
        // Section CTAs, feature links and example links store './'-prefixed paths that already
        // carry the framework segment, so resolve them the way the page does — with the base-URL
        // helper, not urlWithPrefix.
        resolveUrl: urlWithBaseUrl,
        // FAQ answers are Markdoc rendered per-framework by renderFAQAnswers, so their './' links
        // are framework-relative and need the prefixing helper to land on the right docs page.
        resolveFaqUrl: (url) => urlWithPrefix({ framework, url }),
        // No pageUrl: the SEO landing pages are not listed in the footer, so they carry the
        // product and llms.txt fields but no related links.
        siteFrontmatter: gridSiteFrontmatter({ siteRoot }),
    });
}
