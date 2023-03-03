import React, { FunctionComponent } from 'react';
import { Icon } from './Icon';
import styles from './Version.module.scss';

type highlight = { text: string; url: string };
type Props = { date: string; version: string; blogUrl?: string; highlights?: Array<highlight> };

const Version: FunctionComponent<Props> = ({ date, version, blogUrl, highlights }: Props) => {
    const parsedVersion = {
        major: parseInt(version.split('.')[0]),
        minor: parseInt(version.split('.')[1]),
        patch: parseInt(version.split('.')[2]),
    };
    const isMajorVersion = !parsedVersion.minor;
    const blogHref = blogUrl
        ? blogUrl
        : `https://blog.ag-grid.com/whats-new-in-ag-grid-${
              parsedVersion.minor ? `${parsedVersion.major}-${parsedVersion.minor}/` : `${parsedVersion.major}/`
          }`;

    return (
        <div className={styles.version}>
            <header>
                <b className="font-size-large">Version {version}</b>
                <span className="text-secondary font-size-large">{date}</span>
                <a href={blogHref}>What's new in AG Grid {version}?</a>
            </header>

            <p className="font-size-small">
                {isMajorVersion ? 'Major' : 'Minor'} release with new features and bug fixes.
            </p>

            {highlights && (
                <ul className="list-style-none">
                    {highlights.map((highlight) => {
                        return (
                            <li>
                                <a href={highlight.url}>{highlight.text}</a>
                            </li>
                        );
                    })}
                </ul>
            )}

            <a href={`/changelog/?fixVersion=${version}`} target="_blank" rel="noreferrer">
                {version} change log <Icon name="arrowRight" />
            </a>
        </div>
    );
};

export default Version;
