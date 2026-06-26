import { Collapsible } from '@ag-website-shared/components/collapsible/Collapsible';
import { Icon } from '@ag-website-shared/components/icon/Icon';
import { TrialButton } from '@ag-website-shared/components/trial-licence-modal/TrialButton';
import gridFeaturesData from '@ag-website-shared/content/license-features/gridFeaturesMatrix.json';
import { resolveSharedUrl } from '@ag-website-shared/utils/resolveSharedUrl';
import { useFrameworkFromStore } from '@utils/hooks/useFrameworkFromStore';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import { urlWithPrefix } from '@utils/urlWithPrefix';
import classnames from 'classnames';
import React, { useState } from 'react';

import styles from './ComparisonTable.module.scss';

const PREVIEW_GROUPS = 3; // Show first 3 groups in preview

interface FeatureValue {
    value?: boolean;
    detail?: string;
}

interface LabelValue {
    name: string;
    link?: string;
}

interface FeatureItem {
    label?: LabelValue;
    name?: string;
    community: boolean | FeatureValue;
    enterprise: boolean | FeatureValue;
    chartsGrid: boolean | FeatureValue;
    isSubGroup?: boolean;
    items?: FeatureItem[];
}

interface FeatureGroup {
    group: {
        name: string;
    };
    items: FeatureItem[];
}

const getFeatureValue = (value: boolean | FeatureValue): boolean => {
    if (typeof value === 'boolean') {
        return value;
    }
    return value?.value ?? false;
};

const FeatureIcon: React.FC<{ value: boolean | FeatureValue }> = ({ value }) => {
    const boolValue = getFeatureValue(value);
    if (boolValue) {
        return (
            <span className={styles.tick}>
                <Icon name="tick" svgClasses={styles.tickIcon} />
            </span>
        );
    }
    return <span className={styles.dash}>—</span>;
};

const FeatureLabel: React.FC<{ item: FeatureItem }> = ({ item }) => {
    const framework = useFrameworkFromStore();
    const name = item.label?.name || item.name || '';
    const link = item.label?.link;
    if (link) {
        const url = urlWithPrefix({ url: resolveSharedUrl({ url: link, framework }), framework });

        return (
            <a href={url} target="_blank" rel="noopener noreferrer">
                {name}
            </a>
        );
    }
    return <>{name}</>;
};

const SubGroupRow: React.FC<{ item: FeatureItem; index: number }> = ({ item, index }) => {
    const [isOpen, setIsOpen] = useState(false);

    const allCommunity = item.items?.every((subItem) => getFeatureValue(subItem.community)) ?? false;

    return (
        <div className={classnames(styles.subGroup, isOpen ? styles.isOpen : undefined)}>
            <div className={styles.subGroupHeader} onClick={() => setIsOpen(!isOpen)}>
                <div className={styles.featureNameCell}>
                    <span className={styles.subGroupTitle}>
                        {item.name}
                        <span className={styles.subGroupIconWrapper}>
                            <Icon name="chevronDown" />
                        </span>
                    </span>
                </div>
                <div className={styles.communityCell}>
                    <FeatureIcon value={allCommunity} />
                </div>
                <div className={styles.enterpriseCell}>
                    <FeatureIcon value={true} />
                </div>
                <div className={styles.enterpriseCell}>
                    <FeatureIcon value={true} />
                </div>
            </div>
            <Collapsible id={`subgroup-${index}`} isDisabled={false} isOpen={isOpen}>
                <div className={styles.subGroupContent}>
                    {item.items?.map((subItem, subIndex) => (
                        <div key={subIndex} className={styles.featureRow}>
                            <div className={styles.featureNameCell}>
                                <FeatureLabel item={subItem} />
                            </div>
                            <div className={styles.communityCell}>
                                <FeatureIcon value={subItem.community} />
                            </div>
                            <div className={styles.enterpriseCell}>
                                <FeatureIcon value={subItem.enterprise} />
                            </div>
                            <div className={styles.enterpriseCell}>
                                <FeatureIcon value={subItem.chartsGrid} />
                            </div>
                        </div>
                    ))}
                </div>
            </Collapsible>
        </div>
    );
};

const FeatureRow: React.FC<{ item: FeatureItem; index: number }> = ({ item, index }) => {
    if (item.isSubGroup) {
        return <SubGroupRow item={item} index={index} />;
    }

    return (
        <div className={styles.featureRow}>
            <div className={styles.featureNameCell}>
                <FeatureLabel item={item} />
            </div>
            <div className={styles.communityCell}>
                <FeatureIcon value={item.community} />
            </div>
            <div className={styles.enterpriseCell}>
                <FeatureIcon value={item.enterprise} />
            </div>
            <div className={styles.enterpriseCell}>
                <FeatureIcon value={item.chartsGrid} />
            </div>
        </div>
    );
};

const GroupSection: React.FC<{ group: FeatureGroup }> = ({ group }) => (
    <div className={styles.groupSection}>
        <div className={styles.categoryRow}>
            <span>{group.group.name}</span>
        </div>
        {group.items.map((item, index) => (
            <FeatureRow key={index} item={item} index={index} />
        ))}
    </div>
);

const ComparisonTable: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    const data = gridFeaturesData as FeatureGroup[];
    const previewGroups = data.slice(0, PREVIEW_GROUPS);
    const expandedGroups = data.slice(PREVIEW_GROUPS);
    const hasMoreGroups = expandedGroups.length > 0;

    return (
        <div className={styles.container}>
            <div className={styles.tableWrapper}>
                <div className={styles.tableHeader}>
                    <div className={styles.headerCellFeature}></div>
                    <div className={styles.headerCellCommunity}>
                        <span className={styles.headerTitle}>Community</span>
                        <span className={styles.headerSubtitle}>Free Forever</span>
                    </div>
                    <div className={styles.headerCellEnterprise}>
                        <span className={styles.headerTitle}>Enterprise</span>
                        <span className={styles.headerSubtitle}>$999/dev</span>
                    </div>
                    <div className={styles.headerCellEnterprise}>
                        <span className={styles.headerTitle}>Enterprise Bundle</span>
                        <span className={styles.headerSubtitle}>$1,498/dev</span>
                    </div>
                </div>
                <div className={styles.tableBody}>
                    {previewGroups.map((group, index) => (
                        <GroupSection key={index} group={group} />
                    ))}

                    {hasMoreGroups && (
                        <div className={`${styles.expandedSection} ${isExpanded ? styles.expanded : ''}`}>
                            <div className={styles.expandedContent}>
                                {expandedGroups.map((group, index) => (
                                    <GroupSection key={index} group={group} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {hasMoreGroups && (
                    <button
                        className={`${styles.expandButton} ${isExpanded ? styles.expanded : ''}`}
                        onClick={() => setIsExpanded(!isExpanded)}
                        aria-expanded={isExpanded}
                    >
                        <span>{isExpanded ? 'Show Less' : `Show ${expandedGroups.length} More Categories`}</span>
                        <Icon name="chevronDown" svgClasses={styles.expandIcon} />
                    </button>
                )}
            </div>
            <div className={styles.ctaContainer}>
                <a
                    href={urlWithBaseUrl('./license-pricing/')}
                    className={`button ${styles.ctaButton} plausible-event-name=enterprise-comparison-pricing`}
                >
                    View Full Pricing
                </a>
                <TrialButton
                    className={`button-tertiary ${styles.ctaButtonSecondary} plausible-event-name=enterprise-comparison-trial`}
                >
                    Start Free Trial
                </TrialButton>
            </div>
        </div>
    );
};

export default ComparisonTable;
