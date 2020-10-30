import React, { useState, useEffect } from 'react';
import { Link } from 'gatsby';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import Search from './search/Search';
import menuData from '../data/menu.json';
import styles from './menu.module.scss';

const MenuSection = ({ title, items, currentFramework, isActive, toggleActive }) => {
    return <li key={title} className={styles.menu__section}>
        <div onClick={() => toggleActive()} onKeyDown={() => toggleActive()} role="button" tabIndex="0">
            <FontAwesomeIcon icon={faChevronRight} fixedWidth rotation={isActive ? 90 : 0} className={styles.menu__arrow} />
            {title}
        </div>
        {isActive && <MenuGroup group={{ group: title, items }} currentFramework={currentFramework} />}
    </li>;
};

const MenuGroup = ({ group, currentFramework }) =>
    <ul className={styles.menu__group}>
        {group.items.filter(item => !item.framework || item.framework === currentFramework).map(item => <MenuItem key={item.title} item={item} currentFramework={currentFramework} />)}
    </ul>;

const MenuItem = ({ item, currentFramework }) => {
    const enterpriseIcon = item.enterprise && <div className={styles.menu__enterpriseIcon}>(e)</div>;
    const title = <span>{item.title}{enterpriseIcon}</span>;

    return (
        <li key={item.title} className={styles.menu__item}>
            {item.url
                ? <Link to={item.url} activeClassName={styles.menu__itemActive}>{title}</Link>
                : title
            }
            {item.items && <MenuGroup group={{ group: item.title, items: item.items }} currentFramework={currentFramework} />}
        </li>
    );
};

const Menu = ({ currentFramework, currentPage }) => {
    const [activeSection, setActiveSection] = useState(null);
    const combinedMenuItems = menuData.reduce((combined, group) => [...combined, ...group.items], []);
    const containsPage = items => items.reduce(
        (hasPage, item) => hasPage || item.url === `../${currentPage}/` || (item.items && containsPage(item.items)),
        false);

    useEffect(() => {
        const sectionContainingPage = combinedMenuItems.filter(item => containsPage(item.items))[0];

        if (sectionContainingPage) {
            setActiveSection(sectionContainingPage.title);
        }
    }, [currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

    return <div className={styles.menu}>
        <Search indices={[{ name: `ag-grid_${currentFramework}`, title: "Documentation Pages" }]} />

        <ul className={styles.menu__sections}>
            {combinedMenuItems.map(item => {
                const { title } = item;
                const isActive = title === activeSection;

                return <MenuSection
                    key={title}
                    title={title}
                    items={item.items}
                    currentFramework={currentFramework}
                    isActive={isActive}
                    toggleActive={() => setActiveSection(isActive ? null : title)}
                />;
            })}
        </ul>
    </div>;
};

export default Menu;