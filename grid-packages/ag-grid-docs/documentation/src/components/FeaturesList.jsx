import classNames from 'classnames';
import React from 'react';
import styles from './FeaturesList.module.scss';
import { Icon } from './Icon';

const featuresListItems = [
    { name: 'Cell Editing', url: '/javascript-data-grid/cell-editing/', icon: 'feature-editing' },
    { name: 'Transactions', url: '/javascript-data-grid/data-update-transactions/', icon: 'feature-transactions' },
    { name: 'Aggregation', url: '/javascript-data-grid/aggregation/', icon: 'feature-aggregation' },

    { name: 'Row Grouping', url: '/javascript-data-grid/grouping/', icon: 'feature-grouping' },
    { name: 'Master Detail', url: '/javascript-data-grid/master-detail/', icon: 'feature-detail' },
    { name: 'Clipboard', url: '/javascript-data-grid/clipboard/', icon: 'feature-clipboard' },

    { name: 'Server-Side Row Model', url: '/javascript-data-grid/server-side-model/', icon: 'feature-server-side' },
    { name: 'Pivoting', url: '/javascript-data-grid/pivoting/', icon: 'feature-pivoting' },
    { name: 'Column Filtering', url: '/javascript-data-grid/filtering-overview/', icon: 'feature-filtering' },

    { name: 'Export to Excel', url: '/javascript-data-grid/excel-export/', icon: 'feature-excel' },
    { name: 'Context Menu', url: '/javascript-data-grid/context-menu/', icon: 'feature-menu' },
    { name: 'Tree Data', url: '/javascript-data-grid/tree-data/', icon: 'feature-tree' },
];

const ItemGroup = ({ items }) => {
    return (
        <div className={styles.itemGroup}>
            {items.map(({ name, url, icon }) => {
                return (
                    <a className={styles.featureItem} href={url} key={name}>
                        <Icon name={icon} svgClasses={styles.icon} />
                        <span>{name}</span>
                    </a>
                );
            })}
        </div>
    );
};

function FeaturesList() {
    return (
        <div className={classNames(styles.featuresListOuter, 'font-size-extra-large')}>
            <p>All the features your users expect and more...</p>

            <div className={styles.featuresList}>
                <ItemGroup items={featuresListItems.slice(0, 3)} />
                <ItemGroup items={featuresListItems.slice(3, 6)} />
                <ItemGroup items={featuresListItems.slice(6, 9)} />
                <ItemGroup items={featuresListItems.slice(9, 12)} />
            </div>
        </div>
    );
}

export default FeaturesList;
