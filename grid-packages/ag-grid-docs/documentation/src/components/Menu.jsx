import classnames from 'classnames';
import Announcements from 'components/Announcements';
import { Icon } from 'components/Icon';
import { Link } from 'gatsby';
import React, { useEffect, useState } from 'react';
import convertToFrameworkUrl from 'utils/convert-to-framework-url';
import rawMenuData from '../../doc-pages/licensing/menu.json';
import { isProductionEnvironment } from '../utils/consts';
import { Collapsible } from './Collapsible';
import { findParentItems } from './menu-find-parent-items';
import styles from './Menu.module.scss';

const DOCS_BUTTON_ID = 'top-bar-docs-button';

function filterProductionMenuData(data) {
    if (!isProductionEnvironment()) {
        // No filtering needed for non-production builds.
        return data;
    }

    return (
        data
            // Filter out Charts Enterprise pages outside development environments.
            .filter((item) => item.enterprise !== 'charts')
            // Recursively filter children.
            .map((item) => {
                if (item.items == null) return item;

                return { ...item, items: filterProductionMenuData(item.items) };
            })
    );
}

function toElementId(str) {
    return 'menu-' + str.toLowerCase().replace('&', '').replace('/', '').replaceAll(' ', '-');
}

const menuData = filterProductionMenuData(rawMenuData);

const MenuSection = ({ title, items, currentFramework, isActive, toggleActive, activeParentItems }) => {
    return (
        <li key={title} className={styles.menuSection}>
            <button
                onClick={toggleActive}
                tabIndex="0"
                className={classnames(styles.sectionHeader, 'button-style-none', {
                    [styles.active]: isActive,
                })}
                aria-expanded={isActive}
                aria-controls={`#${toElementId(title)}`}
            >
                <Icon
                    name="chevronRight"
                    svgClasses={classnames(styles.sectionIcon, {
                        [styles.active]: isActive,
                    })}
                />

                {title}
            </button>

            <MenuGroup
                group={{ group: title, items }}
                currentFramework={currentFramework}
                isTopLevel={true}
                isActive={isActive}
                activeParentItems={activeParentItems}
            />
        </li>
    );
};

const MenuGroup = ({ group, currentFramework, isTopLevel, isActive, activeParentItems }) => {
    return (
        <Collapsible id={toElementId(group.group)} isDisabled={!isTopLevel} isOpen={isTopLevel && isActive}>
            <ul id={isTopLevel && toElementId(group.group)} className={classnames(styles.menuGroup, 'list-style-none')}>
                {group.items
                    .filter(
                        (item) => !item.menuHide && (!item.frameworks || item.frameworks.includes(currentFramework))
                    )
                    .map((item) => (
                        <MenuItem
                            key={item.title}
                            item={item}
                            currentFramework={currentFramework}
                            activeParentItems={activeParentItems}
                        />
                    ))}
            </ul>
        </Collapsible>
    );
};

const MenuItem = ({ item, currentFramework, activeParentItems }) => {
    const enterpriseIcon = item.enterprise && (
        <span className={styles.enterpriseIcon}>
            (e)
            <Icon name="enterprise" />
        </span>
    );
    const title = (
        <>
            {item.title}&nbsp;{enterpriseIcon}
        </>
    );

    const isActiveParent = activeParentItems.some((parentItem) => {
        const hasUrl = Boolean(parentItem.url);
        return hasUrl ? parentItem.url === item.url : parentItem.title === item.title;
    });

    return (
        <li key={item.title}>
            {item.url ? (
                <Link
                    to={convertToFrameworkUrl(item.url, currentFramework)}
                    activeClassName={styles.activeMenuItem}
                    className={isActiveParent ? styles.activeItemParent : undefined}
                    onClick={() => {
                        const docsButton = document.getElementById(DOCS_BUTTON_ID);
                        const docsButtonIsVisible = Boolean(
                            docsButton.offsetWidth || docsButton.offsetHeight || docsButton.getClientRects().length
                        );
                        const isOpen = !docsButton.classList.contains('collapsed');
                        if (isOpen && docsButtonIsVisible) {
                            docsButton.click();
                        }
                    }}
                >
                    {title}
                </Link>
            ) : (
                <span
                    className={classnames(
                        styles.groupLabel,
                        isActiveParent ? styles.activeItemParent : undefined,
                        'text-secondary'
                    )}
                >
                    {title}
                </span>
            )}
            {item.items && !item.hideChildren && (
                <MenuGroup
                    group={{ group: item.title, items: item.items }}
                    currentFramework={currentFramework}
                    activeParentItems={activeParentItems}
                />
            )}
        </li>
    );
};

/**
 * This generates the navigation menu for the left-hand side. When a page loads, it will ensure the relevant section and
 * link is shown and highlighted.
 */
const Menu = ({ currentFramework, currentPage, path }) => {
    const groupItemHasApplicableChild = (items) => {
        if (!items) {
            return false;
        }
        return items.some(
            (item) =>
                item.frameworks === undefined ||
                item.frameworks.includes(currentFramework) ||
                groupItemHasApplicableChild(items.items)
        );
    };

    const [activeSection, setActiveSection] = useState(null);
    const combinedMenuItems = menuData
        .reduce((combined, group) => [...combined, ...group.items], [])
        .filter((group) => groupItemHasApplicableChild(group.items));

    const activeParentItems = findParentItems({
        combinedMenuItems,
        page: currentPage,
        path,
    });

    const containsPage = (items, frameworks) =>
        items.reduce((hasPage, item) => {
            const availableFrameworks = item.frameworks || frameworks;

            return (
                hasPage ||
                (item.url === `/${currentPage}/` &&
                    (!availableFrameworks || availableFrameworks.includes(currentFramework))) ||
                (item.items && containsPage(item.items, availableFrameworks))
            );
        }, false);

    useEffect(() => {
        const sectionContainingPage = combinedMenuItems.filter((item) => containsPage(item.items))[0];

        if (sectionContainingPage) {
            setActiveSection(sectionContainingPage.title);
        }
    }, [currentPage, currentFramework]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <aside className={classnames(styles.menu, 'font-size-responsive')}>
            <ul id="side-nav" className={classnames(styles.menuInner, 'list-style-none', 'collapse')}>
                {combinedMenuItems.map((item) => {
                    const { title } = item;
                    const isActive = title === activeSection;

                    const toggleActive = (event) => {
                        setActiveSection(isActive ? null : title);
                    };

                    return (
                        <MenuSection
                            key={title}
                            title={title}
                            items={item.items}
                            currentFramework={currentFramework}
                            isActive={isActive}
                            toggleActive={toggleActive}
                            activeParentItems={activeParentItems}
                        />
                    );
                })}

                <Announcements framework={currentFramework} />
            </ul>
        </aside>
    );
};

export default Menu;
