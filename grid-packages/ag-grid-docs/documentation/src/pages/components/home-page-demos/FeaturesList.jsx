import classNames from 'classnames';
import React from 'react';
import DataIcon from '../../../images/inline-svgs/docs-category-icons/icon-data.svg';
import DetailIcon from '../../../images/inline-svgs/docs-category-icons/icon-detail.svg';
import EditCellsIcon from '../../../images/inline-svgs/docs-category-icons/icon-edit-cells.svg';
import FilterIcon from '../../../images/inline-svgs/docs-category-icons/icon-filter.svg';
import ImportExportIcon from '../../../images/inline-svgs/docs-category-icons/icon-import-export.svg';
import MenuIcon from '../../../images/inline-svgs/docs-category-icons/icon-menu.svg';
import PivotIcon from '../../../images/inline-svgs/docs-category-icons/icon-pivot.svg';
import SigmaIcon from '../../../images/inline-svgs/docs-category-icons/icon-sigma.svg';
import TableIcon from '../../../images/inline-svgs/docs-category-icons/icon-table.svg';
import TreeIcon from '../../../images/inline-svgs/docs-category-icons/icon-tree.svg';
import styles from './FeaturesList.module.scss';

const featuresListItems = [
    { name: 'Cell Editing', url: '/javascript-data-grid/cell-editing/', icon: <EditCellsIcon /> },
    { name: 'Transactions', url: '/javascript-data-grid/data-update-transactions/', icon: <DataIcon /> },
    { name: 'Aggregation', url: '/javascript-data-grid/aggregation/', icon: <SigmaIcon /> },

    { name: 'Row Grouping', url: '/javascript-data-grid/grouping/', icon: <TableIcon /> },
    { name: 'Master Detail', url: '/javascript-data-grid/master-detail/', icon: <DetailIcon /> },
    { name: 'Clipboard', url: '/javascript-data-grid/clipboard/', icon: <ImportExportIcon /> },

    { name: 'Server-Side Row Model', url: '/javascript-data-grid/server-side-model/', icon: <DataIcon /> },
    { name: 'Pivoting', url: '/javascript-data-grid/pivoting/', icon: <PivotIcon /> },
    { name: 'Column Filtering', url: '/javascript-data-grid/filtering-overview/', icon: <FilterIcon /> },

    { name: 'Export to Excel', url: '/javascript-data-grid/excel-export/', icon: <ImportExportIcon /> },
    { name: 'Context Menu', url: '/javascript-data-grid/context-menu/', icon: <MenuIcon /> },
    { name: 'Tree Data', url: '/javascript-data-grid/tree-data/', icon: <TreeIcon /> },
];

const ItemGroup = ({ items }) => {
    return (
        <div className={styles.itemGroup}>
            {items.map(({ name, url, icon }) => {
                return (
                    <a className={styles.featureItem} href={url} key={name}>
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
