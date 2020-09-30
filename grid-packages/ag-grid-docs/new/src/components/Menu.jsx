import React from "react";
import JSONData from '../data/menu.json';
import './menu.scss';

const displayMenuItem = (item, currentFramework) => {
    if (item.frameworkSpecific && !isCurrentFramework(item.title, currentFramework)) { return null; }

    return (
        <li key={ item.title }>
            { item.url
                ? <a href={ `../../${item.url.replace('${framework}', currentFramework)}` }>{ item.title }</a>
                : item.title
            }
            { item.items ? displayMenuGroup({ group: item.title, items: item.items }, currentFramework) : null }
        </li>
    );
}

const displayMenuGroup = (group, currentFramework) => {
    if (group.frameworkSpecific && !isCurrentFramework(group.title, currentFramework)) { return null; }

    return (
        <ul key={ group.group }>
            { group.items.map(item => displayMenuItem(item, currentFramework)) }
        </ul>
    )
};

const renderMenu = (currentFramework) => JSONData.map(group => displayMenuGroup(group, currentFramework));

const isCurrentFramework = (title, currentFramework) => title.toLowerCase().indexOf(currentFramework) !== -1;

const Menu = ({ currentFramework }) => {
    return <div className="menu_view">
        { renderMenu(currentFramework) }
    </div>
};

export default Menu;