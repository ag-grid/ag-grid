import React from 'react';
import './side-menu.scss';

const SideMenu = ({ headings }) => {
    return <ul className="side-nav">
        {headings.map(heading => <li key={heading.id} className={`side-nav__item side-nav__item--level-${heading.depth}`}>
            <a className="side-nav__link" href={`#${heading.id}`}>{heading.value}</a>
        </li>)}
    </ul>;
};

export default SideMenu;