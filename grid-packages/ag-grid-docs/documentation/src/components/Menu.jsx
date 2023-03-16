import classnames from 'classnames';
import Announcements from 'components/Announcements';
import { Icon } from 'components/Icon';
import { Link } from 'gatsby';
import React, { useEffect, useRef, useState } from 'react';
import convertToFrameworkUrl from 'utils/convert-to-framework-url';
import rawMenuData from '../../doc-pages/licensing/menu.json';
import { isProductionEnvironment } from '../utils/consts';
import { findParentItems } from './menu-find-parent-items';
import styles from './Menu.module.scss';

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
    return str.toLowerCase().replace('&', '').replace('/', '').replaceAll(' ', '-');
}

const menuData = filterProductionMenuData(rawMenuData);

const MenuSection = ({ title, items, currentFramework, isActive, toggleActive, activeParentItems }) => {
    return (
        <li key={title} className={styles.menuSection}>
            <button
                onClick={toggleActive}
                tabIndex="0"
                className={classnames(styles.sectionHeader, isActive && styles.active, 'button-style-none')}
                data-toggle="collapse"
                data-target={`#${toElementId(title)}`}
                aria-expanded={isActive}
                aria-controls={`#${toElementId(title)}`}
            >
                <Icon name="chevronRight" svgClasses={classnames(styles.sectionIcon, isActive && styles.active)} />

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
    const containerRef = useRef(null);
    useEffect(() => {
        // NOTE: Using plain JavaScript DOM to add/remove class, so it doesn't
        // interfere with bootstrap animations and allows for menu group to be
        // shown on first load.
        // Show class is from bootstrap collapse: https://getbootstrap.com/docs/4.0/components/collapse/
        if (isActive) {
            containerRef.current?.classList.add('show');
        } else {
            containerRef.current?.classList.remove('show');
        }
    }, [isActive, containerRef.current]);

    return (
        <ul
            ref={containerRef}
            id={isTopLevel && toElementId(group.group)}
            className={classnames(styles.menuGroup, 'list-style-none', isTopLevel && 'collapse')}
            data-parent="#side-nav"
        >
            {group.items
                .filter((item) => !item.menuHide && (!item.frameworks || item.frameworks.includes(currentFramework)))
                .map((item) => (
                    <MenuItem
                        key={item.title}
                        item={item}
                        currentFramework={currentFramework}
                        activeParentItems={activeParentItems}
                    />
                ))}
        </ul>
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

    const isActiveParent = activeParentItems.some((parentItem) => parentItem.url === item.url);

    return (
        <li key={item.title}>
            {item.url ? (
                <Link
                    to={convertToFrameworkUrl(item.url, currentFramework)}
                    activeClassName={styles.activeMenuItem}
                    className={isActiveParent ? styles.activeItemParent : undefined}
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

    const pathSegment = `/${path.split('/').reverse()[1]}/`;
    const activeParentItems = findParentItems(combinedMenuItems, pathSegment);

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
        <aside className={classnames(styles['menu'], 'ag-styles', 'font-size-responsive')}>
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
