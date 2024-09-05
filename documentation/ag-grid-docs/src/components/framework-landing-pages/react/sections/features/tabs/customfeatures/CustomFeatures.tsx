import { Snippet } from '@ag-website-shared/components/snippet/Snippet';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import React from 'react';

import styles from './CustomFeatures.module.scss';

const CustomFeatures: React.FC = () => {
    const codeExample = `.ag-theme-quartz {
    /* Colours */
    --ag-foreground-color: rgb(126, 46, 132);
    --ag-background-color: rgb(249, 245, 227);
    /* Fonts */
    --ag-font-size: 17px;
    --ag-font-family: monospace;
    /* Sizing */
    --ag-grid-size: 3px; /* very compact */
    --ag-header-height: 30px;
    /* Borders */
    --ag-borders: none;
    --ag-row-border-style: dashed;
}
`;

    return (
        <div className={styles.columnContainer}>
            <div className={styles.column}>
                <div className={styles.featureContainer}>
                    <h3 className={styles.title}>Customise</h3>
                    <div className={styles.feature}>
                        <h5 className={styles.featureHeading}>100+ CSS Variables</h5>
                        <span className={styles.featureDetail}>
                            Customise every part of your react table with over{' '}
                            <a href={urlWithBaseUrl('./react-data-grid/global-style-customisation-variables/')}>
                                100 CSS variables
                            </a>
                            . Customise colours, spacing, fonts, and component styles.
                        </span>
                    </div>
                    <div className={styles.feature}>
                        <h5 className={styles.featureHeading}>4 Default Themes</h5>
                        <span className={styles.featureDetail}>
                            Choose from four themes including our new{' '}
                            <a href={urlWithBaseUrl('./example?theme=ag-theme-quartz')}>Quartz</a> and{' '}
                            <a href={urlWithBaseUrl('./example?theme=ag-theme-material/')}>Material</a> themes or design
                            your own theme with our <a href={urlWithBaseUrl('./theme-builder/')}>Theme Builder</a> or{' '}
                            <a href={urlWithBaseUrl('./react-data-grid/ag-grid-design-system/')}>Figma Design System</a>
                            .
                        </span>
                    </div>
                    <div className={styles.feature}>
                        <h5 className={styles.featureHeading}>Custom Components</h5>
                        <span className={styles.featureDetail}>
                            Override the default rendering of any part of the grid with your own{' '}
                            <a href={urlWithBaseUrl('./react-data-grid/component-cell-renderer/')}>
                                Custom React Components
                            </a>
                            . Add buttons to cells, define your own filtering logic, and add custom functionality.
                        </span>
                    </div>
                </div>
            </div>
            <div className={styles.column}>
                <div className={styles.gridContainer}>
                    <Snippet
                        framework={'react'}
                        language={'css'}
                        content={codeExample}
                        transform={false}
                        copyToClipboard
                    />
                </div>
            </div>
        </div>
    );
};

export default CustomFeatures;
