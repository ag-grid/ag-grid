import React, {FunctionComponent} from 'react';

import styles from "./whats-new.module.scss";
import {Icon} from "../components/Icon";

import { hostPrefix } from '../utils/consts';

import versionsData from './whats-new.json';

const parseVersion = (version) => {
    const [major, minor, patch] = version.split('.').map(Number);
    return { major, minor, patch, isMajor: !minor };
};

const Version = ({ date, version, blogUrl, highlights }) => {
    const { major, minor, isMajor } = parseVersion(version);
    const blogHref = blogUrl || `https://blog.ag-grid.com/whats-new-in-ag-grid-${minor ? `${major}-${minor}` : major}/`;

    return (
        <div className={styles.version}>
            <header>
            <span className={`${styles['text-secondary']} ${styles['font-size-small']}`}>{date}</span>
            <div className={styles.flex}>
                <b className={styles['font-size-large']}>Version {version}</b>
                <a className={styles.bloglink} href={blogHref}>What's new →</a>
            </div> 
                <span class={styles.line}></span>
               
            </header>

            <p className={styles['font-size-small']}>
                {isMajor ? 'Major' : 'Minor'} release with new features and bug fixes.
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

            <a
                className={`${styles.changelog} button-secondary`}
                href={`${hostPrefix}/changelog/?fixVersion=${version}`}
                target="_blank"
                rel="noopener noreferrer"
            >
              See all changes
            </a>
            
        </div>
    );
};

const WhatsNew = () => {
    return (
        <div className={styles.heading}>
             <h1 id="top" className="whats-new">
                      What's new in AG Grid
                    </h1>
                    <p className={styles.description}>See what's been updated in our latest version</p>

        <div className={styles.versions}>
            {versionsData.map((versionInfo, index) => (
                <Version
                    key={index}
                    version={versionInfo.version}
                    date={versionInfo.date}
                    highlights={versionInfo.highlights}
                />
            ))}
        </div>
        </div>
    );
};

export default WhatsNew;
