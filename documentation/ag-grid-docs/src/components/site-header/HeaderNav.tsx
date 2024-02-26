import type { MenuItem } from '@ag-grid-types';
import { SITE_BASE_URL } from '@constants';
import styles from '@design-system/modules/HeaderNav.module.scss';
import gridStyles from '@design-system/modules/SiteHeader.module.scss';
import MenuIcon from '@images/inline-svgs/menu-icon.svg?react';
import { pathJoin } from '@utils/pathJoin';
import classnames from 'classnames';
import { type ReactElement, useState } from 'react';

import { Collapsible } from '../Collapsible';
import { Icon } from '../icon/Icon';

const getCurrentPageName = ({ path, allPaths }: { path: string; allPaths: MenuItem[] }) => {
    const match = allPaths.find((link) => path.includes(link.path!));

    if (match) {
        return match.title;
    }
};

const HeaderLinks = ({
    currentPath,
    items,
    allPaths,
    isOpen,
    toggleIsOpen,
    children,
}: {
    currentPath: string;
    items: MenuItem[];
    allPaths: MenuItem[];
    isOpen?: boolean;
    toggleIsOpen?: () => void;
    children: ReactElement;
}) => {
    return (
        <ul className={classnames(gridStyles.navItemList, 'list-style-none')}>
            {items.map(({ title, path, url, icon }) => {
                const linkClasses = classnames(gridStyles.navItem, {
                    [gridStyles.navItemActive]: title === getCurrentPageName({ path: currentPath, allPaths }),
                    [gridStyles.buttonItem]: title === 'Github',
                    [gridStyles.githubItem]: title === 'Github',
                });
                const href = path ? pathJoin(SITE_BASE_URL, path) : url;

                return (
                    <li key={title.toLocaleLowerCase()} className={linkClasses}>
                        <a
                            className={gridStyles.navLink}
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

            {children}
        </ul>
    );
};

const HeaderExpandButton = ({ isOpen, toggleIsOpen }: { isOpen: boolean; toggleIsOpen: () => void }) => (
    <button
        className={gridStyles.mobileMenuButton}
        type="button"
        aria-controls={styles.mainNavSmall}
        aria-expanded={isOpen}
        aria-label="Toggle navigation"
        onClick={() => toggleIsOpen()}
    >
        <MenuIcon className={gridStyles.menuIcon} />
    </button>
);

const HeaderNavLarge = ({
    currentPath,
    items,
    allPaths,
    children,
}: {
    currentPath: string;
    items: MenuItem[];
    allPaths: MenuItem[];
    children: ReactElement;
}) => {
    return (
        <div className={classnames(gridStyles.mainNav, styles.mainNavLargeContainer)}>
            <nav className={styles.mainNavLarge}>
                <HeaderLinks currentPath={currentPath} items={items} allPaths={allPaths}>
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
    isOpen,
    toggleIsOpen,
    children,
}: {
    currentPath: string;
    items: MenuItem[];
    allPaths: MenuItem[];
    isOpen: boolean;
    toggleIsOpen: () => void;
    children: ReactElement;
}) => {
    return (
        <>
            <HeaderExpandButton isOpen={isOpen} toggleIsOpen={toggleIsOpen} />
            <Collapsible id={styles.mainNavSmall} isOpen={isOpen}>
                <nav className={gridStyles.mainNav}>
                    <HeaderLinks
                        currentPath={currentPath}
                        items={items}
                        allPaths={allPaths}
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
    children,
}: {
    currentPath: string;
    items: MenuItem[];
    allPaths: MenuItem[];
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
            <HeaderNavLarge currentPath={currentPath} items={items} allPaths={allPaths}>
                {children}
            </HeaderNavLarge>
            <HeaderNavSmall
                currentPath={currentPath}
                items={items}
                allPaths={allPaths}
                isOpen={isOpen}
                toggleIsOpen={toggleIsOpen}
            >
                {children}
            </HeaderNavSmall>
        </>
    );
};
