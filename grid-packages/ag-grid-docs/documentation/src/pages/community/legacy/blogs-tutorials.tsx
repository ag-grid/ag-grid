import React from 'react';
import styles from '@design-system/modules/GridDocs.module.scss';
import classnames from 'classnames';
import { SEO } from '../../../components/SEO';
import 'ag-grid-community/styles/ag-grid.css'; // Core CSS
import 'ag-grid-community/styles/ag-theme-quartz.css'; // Theme
import { AgGridReact } from 'ag-grid-react';
import { Icon } from '../../../components/Icon';
import content from '../community-content.json';

const CommunityPage = () => {
    const colDefs = [
        {
            field: "title"
        },
        {
            field: "description"
        },
        {
            field: "link",
            cellRenderer: (params) => {
                return (params.value &&
                    <a target="_blank" href={params.value}>
                        link
                    </a>
                );
            },
            maxWidth: 90
        },
        {
            field: "author"
        },
        {
            field: "type",
            maxWidth: 100
        },
        {
            field: "published",
            sort: 'desc'
        },
    ];

    return (
        <div id="doc-page-wrapper" className={styles['doc-page-wrapper']}>
            <div id="doc-content" className={classnames("doc-content", styles['doc-page'])}>
                <SEO title="Community" description="Explore the AG Grid community" />
                <header className={styles.docsPageHeader}>
                    <h1 id="top" className={styles.docsPageTitle}>
                        <div className={styles.pageTitleContainer}>
                            <div className={styles.pageTitleGroup}>
                                <span>Blogs and Tutorials</span>
                            </div>
                        </div>
                    </h1>
                </header>
                <span>
                    A collection of written content from our community
                </span>
                <div className={styles.pageSections} style={{ marginTop: '25px' }}>
                    <div className="ag-theme-quartz-dark" style={{ height: '1000px' }}>
                        <AgGridReact
                            rowData={content}
                            columnDefs={colDefs}
                            pagination={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunityPage;
