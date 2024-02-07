import React from 'react';
import styles from '@design-system/modules/GridDocs.module.scss';
import classnames from 'classnames';
import SEO from '../components/SEO';

const PastEvents = () => {
    return (
        <div id="doc-page-wrapper" className={styles['doc-page-wrapper']}>
            <div id="doc-content" className={classnames('doc-content', styles['doc-page'])}>
                <SEO title="Upcoming Events" description="Read about the events AG Grid is attending and sponsoring in 2024" />
                <header className={styles.docsPageHeader}>
                    <h1 id="top" className={styles.docsPageTitle}>
                        <div className={styles.pageTitleContainer}>
                            <div className={styles.pageTitleGroup}>
                                <span>Past Events</span>
                            </div>
                        </div>
                    </h1>
                </header>
                <span>
                    Browse events from years gone by that AG Grid has sponsored, hosted, attended and spoken at
                </span>
                <div className={styles.pageSections} style={{ marginTop: '25px' }}>
                    <h2>2024</h2>
                    <span>We have a busy calendar of events planned for 2024 - we hope to see you at one!</span>
                    <h3 style={{ marginTop: '25px' }}>NGConf - Salt Lake City, USA</h3>
                    <span>
                        ...
                    </span>
                    <h3 style={{ marginTop: '25px' }}>React Summit - Amsterdam, NL</h3>
                    <span>
                        ...
                    </span>
                    <h3 style={{ marginTop: '25px' }}>React Advanced - London, UK</h3>
                    <span>
                        ...
                    </span>
                    <h3 style={{ marginTop: '25px' }}>React Summit - New Jersey, USA</h3>
                    <span>
                        ...
                    </span>
                </div>
            </div>
        </div>
    );
};

export default PastEvents;
