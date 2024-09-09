import { Icon } from '@ag-website-shared/components/icon/Icon';
import React from 'react';

import styles from './FeaturesSection.module.scss';
import AdvancedFeatures from './tabs/advancedfeatures/AdvancedFeatures';
import BasicFeatures from './tabs/basicfeatures/BasicFeatures';
import CustomFeatures from './tabs/customfeatures/CustomFeatures';

const FeaturesSection: React.FC = () => {
    const [activeTab, setActiveTab] = React.useState(0);
    const tabs = [
        { title: 'Build', component: <BasicFeatures /> },
        { title: 'Customise', component: <CustomFeatures /> },
        { title: 'Expand', component: <AdvancedFeatures /> },
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
                            className={`${activeTab === index ? styles.activeTab : styles.tab} plausible-event-name=react-table-${tab.title.toLowerCase()}-tab`}
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
