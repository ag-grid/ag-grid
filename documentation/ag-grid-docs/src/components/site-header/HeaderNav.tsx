import type { MenuItem } from '@ag-grid-types';
import { SITE_BASE_URL } from '@constants';
import styles from '@design-system/modules/HeaderNav.module.scss';
import siteHeaderStyles from '@design-system/modules/SiteHeader.module.scss';
import { getPageNameFromPath } from '@features/docs/utils/urlPaths';
import MenuIcon from '@images/inline-svgs/menu-icon.svg?react';
import { pathJoin } from '@utils/pathJoin';
import classnames from 'classnames';
import { type ReactElement, useState } from 'react';

import { DarkModeToggle } from './DarkModeToggle';
import { Collapsible } from '../Collapsible';
import { Icon } from '../icon/Icon';

/**
 * Title of api header menu
 */
const API_TITLE = 'API';

const getIsActiveNav = ({
    title,
    path,
    allPaths,
    apiPaths,
}: {
    title: string;
    path: string;
    allPaths: MenuItem[];
    apiPaths: string[];
}): boolean => {
    const allPathsMatch = allPaths.find((link) => path.includes(link.path!));
    const currentNavItem = allPathsMatch?.title;

    const pageName = getPageNameFromPath(path);
    const isApiPage = apiPaths.includes(pageName);

    const checkTitle = isApiPage ? API_TITLE : currentNavItem;
    return title === checkTitle;
};

const HeaderLinks = ({
    currentPath,
    items,
    allPaths,
    apiPaths,
    isOpen,
    toggleIsOpen,
    children,
}: {
    currentPath: string;
    items: MenuItem[];
    allPaths: MenuItem[];
    apiPaths: string[];
    isOpen?: boolean;
    toggleIsOpen?: () => void;
    children: ReactElement;
}) => {
    return (
        <ul className={classnames(siteHeaderStyles.navItemList, 'list-style-none')}>
            {items.map(({ title, path, url, icon }) => {
                const linkClasses = classnames(siteHeaderStyles.navItem, {
                    [siteHeaderStyles.navItemActive]: getIsActiveNav({ title, path: currentPath, allPaths, apiPaths }),
                    [siteHeaderStyles.buttonItem]: title === 'Github',
                    [siteHeaderStyles.githubItem]: title === 'Github',
                });
                const href = path ? pathJoin(SITE_BASE_URL, path) : url;

                return (
                    <li key={title.toLocaleLowerCase()} className={linkClasses}>
                        <a
                            className={siteHeaderStyles.navLink}
                            href={href}
                            onClick={() => {
                                if (isOpen) {
                                    toggleIsOpen && toggleIsOpen();
                                }
                            }}
                            aria-label={`AG Grid ${title}`}
                        >
                            {icon && <Icon name={icon} />}
                            <span>{title}</span>
                        </a>
                    </li>
                );
            })}

            
            <DarkModeToggle />
            
            {children}
        </ul>
    );
};

const HeaderExpandButton = ({ isOpen, toggleIsOpen }: { isOpen: boolean; toggleIsOpen: () => void }) => (
    <button
        className={siteHeaderStyles.mobileMenuButton}
        type="button"
        aria-controls={styles.mainNavSmall}
        aria-expanded={isOpen}
        aria-label="Toggle navigation"
        onClick={() => toggleIsOpen()}
    >
        <MenuIcon className={siteHeaderStyles.menuIcon} />
    </button>
);

const HeaderNavLarge = ({
    currentPath,
    items,
    allPaths,
    apiPaths,
    children,
}: {
    currentPath: string;
    items: MenuItem[];
    allPaths: MenuItem[];
    apiPaths: string[];
    children: ReactElement;
}) => {
    return (
        <div className={classnames(siteHeaderStyles.mainNav, styles.mainNavLargeContainer)}>
            <nav className={styles.mainNavLarge}>
                <HeaderLinks currentPath={currentPath} items={items} allPaths={allPaths} apiPaths={apiPaths}>
                    {children}
                </HeaderLinks>
            </nav>
        </div>
    );
};

const HeaderNavSmall = ({
    currentPath,
    items,
    allPaths,
    apiPaths,
    isOpen,
    toggleIsOpen,
    children,
}: {
    currentPath: string;
    items: MenuItem[];
    allPaths: MenuItem[];
    apiPaths: string[];
    isOpen: boolean;
    toggleIsOpen: () => void;
    children: ReactElement;
}) => {
    return (
        <>
            <HeaderExpandButton isOpen={isOpen} toggleIsOpen={toggleIsOpen} />
            <Collapsible id={styles.mainNavSmall} isOpen={isOpen}>
                <nav className={siteHeaderStyles.mainNav}>
                    <HeaderLinks
                        currentPath={currentPath}
                        items={items}
                        allPaths={allPaths}
                        apiPaths={apiPaths}
                        isOpen={isOpen}
                        toggleIsOpen={toggleIsOpen}
                    >
                        {children}
                    </HeaderLinks>
                </nav>
            </Collapsible>
        </>
    );
};

export const HeaderNav = ({
    currentPath,
    items,
    allPaths,
    apiPaths,
    children,
}: {
    currentPath: string;
    items: MenuItem[];
    allPaths: MenuItem[];
    apiPaths: string[];
    children: ReactElement;
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleIsOpen = () => {
        setIsOpen((currentIsOpen) => {
            return !currentIsOpen;
        });
    };

    return (
        <>
            <HeaderNavLarge currentPath={currentPath} items={items} allPaths={allPaths} apiPaths={apiPaths}>
                {children}
            </HeaderNavLarge>
            <HeaderNavSmall
                currentPath={currentPath}
                items={items}
                allPaths={allPaths}
                apiPaths={apiPaths}
                isOpen={isOpen}
                toggleIsOpen={toggleIsOpen}
            >
                {children}
            </HeaderNavSmall>
        </>
    );
};
