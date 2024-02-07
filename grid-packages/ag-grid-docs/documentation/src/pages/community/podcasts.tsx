import React from 'react';
import styles from '@design-system/modules/GridDocs.module.scss';
import aboutUsStyles from '@design-system/modules/about.module.scss';
import classnames from 'classnames';
import SEO from '../components/SEO';

const CommunityPage = () => {
    return (
        <div id="doc-page-wrapper" className={styles['doc-page-wrapper']}>
            <div id="doc-content" className={classnames("doc-content", styles['doc-page'])}>
                <SEO title="Community" description="Explore the AG Grid community" />
                <header className={styles.docsPageHeader}>
                    <h1 id="top" className={styles.docsPageTitle}>
                        <div className={styles.pageTitleContainer}>
                            <div className={styles.pageTitleGroup}>
                                <span>Podcasts</span>
                            </div>
                        </div>
                    </h1>
                </header>
                <span>
                    Podcasts hosted or attended by AG Grid
                </span>
                <div className={styles.pageSections} style={{ marginTop: '25px' }}>

                </div>
            </div>
        </div>
    );
};

export default CommunityPage;
