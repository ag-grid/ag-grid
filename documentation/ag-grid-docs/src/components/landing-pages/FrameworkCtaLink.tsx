import { Icon } from '@ag-website-shared/components/icon/Icon';
import { gridUrlWithPrefix } from '@ag-website-shared/utils/gridUrlWithPrefix';
import { useFramework } from '@utils/hooks/useFramework';
import type { FunctionComponent, ReactNode } from 'react';

interface Props {
    /** A './' path, resolved against the visitor's selected framework. */
    url: string;
    id?: string;
    className?: string;
    /** Append a chevron, which the caller's styles animate on hover. */
    withChevron?: boolean;
    children: ReactNode;
}

/**
 * A CTA link pointing at a framework-prefixed docs page, for use in the server-rendered parts of a
 * landing page. Renders against the default framework on the server and follows the visitor's
 * selection once hydrated, so it stays in step with the framework CTAs further down the page.
 */
export const FrameworkCtaLink: FunctionComponent<Props> = ({ url, id, className, withChevron, children }) => {
    const { framework } = useFramework();

    return (
        <a id={id} href={gridUrlWithPrefix({ framework, url })} className={className}>
            {children}
            {withChevron && <Icon name="chevronRight" />}
        </a>
    );
};
