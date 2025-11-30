import { Snippet } from '@ag-website-shared/components/snippet/Snippet';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import React from 'react';

import type { FrameworkConfig, CodeExamples } from '../../types';
import styles from './FeatureTabs.module.scss';

interface CustomFeaturesProps {
    config: FrameworkConfig;
    codeExamples: CodeExamples;
}

const CustomFeatures: React.FC<CustomFeaturesProps> = ({ config, codeExamples }) => {
    const { docsPath, framework } = config;
    const { code, language } = codeExamples.custom;

    return (
        <div className={styles.columnContainer}>
            <div className={styles.column}>
                <div className={styles.featureContainer}>
                    <h3 className={styles.title}>Customise</h3>
                    <div className={styles.feature}>
                        <h5 className={styles.featureHeading}>Flexible Theming API</h5>
                        <span className={styles.featureDetail}>
                            Customise our <a href={`./${docsPath}/themes/`}>Built-in Themes</a> with the{' '}
                            <a href={`./${docsPath}/theming/`}>Theming API</a>. Define a{' '}
                            <a href={`./${docsPath}/theming-colors/#colour-schemes`}>Color Scheme</a>, modify{' '}
                            <a href={`/${docsPath}/theming-parameters/`}>Theme Parameters</a>, mix and match{' '}
                            <a href={`./${docsPath}/theming-parts/`}>Theme Parts</a>, and use{' '}
                            <a href={`./${docsPath}/theming-css/`}>CSS</a> for unlimited control.
                        </span>
                    </div>
                    <div className={styles.feature}>
                        <h5 className={styles.featureHeading}>Powerful Theming Tools</h5>
                        <span className={styles.featureDetail}>
                            Use our <a href={urlWithBaseUrl('./theme-builder/')}>Theme Builder</a> to create
                            ready-to-use custom themes which can be imported into your app, or build them from scratch
                            with our{' '}
                            <a href={urlWithBaseUrl(`./${docsPath}/ag-grid-design-system/`)}>Figma Design System</a>.
                        </span>
                    </div>
                    <div className={styles.feature}>
                        <h5 className={styles.featureHeading}>Custom Components</h5>
                        <span className={styles.featureDetail}>
                            Override the default rendering of any part of the grid with your own{' '}
                            <a href={urlWithBaseUrl(`./${docsPath}/component-cell-renderer/`)}>
                                Custom {framework === 'react' ? 'React' : 'Angular'} Components
                            </a>
                            . Add buttons to cells, define your own filtering logic, and add custom functionality.
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

export default CustomFeatures;
