import React from 'react';
import styles from '@design-system/modules/GridDocs.module.scss';
import aboutUsStyles from '@design-system/modules/about.module.scss';
import classnames from 'classnames';
import { SEO } from '../../../components/SEO';

const CommunityPage = () => {
    return (
        <div id="doc-page-wrapper" className={styles['doc-page-wrapper']}>
            <div id="doc-content" className={classnames("doc-content", styles['doc-page'])}>
                <SEO title="Community" description="Explore the AG Grid community" />
                <header className={styles.docsPageHeader}>
                    <h1 id="top" className={styles.docsPageTitle}>
                        <div className={styles.pageTitleContainer}>
                            <div className={styles.pageTitleGroup}>
                                <span>Submit your Content</span>
                            </div>
                        </div>
                    </h1>
                </header>
                <span>
                    Are you a developer or creator who works with AG Grid and want to share your work with our community? Submit our application form to have your content featured here.
                </span>
                <div className={styles.pageSections} style={{ marginTop: '25px' }}>
                <iframe src="https://docs.google.com/forms/d/e/1FAIpQLSdMGmY5mLLQnCh85mfyB_s_jkCNFp8ocP2I3pzk2YPwqoUdfA/viewform?embedded=true" className='iframe' width="100%" height="1000vh" frameborder="0" marginheight="0" marginwidth="0">Loading…</iframe>
                </div>
            </div>
        </div>
    );
};

export default CommunityPage;
