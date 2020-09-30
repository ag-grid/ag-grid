import React, { Fragment } from "react";
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

const renderMenu = () => JSONData.map(groupItems => (
    displayMenuItems(groupItems.items)
));

const Menu = () => (
    <div className="menu_view">
        { renderMenu() }
    </div>
);

export default Menu;