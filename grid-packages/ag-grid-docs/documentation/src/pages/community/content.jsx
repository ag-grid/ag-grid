import React from "react";
import styles from '@design-system/modules/GridDocs.module.scss';
import classnames from 'classnames';
import SEO from '../components/SEO';

const CommunityContent = () => {
    return (<>
        <div id="doc-page-wrapper" className={styles['doc-page-wrapper']}>
            <div id="doc-content" className={classnames('doc-content', styles['doc-page'])}>
                <SEO title="Community" description="Explore the AG Grid community" />
                <header className={styles.docsPageHeader}>
                    <h1 id="top" className={styles.docsPageTitle}>
                        <div className={styles.pageTitleContainer}>
                            <div className={styles.pageTitleGroup}>
                                <span>Community content</span>
                            </div>
                        </div>
                    </h1>
                </header>
                <span>The latest news from AG Grid, including blogs, events, videos, podcasts, and more...</span>
                <div>
                    <h2>Featured</h2>
                </div>
                <div>
                    <h2>All Content</h2>
                </div>
            </div>
        </div>
    </>);
}

export default CommunityContent;