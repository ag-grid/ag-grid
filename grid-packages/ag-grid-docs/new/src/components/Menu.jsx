import React from "react";
import JSONData from '../data/menu.json';
import './menu.scss';

const displayMenuItems = (items) => items.map(item => (
    <ul key={item.title}>
        <li>
            { item.title }
            { item.items ? displayMenuItems(item.items) : null }
        </li>
    </ul>
));

const renderMenu = () => (
    <ul>
        { JSONData.map(groupItems => (
            displayMenuItems(groupItems.items)
        ))}
    </ul>
);

const Menu = () => (
    <div className="menu_view">
        { renderMenu() }
    </div>
);

export default Menu;