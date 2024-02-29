import styles from '@design-system/modules/Version.module.scss';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';

const parseVersion = (version: string) => {
    const [major, minor, patch] = version.split('.').map(Number);
    return { major, minor, patch, isMajor: !minor && !patch };
};

type VersionProps = {
    date: string;
    version: string;
    blogUrl?: string;
    highlights?: Array<{ text: string; url: string }>;
    notesUrl?: string;
    isLatest: boolean;
};

export const Version = ({ date, version, blogUrl, highlights, notesUrl, isLatest }: VersionProps) => {
    const { major, minor, isMajor } = parseVersion(version);
    const blogHref =
        blogUrl || `https://blog.ag-grid.com/whats-new-in-ag-charts-${minor ? `${major}-${minor}` : major}/`;

    return (
        <div className={styles.version}>
            <div>
                <header className={styles.topHeader}>
                    <div className={styles.flex}>
                        <span className="text-secondary text-sm">{date}</span>

                        <div className={styles.flex}>
                            {isLatest && <span className={styles.latestTag}>Latest</span>}
                            {isMajor && <span className={styles.majorText}>Major</span>}
                        </div>
                    </div>
                    <div className={styles.flex}>
                        <b className="text-lg">Version {version}</b>
                        <a href={blogHref}>Read more →</a>
                    </div>
                    <span className={styles.line}></span>
                </header>

                <p className={styles.featuresLabel}>Feature Highlights</p>

                {highlights && highlights.length > 0 && (
                    <ul>
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
                        href={urlWithBaseUrl(notesUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {isMajor ? 'See migration guide' : 'See release notes'}
                    </a>
                )}
                <a
                    className={`${styles.buttonSecondary} button-secondary`}
                    href={urlWithBaseUrl(`/changelog/?fixVersion=${version}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    See all changes
                </a>
            </div>
        </div>
    );
};
