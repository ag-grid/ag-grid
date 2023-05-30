import React from 'react';
import homeStyles from '../../templates/home.module.scss';
import Tile from './Tile';

/**
 * This renders the sections shown on the documentation homepage.
 */
const MenuView = ({ framework, data }) => (
    <>
        {data.map((group) => (
            <div key={group.group} className={homeStyles.section}>
                <h2 className={homeStyles.sectionHeader}>{group.group}</h2>
                <div className={homeStyles.sectionInner}>
                    {group.items.map((item) => (
                        <Tile key={item.title} framework={framework} data={item} />
                    ))}
                </div>
            </div>
        ))}
    </>
);

export default MenuView;
