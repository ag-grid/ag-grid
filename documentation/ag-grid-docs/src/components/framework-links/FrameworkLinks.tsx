import { useFramework } from '@utils/hooks/useFramework';
import { hrefForFramework } from '@utils/hrefForFramework';
import { useEffect } from 'react';
import type { FunctionComponent } from 'react';

interface Props {
    /** Docs page slug whose links follow the visitor's framework, eg `community-vs-enterprise`. */
    pageName: string;
}

/**
 * Re-points every link on the page to a framework docs page at the visitor's selected framework,
 * for links in static content that can't pick a framework themselves: Markdown FAQ answers and
 * copy written as HTML. Those links are built against the default framework, which is what
 * crawlers and visitors with no selection get, and move to the selected framework once hydrated,
 * as the header's Docs and API links do.
 *
 * Render it as a late island (`client:idle`) so the content it edits has hydrated first, and
 * hydration doesn't find links that differ from the server-rendered HTML.
 */
export const FrameworkLinks: FunctionComponent<Props> = ({ pageName }) => {
    const { framework } = useFramework();

    useEffect(() => {
        const links = document.querySelectorAll<HTMLAnchorElement>(`a[href*="-data-grid/${pageName}/"]`);

        links.forEach((link) => {
            link.setAttribute('href', hrefForFramework({ href: link.getAttribute('href')!, pageName, framework }));
        });
    }, [framework, pageName]);

    return null;
};
