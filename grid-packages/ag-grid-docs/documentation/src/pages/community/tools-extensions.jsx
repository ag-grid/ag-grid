import React from "react";
import styles from '@design-system/modules/GridDocs.module.scss';
import classnames from 'classnames';
import { SEO } from '../../components/SEO';

const ToolsExtensions = () => {
    return (<>
        <div id="doc-page-wrapper" className={styles['doc-page-wrapper']}>
            <div id="doc-content" className={classnames('doc-content', styles['doc-page'])}>
                <SEO title="Community" description="Explore the AG Grid community" />
                <header className={styles.docsPageHeader}>
                    <h1 id="top" className={styles.docsPageTitle}>
                        <div className={styles.pageTitleContainer}>
                            <div className={styles.pageTitleGroup}>
                                <span>Tools & Extensions</span>
                            </div>
                        </div>
                    </h1>
                </header>
                <span>A collection of tools developed by our community to help you use AG Grid</span>
                <div>
                    <h2>Featured</h2>
                    <span>Some of our favourite tools built on AG Grid</span>
                </div>
                <div>
                    <h2>Wrappers</h2>
                    <span>Use AG Grid in frameworks or platforms not currently officially supported by us:</span>
                </div>
                <div>
                    <h2>Integrations</h2>
                    <span>Build using tools which have integrated AG Grid functionality</span>
                </div>
                <div>
                    <h2>Utilities</h2>
                    <span>Tools that make your life easier when using AG Grid</span>
                </div>
            </div>
        </div>
    </>);
}

export default ToolsExtensions;