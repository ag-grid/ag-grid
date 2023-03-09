import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classnames from 'classnames';
import Announcements from 'components/Announcements';
import { Icon } from 'components/Icon';
import { Link } from 'gatsby';
import React, { useEffect, useState } from 'react';
import convertToFrameworkUrl from 'utils/convert-to-framework-url';
import rawMenuData from '../../doc-pages/licensing/menu.json';
import { isProductionEnvironment } from '../utils/consts';
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
    // Could be replaced with a regex
    return str.toLowerCase().replace('&', '').replace('/', '').replaceAll(' ', '-');
}

const menuData = filterProductionMenuData(rawMenuData);

const MenuSection = ({ title, items, currentFramework, isActive, toggleActive }) => {
    return (
        <li key={title} className={styles.menuSection}>
            <button
                onClick={toggleActive}
                onKeyDown={toggleActive}
                role="button"
                tabIndex="0"
                className={classnames(styles.sectionHeader, 'button-style-none')}
                data-toggle="collapse"
                data-target={`#${toElementId(title)}`}
                aria-expanded="false"
                aria-controls={`#${toElementId(title)}`}
            >
                <svg className={classnames(styles['menu__arrow'], { 'fa-rotate-90': isActive })}>
                    <use href="#menu-item" />
                </svg>

                {title}
            </button>

            <MenuGroup group={{ group: title, items }} currentFramework={currentFramework} isTopLevel={true} />
        </li>
    );
};

const MenuGroup = ({ group, currentFramework, isTopLevel }) => (
    <ul
        id={isTopLevel && toElementId(group.group)}
        className={classnames(styles.menuGroup, 'list-style-none', isTopLevel && 'collapse')}
        data-parent="#side-nav"
    >
        {group.items
            .filter((item) => !item.menuHide && (!item.frameworks || item.frameworks.includes(currentFramework)))
            .map((item) => (
                <MenuItem key={item.title} item={item} currentFramework={currentFramework} />
            ))}
    </ul>
);

const MenuItem = ({ item, currentFramework }) => {
    const enterpriseIcon = item.enterprise && <Icon name="enterprise" svgClasses={styles.enterpriseIcon} />;
    const title = (
        <>
            {item.title}
            {enterpriseIcon}
        </>
    );

    return (
        <li key={item.title}>
            {item.url ? (
                <Link to={convertToFrameworkUrl(item.url, currentFramework)} activeClassName={styles.activeMenuItem}>
                    {title}
                </Link>
            ) : (
                title
            )}
            {item.items && !item.hideChildren && (
                <MenuGroup group={{ group: item.title, items: item.items }} currentFramework={currentFramework} />
            )}
        </li>
    );
};

/**
 * This generates the navigation menu for the left-hand side. When a page loads, it will ensure the relevant section and
 * link is shown and highlighted.
 */
const Menu = ({ currentFramework, currentPage }) => {
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
        <aside className={classnames(styles['menu'], 'ag-styles')}>
            <FontAwesomeIcon icon={faChevronRight} className={styles['menu__arrow']} symbol="menu-item" />

            <ul id="side-nav" className={classnames(styles.menuInner, 'list-style-none')}>
                {combinedMenuItems.map((item) => {
                    const { title } = item;
                    const isActive = title === activeSection;

                    const toggleActive = (event) => {
                        if (event.key && event.key !== 'Enter') {
                            return;
                        }

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
                        />
                    );
                })}

                <Announcements framework={currentFramework} />
            </ul>
        </aside>
    );
};

export default Menu;
