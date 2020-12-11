import React, { Fragment } from 'react';
import Tile from './Tile';
import styles from './MenuView.module.scss';

const getTiles = (items, group, framework) => items.map(
    item => <Tile
        key={`${group}_${item.title.replace(/\s/g,'_').toLowerCase()}`}
        group={group} 
        framework={framework}
        data={item} />
);

const MenuView = ({ framework, data }) => (
    <Fragment>
        { data.map(group => (
            <div key={group.group} className={styles['menu-view']}>
                <h2 className={styles['menu-view__title']}>{group.group}</h2>
                <div className={styles['menu-view__tile-row']}>
                    {getTiles(group.items, group.group, framework)}
                </div>
            </div>
        )) }
    </Fragment>
);

export default MenuView;