import React from 'react';
import styles from './Tile.module.scss';
import icons from './icons';

const getUrl = (framework, url) => `${framework}${url.replace('../','/')}`;


const recursiveRender = (items, framework, group, level = 0) => items.map(item => {
    if (item.frameworks && item.frameworks.indexOf(framework) === - 1) { return null; }

    const title = item.url ? <span><a href={getUrl(framework, item.url)}>{item.title}{item.enterprise ? <enterprise-icon/> : null}</a></span> : null;
    const content = item.items ? recursiveRender(item.items, framework, item, level + 1) : null;

    if (!title && !content) { return null; }

    return (
        <div key={`${group}_${item.title.replace(/\s/g,'_').toLowerCase()}`}>
            { title }
            { content }
        </div>
    )
});

const Tile = ({ data, group, framework }) => {
    if (!data.icon) { return null; }
    const iconName = data.icon.replace('icon-','');
    const iconAlt= iconName.replace(/-/g,' ');

    return (
        <div className={styles['menu-view-tile']}>
            <div className={styles['menu-view-tile__icon']}><img alt={iconAlt} src={icons[iconName]}></img></div>
            <div className={styles['menu-view-tile__title']}>{data.title}</div>
            <div className={styles['menu-view-tile__list']}>
                {recursiveRender(data.items, framework, group)}
            </div>
        </div>
    )
}

export default Tile;