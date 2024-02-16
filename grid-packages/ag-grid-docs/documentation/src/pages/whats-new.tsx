import React from 'react';
import styles from "@design-system/modules/WhatsNew.module.scss";
import { hostPrefix } from '../utils/consts';
import versionsData from './whats-new.json';
import classNames from 'classnames';

const parseVersion = (version: string) => {
    const [major, minor, patch] = version.split('.').map(Number);
    return { major, minor, patch, isMajor: !minor && !patch };
};

const Version = ({ date, version, blogUrl, highlights, notesUrl, isLatest }) => {
    const { major, minor, isMajor } = parseVersion(version);
    const blogHref = blogUrl || `https://blog.ag-grid.com/whats-new-in-ag-grid-${minor ? `${major}-${minor}` : major}/`;

    return (
        <div className={`${styles.version} ${isMajor ? styles.major : ''}`}>

            <div className={styles.topheader}>
                <header>

                <div className={styles.flex}>
                    <span className={styles.date}>{date}</span>

                    <div className={styles.flex}>
                    {isLatest && <span className={styles.latestTag}>Latest</span>}
                    {isMajor && <span className={styles.majorText}>Major</span>}
                    </div>
                    
                    </div>

                    <div className={styles.flex}>
                        <b className={styles['text-lg']}>Version {version}</b>
                        <a className={styles.bloglink} href={blogHref}>Read more →</a>
                    </div>
                    <span className={styles.line}></span>
                </header>

                <p className={styles['text-sm']}>
                    Feature Highlights
                </p>

                {highlights?.length > 0 && (
                    <ul className={styles['list-style-none']}>
                        {highlights.map((highlight, i) => (
                            <li key={highlight.text + i}>
                                <a href={highlight.url}>{highlight.text}</a>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div>
                {notesUrl && (
                        <a
                            className={`${styles.buttonSecondary} button-secondary`}
                            href={`${hostPrefix}${notesUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {isMajor ? 'See migration guide' : 'See release notes'}
                        </a>
                    )}
                <a
                    className={classNames(styles.buttonSecondary, styles.changelog, 'button-secondary')}
                    href={`${hostPrefix}/changelog/?fixVersion=${version}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    See all changes
                </a>
            </div>

        </div>
    );
};

const WhatsNew = () => {

    return (
        <div className={styles.whatsNewContainer}>
            <h1 id="top" className="whats-new">
                What's New in AG Grid
            </h1>
            <p className={styles.description}>See what's new in recent AG Grid versions.</p>

            <div className={styles.versions}>
                {versionsData.map((versionInfo, index) => {
                    return <Version
                        key={index}
                        version={versionInfo.version}
                        date={versionInfo.date}
                        highlights={versionInfo.highlights}
                        notesUrl={versionInfo.notesUrl} // Pass the custom button URL
                        isLatest={index === 0}
                    />
                })}
            </div>
        </div>
    );
};

export default WhatsNew;