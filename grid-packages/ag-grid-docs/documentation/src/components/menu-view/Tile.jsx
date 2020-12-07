import React, { Fragment, useState } from 'react';
import styles from './Tile.module.scss';
import icons from './icons';

const getUrl = (framework, url) => `${framework}${url.replace('../','/')}`;


const recursiveRender = (items, framework, group, collapsed, level = 0, isLast, forceTopLevel) => items.map((item, idx) => {
    if (item.frameworks && item.frameworks.indexOf(framework) === - 1) { return null; }

    const className = `menu-view-tile__list__${level === 0 || forceTopLevel ? 'block' : 'inline'}`;
    const hideComma = level === 0 || forceTopLevel || (isLast && items.length - 1 === idx);

    const title = !item.url || (collapsed && !item.showInCollapsed)
        ? null
        : (
        <span className={styles[className]}>
            <a href={getUrl(framework, item.url)}>{item.title}{item.enterprise ? <enterprise-icon/> : null}</a>
            {hideComma ? null : <span style={{ marginRight: 2 }}>,</span>}
        </span>
     )

     let content = null;
     const nextItems = item.items;
     
     if (nextItems && nextItems.length) {
        content = recursiveRender(
            nextItems,
            framework,
            item.title.replace(/\s/g,'_').toLowerCase(),
            collapsed, 
            level + 1,
            level === 0 || (isLast && idx === items.length - 1),
            !!item.forceTopLevelSubItems
        )
     }


    if (!title && !content) { return null; }

    return (
        <Fragment key={`${group}_${item.title.replace(/\s/g,'_').toLowerCase()}`}>
            { title }
            { content }
        </Fragment>
    )
});

const Tile = ({ data, group, framework }) => {
    const [collapsed] = useState(true);

    if (!data.icon) { return null; }
    const iconName = data.icon.replace('icon-','');
    const iconAlt= iconName.replace(/-/g,' ');

    return (
        <div className={styles['menu-view-tile']}>
            <div className={styles['menu-view-tile__icon']}><img alt={iconAlt} src={icons[iconName]}></img></div>
            <h3 className={styles['menu-view-tile__title']}>{data.title}</h3>
            <div className={styles['menu-view-tile__list']}>
                {recursiveRender(data.items, framework, group, collapsed)}
            </div>
        </div>
    )
}

export default Tile;