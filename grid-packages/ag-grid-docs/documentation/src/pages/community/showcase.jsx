import React from 'react';
import styles from '@design-system/modules/GridDocs.module.scss';
import showcaseStyles from '@design-system/modules/CommunityShowcase.module.scss';
import 'ag-grid-community/styles/ag-grid.css'; // Core CSS
import 'ag-grid-community/styles/ag-theme-quartz.css'; // Theme
import { AgGridReact } from 'ag-grid-react';
import classnames from 'classnames';
import { Icon } from '../../components/Icon';
import { SEO } from '../../components/SEO';
import showcase from './showcase.json';
import ShowcaseContainer from '../../components/community/ShowcaseContainer';

const Showcase = () => {
    return (
        <div id="doc-page-wrapper" className={styles['doc-page-wrapper']}>
            <div id="doc-content" className={classnames('doc-content', styles['doc-page'])}>
                <SEO title="Community" description="Explore the AG Grid community" />
                <header className={styles.docsPageHeader}>
                    <h1 id="top" className={styles.docsPageTitle}>
                        <div className={styles.pageTitleContainer}>
                            <div className={styles.pageTitleGroup}>
                                <span>Showcase</span>
                            </div>
                        </div>
                    </h1>
                </header>
                <h3>A collection of public examples that use AG Grid</h3>
                <ShowcaseContainer tags={null} showcase={showcase} />
            </div>
        </div>
    );
};

export default Showcase;
