import { Icon } from '@ag-website-shared/components/icon/Icon';
import React from 'react';

import { CODE_EXAMPLES, FRAMEWORK_CONFIGS } from '../types';
import styles from './FeaturesSection.module.scss';
import AdvancedFeatures from './tabs/AdvancedFeatures';
import BasicFeatures from './tabs/BasicFeatures';
import CustomFeatures from './tabs/CustomFeatures';

type SupportedFramework = keyof typeof FRAMEWORK_CONFIGS;

interface FeaturesSectionProps {
    framework: SupportedFramework;
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ framework }) => {
    const config = FRAMEWORK_CONFIGS[framework];
    const codeExamples = CODE_EXAMPLES[framework];

    const [activeTab, setActiveTab] = React.useState(0);
    const tabs = [
        { title: 'Build', component: <BasicFeatures config={config} codeExamples={codeExamples} /> },
        { title: 'Customise', component: <CustomFeatures config={config} codeExamples={codeExamples} /> },
        { title: 'Expand', component: <AdvancedFeatures config={config} codeExamples={codeExamples} /> },
    ];

    const handleTabClick = (index: number) => {
        if (index >= tabs.length) {
            setActiveTab(0); // Loop to the first tab if the index exceeds the last tab
        } else if (index < 0) {
            setActiveTab(tabs.length - 1); // Loop to the last tab if the index is below the first tab
        } else {
            setActiveTab(index);
        }
    };

    return (
        <>
            <div className={styles.container}>
                <div className={styles.tabContainer}>
                    {tabs.map((tab, index) => (
                        <button
                            key={index}
                            id={`feature-tab-${tab.title.toLowerCase()}`}
                            className={`${activeTab === index ? styles.activeTab : styles.tab} plausible-event-name=${config.analyticsPrefix}-${tab.title.toLowerCase()}-tab`}
                            onClick={() => handleTabClick(index)}
                        >
                            {tab.title}
                        </button>
                    ))}
                </div>
                <div className={styles.contentContainer}>{tabs[activeTab]?.component}</div>
                <div className={styles.buttonContainer}>
                    <span
                        onClick={() => handleTabClick(activeTab - 1)}
                        onMouseDown={(e) => e.preventDefault()}
                        role="button"
                        className="icon-button"
                    >
                        <Icon svgClasses={styles.featureNavIcon} name="arrowLeft" />
                    </span>

                    <span
                        onClick={() => handleTabClick(activeTab + 1)}
                        onMouseDown={(e) => e.preventDefault()}
                        role="button"
                        className="icon-button"
                    >
                        <Icon svgClasses={styles.featureNavIcon} name="arrowRight" />
                    </span>
                </div>
            </div>
        </>
    );
};

export default FeaturesSection;
