import type { Framework, MenuSection } from '@ag-grid-types';
import type { MenuItem } from '@ag-grid-types';
import { Icon } from '@ag-website-shared/components/icon/Icon';
import { Collapsible } from '@components/Collapsible';
// TODO: Remove ag-grid menu styles
import gridStyles from '@legacy-design-system/modules/Menu.module.scss';
import styles from '@legacy-design-system/modules/PagesNavigation.module.scss';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import classnames from 'classnames';
import { Fragment, useEffect, useState } from 'react';

import {
    findActiveMenuItem,
    findActiveTopLevelMenuItem,
    getLinkUrl,
    toElementId,
} from '../utils/pageNavigationHelpers';

function EnterpriseIcon() {
    return (
        <span className={gridStyles.enterpriseIcon}>
            (e)
            <Icon name="enterprise" />
        </span>
    );
}

function CollapsibleNav({
    id,
    items,
    framework,
    isOpen,
    activeMenuItem,
    depth,
}: {
    id?: string;
    items: MenuItem[];
    framework: Framework;
    isOpen: boolean;
    activeMenuItem?: MenuItem;
    depth: number;
}) {
    return (
        <Collapsible id={id} isOpen={isOpen}>
            <ul className={classnames(gridStyles.menuGroup, 'list-style-none')}>
                {items.map((menuItem: any) => {
                    const { title, path, items, url, newWindow, icon, isEnterprise } = menuItem;
                    const linkUrl = getLinkUrl({ framework, path, url });
                    const isActive = activeMenuItem?.path === path;
                    const childId = `${title}-${path}`;

                    return items ? (
                        <MenuGroup
                            key={childId}
                            menuItem={menuItem}
                            framework={framework}
                            activeMenuItem={activeMenuItem}
                            // All sub nav menus (not top level) are open by default and can't be toggled open
                            isActive={true}
                            hideCollapsibleButton={true}
                            depth={depth + 1}
                        />
                    ) : (
                        <li key={childId}>
                            <a
                                href={linkUrl}
                                className={classnames({
                                    [gridStyles.activeMenuItem]: isActive,
                                })}
                                {...(newWindow && { target: '_blank' })}
                            >
                                {icon && (
                                    <Icon
                                        name={icon}
                                        svgClasses={classnames(styles.menuIcon, { [styles.activeMenuIcon]: isActive })}
                                    />
                                )}
                                {title}
                                {isEnterprise && <EnterpriseIcon />}
                                {newWindow && <Icon name="newTab" svgClasses={gridStyles.newTabIcon} />}
                            </a>
                        </li>
                    );
                })}
            </ul>
        </Collapsible>
    );
}

function MenuGroup({
    framework,
    menuItem,
    isActive,
    toggleActive,
    activeMenuItem,
    hideCollapsibleButton,
    depth,
}: {
    framework: Framework;
    menuItem: MenuItem;
    isActive: boolean;
    toggleActive?: () => void;
    activeMenuItem?: MenuItem;
    hideCollapsibleButton?: boolean;
    depth: number;
}) {
    const { title, path, url, icon, isEnterprise, items } = menuItem;
    const linkUrl = getLinkUrl({ framework, path, url });
    const nonLinkSubGroup = !path && !url && depth > 1;

    let heading;
    if (nonLinkSubGroup) {
        const isActiveParent = items ? items.includes(activeMenuItem as any) : false;
        heading = (
            <span
                className={classnames(
                    gridStyles.groupLabel,
                    {
                        [gridStyles.activeItemParent]: isActiveParent,
                    },
                    'text-secondary'
                )}
            >
                {title}
            </span>
        );
    } else if (items && !hideCollapsibleButton) {
        heading = (
            <button
                onClick={toggleActive}
                tabIndex={0}
                className={classnames(gridStyles.sectionHeader, 'button-style-none', {
                    [gridStyles.active]: isActive,
                    [styles.active]: isActive,
                })}
                aria-expanded={isActive}
                aria-controls={`#${toElementId(title)}`}
            >
                <Icon
                    name="chevronRight"
                    svgClasses={classnames(gridStyles.sectionIcon, {
                        [gridStyles.active]: isActive,
                    })}
                />

                {icon && <Icon name={icon} svgClasses={styles.menuIcon} />}
                {title}
                {isEnterprise && <EnterpriseIcon />}
            </button>
        );
    } else {
        heading = (
            <a
                href={linkUrl}
                className={classnames(gridStyles.sectionHeader, gridStyles.singleItem, {
                    [gridStyles.activeMenuItem]: activeMenuItem === menuItem,
                    [styles.activeMenuItem]: activeMenuItem === menuItem,
                })}
            >
                {icon && <Icon name={icon} svgClasses={styles.menuIcon} />}
                {title}
                {isEnterprise && <EnterpriseIcon />}
            </a>
        );
    }

    return (
        <li key={url}>
            {heading}
            {items && (
                <CollapsibleNav
                    items={items}
                    framework={framework}
                    isOpen={isActive}
                    activeMenuItem={activeMenuItem}
                    depth={depth}
                />
            )}
        </li>
    );
}

