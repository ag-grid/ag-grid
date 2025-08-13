import { Icon } from '@ag-website-shared/components/icon/Icon';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import React from 'react';

import styles from './ReleasesSection.module.scss';

interface VersionData {
    version: string;
    date?: string;
    landingPageHighlight?: string;
    highlights?: Array<{
        text: string;
        path?: string;
    }>;
    notesPath?: string;
    hideBlogPostLink?: boolean;
}

interface ReleasesSectionProps {
    versionsData: VersionData[];
    utm?: string;
    title?: string;
    subtitle?: string;
    showViewAllButton?: boolean;
    viewAllButtonText?: string;
    viewAllButtonUrl?: string;
}

export const ReleasesSection: React.FC<ReleasesSectionProps> = ({
    versionsData,
    utm = '',
    title = 'Recent improvements',
    subtitle = "Here's what you've missed since you've been gone",
    showViewAllButton = true,
    viewAllButtonText = 'View recent releases',
    viewAllButtonUrl = '/whats-new',
}) => {
    // Filter versions that have highlights and are not hidden
    const filteredVersions = versionsData
        .filter((version) => version.highlights && !version.hideBlogPostLink)
        .slice(0, 3);

    return (
        <section className={styles.rtsReleasesSection}>
            <div className={styles.sectionTitle}>
                <h2>{title}</h2>
                <p>{subtitle}</p>
            </div>
            <div className={styles.rtsReleaseCards}>
                {filteredVersions.map((version) => (
                    <div key={version.version} className={styles.rtsReleaseCard}>
                        <a
                            href={`https://blog.ag-grid.com/whats-new-in-ag-grid-${version.version}/${utm}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <img
                                src={urlWithBaseUrl(`images/versions/${version.version}.png`)}
                                className={styles.rtsReleaseImage}
                                alt={`AG Grid ${version.version} release`}
                            />
                            <div className={styles.rtsReleaseCardContent}>
                                <div className={styles.rtsReleaseCardHeader}>
                                    {version.date && <span className={styles.rtsReleaseDate}>{version.date}</span>}
                                    <h3>Version {version.version}</h3>
                                    {version.landingPageHighlight && (
                                        <p className={styles.rtsReleaseDescription}>{version.landingPageHighlight}</p>
                                    )}
                                </div>
                            </div>
                        </a>
                    </div>
                ))}
            </div>
            {showViewAllButton && (
                <a
                    href={urlWithBaseUrl(`${viewAllButtonUrl}${utm}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`button-tertiary ${styles.button}`}
                >
                    {viewAllButtonText} <Icon name="chevronRight" />
                </a>
            )}
        </section>
    );
};
