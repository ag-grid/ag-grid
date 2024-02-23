import React from "react";
import styles from '@design-system/modules/GridDocs.module.scss';
import classnames from 'classnames';
import { SEO } from '../../components/SEO';

const Champions = () => {
    return (<>
        <div id="doc-page-wrapper" className={styles['doc-page-wrapper']}>
            <div id="doc-content" className={classnames('doc-content', styles['doc-page'])}>
                <SEO title="Community" description="Explore the AG Grid community" />
                <header className={styles.docsPageHeader}>
                    <h1 id="top" className={styles.docsPageTitle}>
                        <div className={styles.pageTitleContainer}>
                            <div className={styles.pageTitleGroup}>
                                <span>Champions</span>
                            </div>
                        </div>
                    </h1>
                </header>
                <span>Shining a light on our friends, partners, and stand-out collaborators, to say thank you...</span>
                <div>
                    <h2>Quarterly Spotlight</h2>
                    <span>Joe meyers....</span>
                </div>
                <div>
                    <h2>Community Champions</h2>
                </div>
                <div>
                    <h2>Friends & Partners</h2>
                </div>
            </div>
        </div>
    </>);
}

export default Champions;