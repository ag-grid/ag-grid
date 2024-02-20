import React from 'react';
import styles from '@design-system/modules/GridDocs.module.scss';
import classnames from 'classnames';
import SEO from '../../../components/SEO';

const PastEvents = () => {
    return (
        <div id="doc-page-wrapper" className={styles['doc-page-wrapper']}>
            <div id="doc-content" className={classnames('doc-content', styles['doc-page'])}>
                <SEO title="Upcoming Events" description="Read about the events AG Grid is attending and sponsoring in 2024" />
                <header className={styles.docsPageHeader}>
                    <h1 id="top" className={styles.docsPageTitle}>
                        <div className={styles.pageTitleContainer}>
                            <div className={styles.pageTitleGroup}>
                                <span>Sponsorships</span>
                            </div>
                        </div>
                    </h1>
                </header>
                <span>
                    A list of community projects that are sponsored by AG Grid
                </span>
                <div className={styles.pageSections} style={{ marginTop: '25px' }}>
                    <ul>
                        <li>
                            <span>Plunkr</span>
                        </li>
                        <li>
                            <span>Webpack</span>
                        </li>
                        <li>
                            <span>TanStack Table</span>
                        </li>
                        <li>
                            <span>Webrush</span>
                        </li>
                        <li>
                            <span>Angular Nation</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default PastEvents;
