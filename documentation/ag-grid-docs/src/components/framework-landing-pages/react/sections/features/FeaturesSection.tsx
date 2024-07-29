import { Icon } from '@ag-website-shared/components/icon/Icon';
import React from 'react';

import styles from './FeaturesSection.module.scss';
import AdvancedFeatures from './tabs/advancedfeatures/AdvancedFeatures';
import BasicFeatures from './tabs/basicfeatures/BasicFeatures';
import CustomFeatures from './tabs/customfeatures/CustomFeatures';

const FeaturesSection: React.FC = () => {
    const [activeTab, setActiveTab] = React.useState(0);

    const handleTabClick = (index: number) => {
        setActiveTab(index);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 0:
                return <BasicFeatures />;
            case 1:
                return <CustomFeatures />;
            case 2:
                return <AdvancedFeatures />;
            default:
                return null;
        }
    };

    return (
        <>
            <div className={styles.container}>
                <div className={styles.tabContainer}>
                    <button
                        className={activeTab === 0 ? styles.activeTab : styles.tab}
                        onClick={() => handleTabClick(0)}
                    >
                        Build
                    </button>
                    <div className={styles.divider}></div>
                    <button
                        className={activeTab === 1 ? styles.activeTab : styles.tab}
                        onClick={() => handleTabClick(1)}
                    >
                        Customise
                    </button>
                    <div className={styles.divider}></div>
                    <button
                        className={activeTab === 2 ? styles.activeTab : styles.tab}
                        onClick={() => handleTabClick(2)}
                    >
                        Expand
                    </button>
                </div>
                <div className={styles.contentContainer}>{renderTabContent()}</div>
                <div className={styles.buttonContainer}>
                    <button className={styles.featureNavButton} onClick={() => null}>
                        <Icon svgClasses={styles.featureNavIcon} name="arrowLeft" />
                    </button>
                    <button className={styles.featureNavButton} onClick={() => null}>
                        <Icon svgClasses={styles.featureNavIcon} name="arrowRight" />
                    </button>
                </div>
            </div>
        </>
    );
};

export default FeaturesSection;
