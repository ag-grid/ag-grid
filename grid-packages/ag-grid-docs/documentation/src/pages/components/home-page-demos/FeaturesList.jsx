import classNames from 'classnames';
import React from 'react';
import AccessoriesIcon from '../../../images/inline-svgs/docs-category-icons/icon-accessories.svg';
import DataIcon from '../../../images/inline-svgs/docs-category-icons/icon-data.svg';
import EditCellsIcon from '../../../images/inline-svgs/docs-category-icons/icon-edit-cells.svg';
import FilterIcon from '../../../images/inline-svgs/docs-category-icons/icon-filter.svg';
import GroupIcon from '../../../images/inline-svgs/docs-category-icons/icon-group.svg';
import ImportExportIcon from '../../../images/inline-svgs/docs-category-icons/icon-import-export.svg';
import MiscIcon from '../../../images/inline-svgs/docs-category-icons/icon-misc.svg';
import styles from './FeaturesList.module.scss';

const featuresListItems = [
    { name: 'Cell Editing', url: '/javascript-data-grid/cell-editing/', icon: <EditCellsIcon /> },
    { name: 'Transactions', url: '/javascript-data-grid/data-update-transactions/', icon: <DataIcon /> },
    { name: 'Aggregation', url: '/javascript-data-grid/aggregation/', icon: <GroupIcon /> },

    { name: 'Row Grouping', url: '/javascript-data-grid/grouping/', icon: <GroupIcon /> },
    { name: 'Master Detail', url: '/javascript-data-grid/master-detail/', icon: <MiscIcon /> },
    { name: 'Clipboard', url: '/javascript-data-grid/clipboard/', icon: <ImportExportIcon /> },

    { name: 'Server-Side Row Model', url: '/javascript-data-grid/server-side-model/', icon: <DataIcon /> },
    { name: 'Pivoting', url: '/javascript-data-grid/pivoting/', icon: <GroupIcon /> },
    { name: 'Column Filtering', url: '/javascript-data-grid/filtering-overview/', icon: <FilterIcon /> },

    { name: 'Export to Excel', url: '/javascript-data-grid/excel-export/', icon: <ImportExportIcon /> },
    { name: 'Context Menu', url: '/javascript-data-grid/context-menu/', icon: <AccessoriesIcon /> },
    { name: 'Tree Data', url: '/javascript-data-grid/tree-data/', icon: <GroupIcon /> },
];

const ItemGroup = ({ items }) => {
    return (
        <div className={styles.itemGroup}>
            {items.map(({ name, url, icon }) => {
                return (
                    <a className={styles.featureItem} href={url}>
                        <span className={styles.icon}>{icon}</span>
                        <span>{name}</span>
                    </a>
                );
            })}
        </div>
    );
};

function FeaturesList() {
    return (
        <div className={classNames(styles.featuresListOuter, 'ag-styles', 'font-size-extra-large')}>
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
