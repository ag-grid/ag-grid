import React, { useState } from "react";
import menuData from '../data/menu.json';
import './menu.scss';
import { Link } from 'gatsby';

const MenuSection = ({ title, items, currentFramework, isActive, setActive }) => {
    return <li key={title} onClick={() => setActive()}>
        {title}
        {isActive && <MenuGroup group={{ group: title, items }} currentFramework={currentFramework} />}
    </li>;
};

const MenuGroup = ({ group, currentFramework }) => {
    if (group.frameworkSpecific && !isCurrentFramework(group.title, currentFramework)) { return null; }

    return (
        <ul>
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

    return <div className="menu_view">
        <ul>
            {combinedMenuItems.map(item => <MenuSection
                key={item.title}
                title={item.title}
                items={item.items}
                currentFramework={currentFramework}
                isActive={item.title === activeSection}
                setActive={() => setActiveSection(item.title)}
            />)}
        </ul>
    </div>;
};

export default Menu;