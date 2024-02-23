import React from 'react';
import styles from '@design-system/modules/GridDocs.module.scss';
import classnames from 'classnames';
import { SEO } from '../../../components/SEO';

const PastEvents = () => {
    return (
        <div id="doc-page-wrapper" className={styles['doc-page-wrapper']}>
            <div id="doc-content" className={classnames('doc-content', styles['doc-page'])}>
                <SEO title="Past Events" description="See where AG Grid was in years gone by" />
                <header className={styles.docsPageHeader}>
                    <h1 id="top" className={styles.docsPageTitle}>
                        <div className={styles.pageTitleContainer}>
                            <div className={styles.pageTitleGroup}>
                                <span>Events</span>
                            </div>
                        </div>
                    </h1>
                </header>
                <span>
                    AG Grid is a regular sponsor of React & Angular conferences, as well as the occasional AG Grid Conf, too. 
                    Take a look at our events to see where we’ve been, and where we’re going to be this year...                
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
                <div className={styles.pageSections} style={{ marginTop: '25px' }}>
                    <h2>2023</h2>
                    <span>2023 saw a heavy investment in conference sponsorship, with a few talks from Stephen Cooper thrown in. We travelled from Salt Lake City to Amsterdam, attended a local conference here in London, and then back to NYC to round out the year - take a look:</span>
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
                    <h2 style={{ marginTop: '25px' }}>2022</h2>
                    <span>2022...</span>
                    <h3 style={{ marginTop: '25px' }}>JS Nation - Amsterdam, NL</h3>
                    <span>
                        ...
                    </span>
                    <h3 style={{ marginTop: '25px' }}>React Summit - Amsterdam, NL</h3>
                    <span>
                        ...
                    </span>
                    <h3 style={{ marginTop: '25px' }}>React Global Online Summit</h3>
                    <span>
                        ...
                    </span>
                </div>
            </div>
        </div>
    );
};

export default PastEvents;
