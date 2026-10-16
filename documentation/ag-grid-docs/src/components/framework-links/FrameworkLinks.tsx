import { useFramework } from '@utils/hooks/useFramework';
import { hrefForFramework } from '@utils/hrefForFramework';
import { useEffect } from 'react';
import type { FunctionComponent } from 'react';

/** Marks a link, in AG Grid or AG Charts, that should follow the visitor's framework. */
export const FRAMEWORK_LINK_ATTRIBUTE = 'data-framework-link';

/**
 * Re-points every link marked with `data-framework-link` at the visitor's selected framework, for
 * links in static content that can't pick a framework themselves: Markdown FAQ answers (links
 * authored as `./page`, which `transformMarkdoc` marks) and copy written as HTML. Those links are
 * built against the default framework, which is what crawlers and visitors with no selection get,
 * and move to the selected framework once hydrated, as the header's Docs and API links do. Links
 * that are not marked, such as ones that name a framework on purpose, are left alone.
 *
 * Charts links need nothing more than the framework in their path: AG Charts is served from the
 * same origin on production, so it reads the same stored selection.
 *
 * Render it as a late island (`client:idle`) so the content it edits has hydrated first, and
 * hydration doesn't find links that differ from the server-rendered HTML.
 */
export const FrameworkLinks: FunctionComponent = () => {
    const { framework } = useFramework();

    useEffect(() => {
        document.querySelectorAll<HTMLAnchorElement>(`a[${FRAMEWORK_LINK_ATTRIBUTE}]`).forEach((link) => {
            const href = link.getAttribute('href')!;
            const frameworkHref = hrefForFramework({ href, framework });

            if (frameworkHref !== href) {
                link.setAttribute('href', frameworkHref);
            }
        });
    }, [framework]);

    return null;
};
