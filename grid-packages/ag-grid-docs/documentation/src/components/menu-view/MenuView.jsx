import React from 'react';
import Tile from './Tile';
import styles from './MenuView.module.scss';

/**
 * This renders the sections shown on the documentation homepage.
 */
const MenuView = ({ framework, data }) => (
    <>
        {data.map(group => (
            <div key={group.group} className={styles['menu-view']}>
                <h2 className={styles['menu-view__title']}>
                    {framework === 'javascript' ? 'JavaScript' : framework} Grid: {group.group}
                </h2>
                <div className={styles['menu-view__tile-row']}>
                    {group.items.map(item => <Tile key={item.title} framework={framework} data={item} />)}
                </div>
            </div>
        ))}
    </>
);

export default MenuView;