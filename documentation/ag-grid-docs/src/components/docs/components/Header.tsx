import type { Framework, MenuItem } from '@ag-grid-types';
import { Icon } from '@ag-website-shared/components/icon/Icon';
import { MarkdownActions } from '@ag-website-shared/components/markdown-actions/MarkdownActions';
import { FrameworkSelectorInsideDocs } from '@components/framework-selector-inside-doc/FrameworkSelectorInsideDocs';
import { getFrameworkDisplayText } from '@utils/framework';
import { useSyncFrameworkStoreState } from '@utils/hooks/useSyncFrameworkStoreState';
import type { FunctionComponent } from 'react';

import styles from './Header.module.scss';

interface Props {
    title: string;
    framework: Framework;
    isEnterprise?: boolean;
    suppressFrameworkHeader?: boolean;
    path: string;
    menuItems: MenuItem[];
    version?: string;
    markdownHref?: string;
}

export const Header: FunctionComponent<Props> = ({
    title,
    framework,
    isEnterprise,
    suppressFrameworkHeader,
    path,
    menuItems,
    version,
    markdownHref,
}) => {
    // Update framework store so it is in sync with the page
    // Done here, because it's run on all docs pages
    useSyncFrameworkStoreState(framework);

    return (
        <header className={styles.docsPageHeader}>
            <div id="top" className={styles.docsPageTitle}>
                <div className={styles.pageTitleContainer}>
                    {/* The framework name must stay inside the h1 to count towards it for SEO. The version
                        must stay outside it, or it would read as part of the heading too — it only sits
                        beside the framework name because the h1 is `display: contents`, which lets the two
                        be laid out together from different parents. `data-page-title` is how the Algolia
                        indexer finds the page title within the heading. */}
                    <h1 className={styles.pageTitle}>
                        {!suppressFrameworkHeader && (
                            <span className={styles.headerFramework}>
                                {`${getFrameworkDisplayText(framework)} Data Grid`}
                            </span>
                        )}
                        <span className={styles.titleText} data-page-title>
                            {title}
                        </span>
                    </h1>

                    {version && <span className={styles.version}>{`Version ${version}`}</span>}

                    <div className={styles.headerActions}>
                        {markdownHref && <MarkdownActions markdownHref={markdownHref} framework={framework} />}
                        <div className={styles.frameworkSelectorSlot}>
                            <FrameworkSelectorInsideDocs
                                path={path}
                                currentFramework={framework}
                                menuItems={menuItems}
                            />
                        </div>
                    </div>
                </div>

                {isEnterprise && (
                    <span className={styles.enterpriseLabel}>
                        Enterprise
                        <Icon name="enterprise" />
                    </span>
                )}
            </div>
        </header>
    );
};
