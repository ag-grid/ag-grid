import { Snippet } from '@ag-website-shared/components/snippet/Snippet';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import React from 'react';

import type { FrameworkConfig, CodeExamples } from '../../types';
import styles from './FeatureTabs.module.scss';

interface AdvancedFeaturesProps {
    config: FrameworkConfig;
    codeExamples: CodeExamples;
}

const AdvancedFeatures: React.FC<AdvancedFeaturesProps> = ({ config, codeExamples }) => {
    const { docsPath, productName, framework } = config;
    const { code, language } = codeExamples.advanced;

    return (
        <div className={styles.columnContainer}>
            <div className={styles.column}>
                <div className={styles.featureContainer}>
                    <h3 className={styles.title}>Expand</h3>
                    <div className={styles.feature}>
                        <h5 className={styles.featureHeading}>Advanced Features</h5>
                        <span className={styles.featureDetail}>
                            <a href={urlWithBaseUrl(`./${docsPath}/integrated-charts/`)}>Build charts</a> directly from
                            your {productName}. Perform data analysis with{' '}
                            <a href={urlWithBaseUrl(`./${docsPath}/grouping/`)}>Row Grouping</a>,{' '}
                            <a href={urlWithBaseUrl(`./${docsPath}/pivoting/`)}>Pivoting</a> and{' '}
                            <a href={urlWithBaseUrl(`./${docsPath}/master-detail/`)}>Master/Detail</a> features. Access
                            all features from our{' '}
                            <a href={urlWithBaseUrl(`./${docsPath}/side-bar/`)}>Accessory Panels</a>.
                        </span>
                    </div>
                    <div className={styles.feature}>
                        <h5 className={styles.featureHeading}>Dedicated Support</h5>
                        <span className={styles.featureDetail}>
                            Access dedicated support via{' '}
                            <a href={urlWithBaseUrl('https://ag-grid.zendesk.com/hc/en-us')}>Zendesk</a>, monitored by
                            our support teams 365 days a year, to help build your perfect {productName}.
                        </span>
                    </div>
                    <div className={styles.feature}>
                        <h5 className={styles.featureHeading}>AG Charts</h5>
                        <span className={styles.featureDetail}>
                            Purchase a discounted bundle licence to access all of the advanced features and additional
                            series types available in{' '}
                            <a href={urlWithBaseUrl('https://www.ag-grid.com/charts/')}>AG Charts</a> Enterprise.
                        </span>
                    </div>
                </div>
            </div>
            <div className={styles.column}>
                <Snippet framework={framework} language={language} content={code} transform={false} copyToClipboard />
            </div>
        </div>
    );
};

export default AdvancedFeatures;
