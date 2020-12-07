import React, { Fragment, useState } from 'react';
import styles from './Tile.module.scss';
import icons from './icons';

const getUrl = (framework, url) => `${framework}${url.replace('../','/')}`;


const recursiveRender = (items, framework, group, level = 0) => items.map((item, idx) => {
    const [collapsed, setCollapsed] = useState(true);

    if (item.frameworks && item.frameworks.indexOf(framework) === - 1) { return null; }

    const className = `menu-view-tile__list__${level === 0 ? 'block' : 'inline'}`;

    const title = !item.url || (collapsed && !item.showInCollapsed) 
        ? null
        : (
        <span className={styles[className]}>
            <a href={getUrl(framework, item.url)}>{item.title}{item.enterprise ? <enterprise-icon/> : null}</a>
            {level > 0  ? <span style={{ marginRight: 2 }}>,</span> : null }
        </span>
     )
    const content = item.items ? recursiveRender(item.items, framework, item, level + 1) : null;

    if (!title && !content) { return null; }

    return (
        <Fragment key={`${group}_${item.title.replace(/\s/g,'_').toLowerCase()}`}>
            { title }
            { content }
        </Fragment>
    )
});

const Tile = ({ data, group, framework }) => {
    if (!data.icon) { return null; }
    const iconName = data.icon.replace('icon-','');
    const iconAlt= iconName.replace(/-/g,' ');

    return (
        <div className={styles['menu-view-tile']}>
            <div className={styles['menu-view-tile__icon']}><img alt={iconAlt} src={icons[iconName]}></img></div>
            <h3 className={styles['menu-view-tile__title']}>{data.title}</h3>
            <div className={styles['menu-view-tile__list']}>
                {recursiveRender(data.items, framework, group)}
            </div>
        </div>
    )
}

export default Tile;