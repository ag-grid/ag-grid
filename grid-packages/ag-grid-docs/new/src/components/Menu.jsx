import React from "react";
import JSONData from '../data/menu.json';
import './menu.scss';

const displayMenuItem = (item) => (
    <li>
        { item.title }
        { item.items ? displayMenuGroup({ group: item.title, items: item.items }) : null }
    </li>
);

const displayMenuGroup = (group) => (
    <ul key={ group.group }>
        { group.items.map(item => displayMenuItem(item)) }
    </ul>
);

const renderMenu = () => JSONData.map(group => displayMenuGroup(group));

const Menu = () => (
    <div className="menu_view">
        { renderMenu() }
    </div>
);

export default Menu;