function WhatsNewSection({ section }: { section: MenuSection }) {
    const { path, title } = section;
    return (
        <li className={styles.whatsNewLink}>
            <a href={urlWithBaseUrl(path)}>{title}</a>
        </li>
    );
}

function MenuSectionNav({
    menuSection,
    framework,
    activeMenuItem,
    activeTopLevelMenuItem,
    setActiveTopLevelMenuItem,
}: {
    menuSection: MenuSection;
    framework: Framework;
    activeMenuItem?: MenuItem;
    activeTopLevelMenuItem?: MenuItem;
    setActiveTopLevelMenuItem: (menuItem?: MenuItem) => void;
}) {
    const { title, items, type } = menuSection;
    return (
        <>
            {title && <h5>{title}</h5>}
            {items && (
                <>
                    {items?.map((menuItem) => {
                        const isActive = menuItem === activeTopLevelMenuItem;
                        const toggleActive = () => {
                            setActiveTopLevelMenuItem(isActive ? undefined : menuItem);
                        };

                        return (
                            <MenuGroup
                                key={`${menuItem.title}-${menuItem.path}-${menuItem.url}`}
                                framework={framework}
                                menuItem={menuItem}
                                isActive={isActive}
                                toggleActive={toggleActive}
                                activeMenuItem={activeMenuItem}
                                depth={1}
                            />
                        );
                    })}
                </>
            )}
        </>
    );
}

export function PagesNavigation({
    menuSections,
    framework,
    pageName,
}: {
    menuSections: MenuSection[];
    framework: Framework;
    pageName: string;
}) {
    const [activeTopLevelMenuItem, setActiveTopLevelMenuItem] = useState<MenuItem | undefined>(
        findActiveTopLevelMenuItem({
            menuSections,
            activeMenuItemPath: pageName,
        })
    );
    const [activeMenuItem] = useState<MenuItem | undefined>(
        findActiveMenuItem({
            menuSections,
            activeMenuItemPath: pageName,
        })
    );

    const [navOpen, setNavOpen] = useState(false);

    useEffect(() => {
        const docsButtonEl = document.querySelector('#top-bar-docs-button');

        const docsButtonHandler = () => {
            setNavOpen(!navOpen);
        };

        docsButtonEl?.addEventListener('click', docsButtonHandler);

        return () => {
            docsButtonEl?.removeEventListener('click', docsButtonHandler);
        };
    }, [navOpen]);

    return (
        <Collapsible id="docs-nav-collapser" isOpen={navOpen}>
            <aside className={classnames(styles.menu, gridStyles.menu)}>
                <ul className={classnames(gridStyles.menuInner, 'list-style-none')}>
                    {menuSections?.map((menuSection: MenuSection, index: number) => {
                        return (
                            <Fragment key={menuSection.title ?? JSON.stringify(menuSection)}>
                                {menuSection.type === 'whats-new' ? (
                                    <WhatsNewSection section={menuSection} />
                                ) : (
                                    <>
                                        <MenuSectionNav
                                            menuSection={menuSection}
                                            framework={framework}
                                            activeMenuItem={activeMenuItem}
                                            activeTopLevelMenuItem={activeTopLevelMenuItem}
                                            setActiveTopLevelMenuItem={setActiveTopLevelMenuItem}
                                        />

                                        {index < menuSections.length - 1 ? <hr /> : null}
                                    </>
                                )}
                            </Fragment>
                        );
                    })}
                </ul>
            </aside>
        </Collapsible>
    );
}
