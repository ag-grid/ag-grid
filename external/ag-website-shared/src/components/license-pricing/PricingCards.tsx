import { Icon } from '@ag-website-shared/components/icon/Icon';
import classnames from 'classnames';
import { useState } from 'react';
import type { FunctionComponent } from 'react';

import chartsFeaturesData from '../../content/license-features/chartsFeaturesMatrix.json';
import gridFeaturesData from '../../content/license-features/gridFeaturesMatrix.json';
import styles from './PricingCards.module.scss';
import { ComparisonTable } from './comparison-table/ComparisonTable';
import { DEV_LICENSE_DATA, type LicenseData } from './licenseData';

/**
 * Which feature-matrix column this plan's mobile breakdown reads from. The desktop table is
 * hidden below the pricing breakpoint, so each card carries its own single-column copy of it.
 */
function breakdownField(id: string) {
    if (id === 'together') {
        return 'chartsGrid';
    }
    return id.includes('enterprise') ? 'enterprise' : 'community';
}

const Price: FunctionComponent<{ priceFullDollars: string }> = ({ priceFullDollars }) => (
    <p className={styles.price}>
        <span className={styles.priceCost}>${priceFullDollars}</span>
        <span className={styles.priceUnit}>per developer</span>
    </p>
);

const PricingCard: FunctionComponent<{ license: LicenseData; isChecked: boolean }> = ({ license, isChecked }) => {
    const { id, subHeading, description, priceFullDollars, buyLink, features, ctaLabel, ctaIcon, ctaId, tableColumn } =
        license;
    const [showFeatureBreakdown, setShowFeatureBreakdown] = useState(false);

    const featuresData = isChecked ? chartsFeaturesData : gridFeaturesData;
    const field = breakdownField(id);

    return (
        // The id is load-bearing: ComparisonTable.module.scss keys its mobile sub-group
        // column hiding off the enclosing plan id.
        <div id={id} className={classnames(styles.card, license.highlighted && styles.highlighted)}>
            <div className={styles.cardBody}>
                <h3 className={styles.cardHeading}>{subHeading}</h3>
                <p className={styles.cardDescription}>{description}</p>

                {priceFullDollars ? <Price priceFullDollars={priceFullDollars} /> : <div className={styles.priceGap} />}

                <a
                    id={ctaId}
                    className={classnames(
                        styles.cardCta,
                        // The highlighted card carries the tertiary button too, retinted against
                        // its inverted background.
                        license.highlighted || id === 'community' ? 'button-tertiary' : 'button',
                        license.highlighted && styles.highlightedCta
                    )}
                    href={buyLink}
                >
                    {ctaIcon && <Icon name={ctaIcon} />}
                    {ctaLabel}
                </a>

                <ul className={styles.featureList}>
                    {features.map((feature) => (
                        <li key={feature}>
                            <Icon name="tick" />
                            {feature}
                        </li>
                    ))}
                </ul>
            </div>

            {tableColumn && (
                <>
                    <button
                        type="button"
                        className={styles.toggleFeatureBreakdownButton}
                        aria-expanded={showFeatureBreakdown}
                        onClick={() => setShowFeatureBreakdown(!showFeatureBreakdown)}
                    >
                        {showFeatureBreakdown ? 'Hide Feature Breakdown' : 'Show Feature Breakdown'}
                    </button>

                    {showFeatureBreakdown && (
                        <div className={styles.mobileFeatureMatrix}>
                            {featuresData.map((section, i) => (
                                <div key={i}>
                                    <h4 className={styles.categoryTableHeader}>{section.group.name}</h4>
                                    <ComparisonTable
                                        data={section.items}
                                        columns={{ label: '', [field]: '' }}
                                        cellRenderer={{ label: 'label', [field]: 'feature' }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export const PricingCards: FunctionComponent<{ isChecked: boolean }> = ({ isChecked }) => {
    const filteredData = DEV_LICENSE_DATA.filter(
        (data) => data.tabGroup === 'both' || (isChecked ? data.tabGroup === 'charts' : data.tabGroup === 'grid')
    );

    return (
        <div className={styles.cards}>
            {filteredData.map((license) => (
                <PricingCard key={license.subHeading} license={license} isChecked={isChecked} />
            ))}
        </div>
    );
};
