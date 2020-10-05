import React from "react";
import menuData from '../data/menu.json';
import './menu.scss';
import { Link } from 'gatsby';

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

const MenuGroup = ({ group, currentFramework }) => {
    if (group.frameworkSpecific && !isCurrentFramework(group.title, currentFramework)) { return null; }

    return (
        <ul>
            {group.items.map(item => <MenuItem key={item.title} item={item} currentFramework={currentFramework} />)}
        </ul>
    );
};

const isCurrentFramework = (title, currentFramework) => title.toLowerCase().indexOf(currentFramework) !== -1;

const Menu = ({ currentFramework }) => {
    return <div className="menu_view">
        {menuData.map(group => <MenuGroup key={group.group} group={group} currentFramework={currentFramework} />)}
    </div>;
};

export default Menu;