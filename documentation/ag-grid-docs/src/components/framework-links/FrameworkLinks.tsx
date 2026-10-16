import { useFramework } from '@utils/hooks/useFramework';
import { hrefForFramework } from '@utils/hrefForFramework';
import { useEffect } from 'react';
import type { FunctionComponent } from 'react';

interface Props {
    /** Docs page slugs whose links follow the visitor's framework, eg `['community-vs-enterprise']`. */
    pageNames: string[];
}

/**
 * Re-points every link on the page to a framework docs page, in AG Grid or AG Charts, at the
 * visitor's selected framework, for links in static content that can't pick a framework
 * themselves: Markdown FAQ answers and copy written as HTML. Those links are built against the
 * default framework, which is what crawlers and visitors with no selection get, and move to the
 * selected framework once hydrated, as the header's Docs and API links do.
 *
 * Charts links need nothing more than the framework in their path: AG Charts is served from the
 * same origin on production, so it reads the same stored selection.
 *
 * Render it as a late island (`client:idle`) so the content it edits has hydrated first, and
 * hydration doesn't find links that differ from the server-rendered HTML.
 */
export const FrameworkLinks: FunctionComponent<Props> = ({ pageNames }) => {
    const { framework } = useFramework();
    const pageNamesKey = pageNames.join();

    useEffect(() => {
        for (const pageName of pageNamesKey.split(',')) {
            document.querySelectorAll<HTMLAnchorElement>(`a[href*="/${pageName}/"]`).forEach((link) => {
                const href = link.getAttribute('href')!;
                const frameworkHref = hrefForFramework({ href, pageName, framework });

                if (frameworkHref !== href) {
                    link.setAttribute('href', frameworkHref);
                }
            });
        }
    }, [framework, pageNamesKey]);

    return null;
};
