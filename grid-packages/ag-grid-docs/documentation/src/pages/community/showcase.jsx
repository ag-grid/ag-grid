import React from 'react';
import styles from '@design-system/modules/GridDocs.module.scss';
import 'ag-grid-community/styles/ag-grid.css'; // Core CSS
import 'ag-grid-community/styles/ag-theme-quartz.css'; // Theme
import { AgGridReact } from 'ag-grid-react';
import classnames from 'classnames';
import { Icon } from '../../components/Icon';
import SEO from '../components/SEO';
import showcase from './showcase.json';

const CommunityPage = () => {
    const colDefs = [
        { field: 'title', maxWidth: 150 },
        { field: 'description', maxWidth: 325 },
        { field: 'open_source', headerName: 'OSS', maxWidth: 75 },
        {
            field: 'link',
            cellRenderer: (params) => {
                return (params.value &&
                    <a target="_blank" href={params.value}>
                        link
                    </a>
                );
            },
            maxWidth: 150,
        },
        {
            field: 'repo',
            cellRenderer: (params) => {
                return (
                    params.value && (
                        <a target="_blank" href={params.value}>
                            <Icon name="github" />
                        </a>
                    )
                );
            },
            maxWidth: 150,
        },
        { field: 'stars', sort: 'desc', filter: 'agNumberColumnFilter', },
        { field: 'type' },
    ];

    const autoSizeStrategy = {
        type: 'fitCellContents',
    };

    const defaultColDefs = {
        filter: true,
    };

    return (
        <div id="doc-page-wrapper" className={styles['doc-page-wrapper']}>
            <div id="doc-content" className={classnames('doc-content', styles['doc-page'])}>
                <SEO title="Community" description="Explore the AG Grid community" />,
                <header className={styles.docsPageHeader}>
                    <h1 id="top" className={styles.docsPageTitle}>
                        <div className={styles.pageTitleContainer}>
                            <div className={styles.pageTitleGroup}>
                                <span>Showcase</span>
                            </div>
                        </div>
                    </h1>
                </header>
                <span>A collection of public examples that use AG Grid</span>
                <div className={styles.pageSections} style={{ marginTop: '25px' }}>
                    <ul>
                        <li>
                            <b>Product</b> - Built something that uses AG Grid functionality It's a product if it uses
                            AG Grid and can't be customised
                        </li>
                        <li>
                            <b>Wrapper</b> - Wraps the AG Grid library for use on an unsupported framework or platform
                            It's a wrapper if the dev puts this library straight into their application and the example
                            is only focused on AG Grid
                        </li>
                        <li>
                            <b>Integration</b> - Exposes AG Grid functionality to users through a 3rd party Its an
                            integration if the dev uses AG Grid via a 3rd party product, along with other functionality
                        </li>
                        <li>
                            <b>Extension</b> - Extends AG Grid functionality It's an extension if it enhances AG Grid
                            functionality
                        </li>
                        <li>
                            <b>Utility</b> - Helps developers use AG Grid in an unmodified state It's an extension if it
                            helps developers use existing AG Grid functionality
                        </li>
                    </ul>
                    <div className="ag-theme-quartz-dark" style={{ height: '1000px' }}>
                        <AgGridReact
                            rowData={showcase}
                            columnDefs={colDefs}
                            autoSizeStrategy={autoSizeStrategy}
                            pagination={true}
                            defaultColDef={defaultColDefs}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunityPage;
