import React, { useState, useEffect } from 'react';
import menuData from '../data/menu.json';
import './menu.scss';
import { Link } from 'gatsby';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import Search from './search';

const MenuSection = ({ title, items, currentFramework, isActive, toggleActive }) => {
    return <li key={title} className="menu-section">
        <div onClick={() => toggleActive()}>
            <FontAwesomeIcon icon={faChevronRight} fixedWidth rotation={isActive ? 90 : 0} />
            {title}
        </div>
        {isActive && <MenuGroup group={{ group: title, items }} currentFramework={currentFramework} />}
    </li>;
};

const MenuGroup = ({ group, currentFramework }) =>
    <ul className="menu-group">
        {group.items.filter(item => !item.framework || item.framework === currentFramework).map(item => <MenuItem key={item.title} item={item} currentFramework={currentFramework} />)}
    </ul>;

const MenuItem = ({ item, currentFramework }) =>
    <li key={item.title}>
        {item.url
            ? <Link to={item.url}>{item.title}</Link>
            : item.title
        }
        {item.items && <MenuGroup group={{ group: item.title, items: item.items }} currentFramework={currentFramework} />}
    </li>;

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
    }, [currentPage]);

    return <div className="menu">
        <Search indices={[{ name: 'AG-GRID_dev', title: "Documentation Pages" }]} />

        <ul className="menu__sections">
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