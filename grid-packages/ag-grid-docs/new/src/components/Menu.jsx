import React, { useState } from "react";
import menuData from '../data/menu.json';
import './menu.scss';
import { Link } from 'gatsby';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

const MenuSection = ({ title, items, currentFramework, isActive, toggleActive }) => {
    return <li key={title} className="menu-section">
        <div onClick={() => toggleActive()}>
            <FontAwesomeIcon icon={faChevronRight} fixedWidth rotation={isActive ? 90 : 0} />
            {title}
        </div>
        {isActive && <MenuGroup group={{ group: title, items }} currentFramework={currentFramework} />}
    </li>;
};

const MenuGroup = ({ group, currentFramework }) => {
    if (group.frameworkSpecific && !isCurrentFramework(group.title, currentFramework)) { return null; }

    return (
        <ul className="menu-group">
            {group.items.map(item => <MenuItem key={item.title} item={item} currentFramework={currentFramework} />)}
        </ul>
    );
};

const MenuItem = ({ item, currentFramework }) => {
    if (item.frameworkSpecific && !isCurrentFramework(item.title, currentFramework)) { return null; }

    return (
        <li key={item.title}>
            {item.url
                ? <Link to={`../../${item.url.replace('${framework}', currentFramework)}`}>{item.title}</Link>
                : item.title
            }
            {item.items && <MenuGroup group={{ group: item.title, items: item.items }} currentFramework={currentFramework} />}
        </li>
    );
};

const isCurrentFramework = (title, currentFramework) => title.toLowerCase().indexOf(currentFramework) !== -1;

const Menu = ({ currentFramework }) => {
    const combinedMenuItems = menuData.reduce((combined, group) => [...combined, ...group.items], []);
    const [activeSection, setActiveSection] = useState(null);

    return <div className="menu">
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