import { Icon } from '@components/icon/Icon';
import styles from '@design-system/modules/community-section/Showcase.module.scss';
import React from 'react';

import menu from '../../content/community/community-menu.json';
import showcase from '../../content/community/showcase.json';

const ShowcaseList = ({ favouritesOnly = false, maxItems = -1 }) => {

    return (
        <div className={styles.cardContainer}>
            <table>
                <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Link</th>
                    <th>Source</th>
                </tr>
                {showcase.other.map((product, index) => (
                    <tr>
                        <td>{product.title}</td>
                        <td>{product.description}</td>
                        <td>{product.link}</td>
                        <td>{product.repo}</td>
                    </tr>
                ))}
            </table>
        </div>
    );
};

export default ShowcaseList;
