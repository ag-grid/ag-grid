// import { trackBuyButton } from '@utils/analytics';
import classnames from 'classnames';
import { useState } from 'react';
import type { FunctionComponent } from 'react';

import chartsFeaturesData from '../../content/license-features/chartsFeaturesMatrix.json';
import gridFeaturesData from '../../content/license-features/gridFeaturesMatrix.json';
import styles from './Licenses.module.scss';
import { ComparisonTable } from './comparison-table/ComparisonTable';
import { DEV_LICENSE_DATA, type LicenseData } from './licenseData';

const Price: FunctionComponent<{ priceFullDollars: string }> = ({ priceFullDollars }) => {
    const hasCost = priceFullDollars !== '0';

    return (
        <div className={styles.price}>
            {hasCost && <span className={styles.fromText}>From</span>}

            <p className={classnames(styles.priceFullDollars, !hasCost ? styles.freePrice : '')}>
                <span className={styles.priceCost}>{hasCost ? `$${priceFullDollars}` : 'Free'}</span>
                <span className={styles.dollar}>{hasCost ? `USD` : ''}</span>
            </p>
            {hasCost && <p className={styles.developerText}>per developer</p>}
        </div>
    );
};

const License: FunctionComponent<LicenseData> = (props: LicenseData) => {
    const { id, description, subHeading, priceFullDollars, buyLink } = props;
    const ctaId = id === 'community' ? 'get-started' : id.includes('enterprise') ? 'buy-now' : 'bundle-buy-now';

    return (
        <>
            <div className={styles.top}>
                <div className={styles.licenseMeta}>
                    <h2>{subHeading}</h2>
                    <p dangerouslySetInnerHTML={{ __html: description }}></p>
                </div>

                <Price priceFullDollars={priceFullDollars} />

                <div className={styles.licenseActions}>
                    <a
                        id={ctaId}
                        className={`${id === 'community' ? 'button-tertiary' : 'button'} ${styles.pricing}`}
                        href={buyLink}
                        target="_blank"
                        // TODO replace pricing analytics
                        // onClick={() => {
                        //     trackBuyButton({
                        //         type: id,
                        //     });
                        // }}
                    >
                        {id === 'community' ? 'Get started' : 'Buy now'}
                    </a>
                </div>
            </div>
        </>
    );
};

// Only styled below the pricing breakpoint, where the columns stack and the column gradient stops.
function tierEmphasisClass(id: string) {
    if (id === 'together') return styles.bundleTier;
    return id.includes('enterprise') ? styles.enterpriseTier : undefined;
}

export const Licenses: FunctionComponent<{ isChecked: boolean }> = ({ isChecked }) => {
    const filteredData = DEV_LICENSE_DATA.filter(
        (data) => data.tabGroup === 'both' || (isChecked ? data.tabGroup === 'charts' : data.tabGroup === 'grid')
    );

    const featuresData = !isChecked ? gridFeaturesData : chartsFeaturesData;

    return (
        <>
            <div className={styles.emptyColumn}></div>

            {filteredData.map((data) => {
                let columns, cellRenderer;

                if (data.id === 'together') {
                    // Correcting the typo to 'together' if necessary
                    columns = {
                        label: '',
                        chartsGrid: '',
                    };
                    cellRenderer = {
                        label: 'label',
                        chartsGrid: 'feature',
                    };
                } else {
                    columns = {
                        label: '',
                        [data.id.includes('enterprise') ? 'enterprise' : 'community']: '',
                    };
                    cellRenderer = {
                        label: 'label',
                        [data.id.includes('enterprise') ? 'enterprise' : 'community']: 'feature',
                    };
                }

                const [showFeatureBreakdown, setShowFeatureBreakdown] = useState(false);

                const toggleFeatureBreakdown = () => {
                    setShowFeatureBreakdown(!showFeatureBreakdown);
                };

                return (
                    <div key={data.id} id={data.id} className={classnames(styles.license, tierEmphasisClass(data.id))}>
                        <License {...data} />

                        <span className={styles.toggleFeatureBreakdownButton} onClick={toggleFeatureBreakdown}>
                            {showFeatureBreakdown ? 'Hide Feature Breakdown' : 'Show Feature Breakdown'}
                        </span>

                        {showFeatureBreakdown && (
                            <div className={styles.mobileFeatureMatrix}>
                                {featuresData.map((section, i) => (
                                    <div className={styles.tableContainer} key={i}>
                                        <h4 className={styles.categoryTableHeader}>{section.group.name}</h4>
                                        <ComparisonTable
                                            data={section.items}
                                            columns={columns}
                                            cellRenderer={cellRenderer}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </>
    );
};
