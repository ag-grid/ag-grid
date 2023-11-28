import React, { FunctionComponent } from 'react';
import styles from "./whats-new.module.scss";
import { Icon } from "../components/Icon";
import { hostPrefix } from '../utils/consts';
import versionsData from './whats-new.json';

const parseVersion = (version) => {
    const [major, minor, patch] = version.split('.').map(Number);
    return { major, minor, patch, isMajor: !minor };
};

const Version = ({ date, version, blogUrl, highlights, buttonURL, majorMinor }) => {
    const { major, minor, isMajor } = parseVersion(version);
    const blogHref = blogUrl || `https://blog.ag-grid.com/whats-new-in-ag-grid-${minor ? `${major}-${minor}` : major}/`;


    return (
        <div className={`${styles.version} ${majorMinor ? styles.major : ''}`}>

            <div className={styles.topheader}>
                <header>

                <div className={styles.flex}>
                    <span className={`${styles['text-secondary']} ${styles['font-size-small']}`}>{date}</span>

                    <div className={styles.flex}>
                    {version === "31.0.0" && <span className={styles['latest-tag']}>Latest</span>}
                    {majorMinor && <span className={styles['major-text']}>Major</span>}
                    </div>
                    
                    </div>

                    <div className={styles.flex}>
                        <b className={styles['font-size-large']}>Version {version}</b>
                        <a className={styles.bloglink} href={blogHref}>Read more →</a>
                    </div>
                    <span className={styles.line}></span>
                </header>

                <p className={styles['font-size-small']}>
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

                {buttonURL && (
                    <a
                        className={`${styles.buttonSecondary} button-secondary`}
                        href={`${hostPrefix}${buttonURL}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        See migration guide
                    </a>
                )}
            </div>

            <a
                className={`${styles.changelog} button-secondary`}
                href={`${hostPrefix}/changelog/?fixVersion=${version}`}
                target="_blank"
                rel="noopener noreferrer"
            >
                See release notes
            </a>

        </div>
    );
};

const WhatsNew = () => {

    return (
        <div className={styles.heading}>
            <h1 id="top" className="whats-new">
                What's New in AG Grid
            </h1>
            <p className={styles.description}>See what's new in recent AG Grid versions.</p>

            <div className={styles.versions}>
                {versionsData.map((versionInfo, index) => (
                    <Version
                        key={index}
                        version={versionInfo.version}
                        date={versionInfo.date}
                        highlights={versionInfo.highlights}
                        buttonURL={versionInfo.buttonURL} // Pass the custom button URL
                        majorMinor={versionInfo.majorMinor} 
                    />
                ))}
            </div>
        </div>
    );
};

export default WhatsNew;