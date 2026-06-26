import { Icon } from '@ag-website-shared/components/icon/Icon';
import { useFrameworkFromStore } from '@utils/hooks/useFrameworkFromStore';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import { urlWithPrefix } from '@utils/urlWithPrefix';
import classnames from 'classnames';
import React from 'react';

import styles from './Roadmap.module.scss';
import { RoadmapBoard } from './roadmap-board/RoadmapBoard';
import type { RoadmapItem } from './types';

interface RoadmapProps {
    roadmapData: {
        introTitle?: string;
        introText?: string;
        items: RoadmapItem[];
        lastUpdated: string;
    };
    versionData: {
        date: string;
        notesPath: string;
    };
}

function formatLastUpdated(dateStr: string): string {
    return new Intl.DateTimeFormat('en', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(dateStr));
}

export const Roadmap: React.FC<RoadmapProps> = ({ roadmapData, versionData }) => {
    const framework = useFrameworkFromStore();
    return (
        <>
            <div className={styles.roadmapHero}>
                <section className={classnames(styles.heroInner, 'layout-max-width-small')}>
                    <section className={styles.heroHeadings}>
                        <h1 className="text-3xl">What we're building next</h1>

                        <div className={styles.heroCtaButtons}>
                            <span className={styles.lastUpdated}>
                                Last updated:{' '}
                                {roadmapData?.lastUpdated ? formatLastUpdated(roadmapData.lastUpdated) : null}
                            </span>
                            <span className={styles.seperator}>|</span>
                            <a
                                href={urlWithPrefix({ url: versionData?.notesPath, framework })}
                                target="_blank"
                                className={styles.heroCta}
                            >
                                Release Notes <Icon name="chevronRight" />
                            </a>
                            <a href={urlWithBaseUrl('./whats-new')} target="_blank" className={styles.heroCta}>
                                What's New <Icon name="chevronRight" />
                            </a>
                        </div>
                    </section>
                </section>
            </div>
            <div className={styles.roadmap}>
                {(roadmapData?.introTitle || roadmapData?.introText) && (
                    <div className={styles.roadmapIntro}>
                        <div className={styles.roadmapHeader}>
                            {roadmapData.introTitle && (
                                <span className={styles.introLabel}>{roadmapData.introTitle}</span>
                            )}
                            {roadmapData.introText && <p className={styles.introText}>{roadmapData.introText}</p>}
                        </div>
                    </div>
                )}
                <RoadmapBoard roadmapData={roadmapData} />
            </div>
        </>
    );
};
