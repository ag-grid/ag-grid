import { Snippet } from '@ag-website-shared/components/snippet/Snippet';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import React from 'react';

import type { FrameworkConfig, CodeExamples } from '../../types';
import styles from './FeatureTabs.module.scss';

interface BasicFeaturesProps {
    config: FrameworkConfig;
    codeExamples: CodeExamples;
}

const BasicFeatures: React.FC<BasicFeaturesProps> = ({ config, codeExamples }) => {
    const { docsPath, productName, framework } = config;
    const { code, language } = codeExamples.basic;

    return (
        <div className={styles.columnContainer}>
            <div className={styles.column}>
                <div className={styles.featureContainer}>
                    <h3 className={styles.title}>Build</h3>
                    <div className={styles.feature}>
                        <h5 className={styles.featureHeading}>Get Started in Minutes</h5>
                        <span className={styles.featureDetail}>
                            Add {framework === 'react' ? 'a' : 'an'} {productName} with less than 15 lines of code.
                            Just add your data, and define your column structure. View the{' '}
                            <a href={urlWithBaseUrl(`./${docsPath}/getting-started/`)}>Quick Start</a> to learn more.
                        </span>
                    </div>
                    <div className={styles.feature}>
                        <h5 className={styles.featureHeading}>Handle Millions of Cells</h5>
                        <span className={styles.featureDetail}>
                            Easily handle millions of rows with our{' '}
                            <a href={urlWithBaseUrl(`./${docsPath}/row-models/#client-side`)}>Client-Side Row Model</a>{' '}
                            or upgrade to enterprise for{' '}
                            <a href={urlWithBaseUrl(`./${docsPath}/infinite-scrolling/`)}>Infinite Scrolling</a> with
                            our <a href={urlWithBaseUrl(`./${docsPath}/server-side-model/`)}>Server-Side Row Model</a>.
                        </span>
                    </div>
                    <div className={styles.feature}>
                        <h5 className={styles.featureHeading}>100s of Features</h5>
                        <span className={styles.featureDetail}>
                            Enable complex features with single properties, including:{' '}
                            <a href={urlWithBaseUrl(`./${docsPath}/row-sorting/#sorting`)}>Sorting</a>,{' '}
                            <a href={urlWithBaseUrl(`./${docsPath}/filtering/`)}>Filtering</a>,{' '}
                            <a href={urlWithBaseUrl(`./${docsPath}/cell-editing/`)}>Cell Editing</a>,{' '}
                            <a href={urlWithBaseUrl(`./${docsPath}/csv-export/`)}>CSV Export</a>,{' '}
                            <a href={urlWithBaseUrl(`./${docsPath}/row-pagination/`)}>Pagination</a>,{' '}
                            <a href={urlWithBaseUrl(`./${docsPath}/row-selection/`)}>Row Selection</a>, and{' '}
                            <a href={urlWithBaseUrl(`./${docsPath}/accessibility/`)}>Accessibility</a>.
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

export default BasicFeatures;
