import { chartsUrlWithPrefix } from '@ag-website-shared/utils/chartsUrlWithPrefix';
import { parseVersion } from '@ag-website-shared/utils/parseVersion';
import { useFrameworkFromStore } from '@utils/hooks/useFrameworkFromStore';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import { urlWithPrefix } from '@utils/urlWithPrefix';

import styles from '../WhatsNew.module.scss';

export type VersionProps = {
    date: string;
    version: string;
    blogUrl?: string;
    highlights?: Array<{ text: string; url: string }>;
    notesPath?: string;
    isLatest: boolean;
};

interface HighlightParams {
    url?: string;
    path?: string;
    chartsPath?: string;
    text: string;
}

function Highlight({ url, path, chartsPath, text }: HighlightParams) {
    const framework = useFrameworkFromStore();

    if (url) {
        return <a href={url}>{text}</a>;
    } else if (path) {
        return <a href={urlWithPrefix({ url: path, framework })}>{text}</a>;
    } else if (chartsPath) {
        return <a href={chartsUrlWithPrefix({ url: chartsPath, framework })}>{text}</a>;
    } else {
        return <>{text}</>;
    }
}

export const Version = ({ date, version, blogUrl, highlights, notesPath, isLatest }: VersionProps) => {
    const { isMajor } = parseVersion(version);
    const framework = useFrameworkFromStore();

    return (
        <div className={styles.version}>
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
                        <b>Version {version}</b>
                        <a className={styles.bloglink} href={blogUrl}>
                            {!blogUrl?.includes('32-3') && 'Read more →'}
                        </a>
                    </div>
                    <span className={styles.line}></span>
                </header>

                <p className={styles.featuresLabel}>Feature Highlights</p>

                {highlights && highlights.length > 0 && (
                    <ul>
                        {highlights.map((highlight, i) => (
                            <li key={highlight.text + i}>
                                <Highlight {...highlight} />
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div>
                {notesPath && (
                    <a
                        className={`${styles.buttonSecondary} button-secondary`}
                        href={urlWithPrefix({ url: notesPath, framework })}
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
