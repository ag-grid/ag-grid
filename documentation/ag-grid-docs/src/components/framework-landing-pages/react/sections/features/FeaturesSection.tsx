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
            setActiveTab(tabs.length - 1);
        } else if (index <= 0) {
            setActiveTab(0);
        } else setActiveTab(index);
    };

    return (
        <>
            <div className={styles.container}>
                <div className={styles.tabContainer}>
                    {tabs.map((tab, index) => (
                        <button
                            key={index}
                            className={activeTab === index ? styles.activeTab : styles.tab}
                            onClick={() => handleTabClick(index)}
                        >
                            {tab.title}
                        </button>
                    ))}
                </div>
                <div className={styles.contentContainer}>{tabs[activeTab]?.component}</div>
                <div className={styles.buttonContainer}>
                    <Icon
                        onClick={() => handleTabClick(activeTab - 1)}
                        svgClasses={`${activeTab === 0 ? styles.featureNavIconDisabled : styles.featureNavIcon}`}
                        name="arrowLeft"
                    />
                    <Icon
                        onClick={() => handleTabClick(activeTab + 1)}
                        svgClasses={`${activeTab === 2 ? styles.featureNavIconDisabled : styles.featureNavIcon}`}
                        name="arrowRight"
                    />
                </div>
            </div>
        </>
    );
};

export default FeaturesSection;
