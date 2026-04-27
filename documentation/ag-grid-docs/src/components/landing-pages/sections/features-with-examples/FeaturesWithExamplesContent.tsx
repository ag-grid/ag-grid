import type { InternalFramework } from '@ag-grid-types';
import { TrialButton } from '@ag-website-shared/components/trial-licence-modal/TrialButton';
import { getFrameworkFromInternalFramework } from '@utils/framework';
import { useSyncFrameworkStoreState } from '@utils/hooks/useSyncFrameworkStoreState';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import styles from './FeaturesWithExamples.module.scss';

export interface FeatureItem {
    heading: string;
    detail: string;
    link?: string;
}

export interface FeatureConfig {
    id: string;
    title: string;
    isEnterprise?: boolean;
    example: {
        pageName: string;
        exampleName: string;
    };
    features: FeatureItem[];
    docsLink: string;
}

interface FeaturesWithExamplesContentProps {
    features: FeatureConfig[];
    framework: InternalFramework;
}

export const FeaturesWithExamplesContent: React.FC<FeaturesWithExamplesContentProps> = ({ features, framework }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [contentTarget, setContentTarget] = useState<HTMLElement | null>(null);

    // Sync framework store state so example runners can load correct framework
    const frameworkForStore = getFrameworkFromInternalFramework(framework);
    useSyncFrameworkStoreState(frameworkForStore);

    // Find the content target element for the portal
    useEffect(() => {
        const target = document.getElementById('landing-page-features-content-target');
        if (target) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- DOM element lookup after mount
            setContentTarget(target);
        }
    }, []);

    const handleTabClick = (index: number) => {
        let newIndex = index;
        if (index >= features.length) {
            newIndex = 0;
        } else if (index < 0) {
            newIndex = features.length - 1;
        }

        setActiveTab(newIndex);

        // Dispatch custom event to notify Astro about tab change
        const event = new CustomEvent('landing-page-feature-tab-change', {
            detail: {
                index: newIndex,
                featureId: features[newIndex].id,
            },
        });
        document.dispatchEvent(event);
    };

    // Set initial tab on mount
    useEffect(() => {
        const event = new CustomEvent('landing-page-feature-tab-change', {
            detail: {
                index: 0,
                featureId: features[0]?.id,
            },
        });
        document.dispatchEvent(event);
    }, [features]);

    const activeFeature = features[activeTab];

    const featureContent = activeFeature ? (
        <div className={styles.contentContainer}>
            <div className={styles.featureContainer}>
                <h3 className={styles.title}>{activeFeature.title}</h3>
                {activeFeature.features.map((feature, index) => (
                    <div key={index} className={styles.feature}>
                        <h5 className={styles.featureHeading}>{feature.heading}</h5>
                        <span className={styles.featureDetail}>
                            {feature.link ? (
                                <a href={urlWithBaseUrl(feature.link)}>{feature.detail}</a>
                            ) : (
                                feature.detail
                            )}
                        </span>
                    </div>
                ))}
            </div>
            <div className={styles.buttonContainer}>
                {activeFeature.isEnterprise ? (
                    <TrialButton
                        id="request-trial-licence"
                        className={`button-secondary ${styles.trialCta} plausible-event-name=landing-page-features-trial-cta`}
                    >
                        Start Free Trial
                    </TrialButton>
                ) : (
                    <a
                        id="get-started"
                        href={urlWithBaseUrl(`${activeFeature.docsLink}`)}
                        className={`button-secondary ${styles.trialCta} plausible-event-name=landing-page-features-get-started-cta`}
                    >
                        Get Started
                    </a>
                )}
            </div>
        </div>
    ) : null;

    return (
        <>
            <div className={styles.tabContainer}>
                {features.map((feature, index) => (
                    <button
                        id={`feature-tab-${feature.id}`}
                        key={feature.id}
                        className={`${activeTab === index ? styles.activeTab : styles.tab} plausible-event-name=landing-page-${feature.id}-tab`}
                        onClick={() => handleTabClick(index)}
                    >
                        {feature.title}
                    </button>
                ))}
            </div>
            {contentTarget ? createPortal(featureContent, contentTarget) : featureContent}
        </>
    );
};

export default FeaturesWithExamplesContent;
