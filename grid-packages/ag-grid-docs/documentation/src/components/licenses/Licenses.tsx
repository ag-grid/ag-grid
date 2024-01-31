import classnames from 'classnames';
import React, { FunctionComponent } from 'react';
import { Icon } from '../../components/Icon';
import { trackBuyButton } from '../../utils/analytics';
import AGGridLogo from '../../images/inline-svgs/ag-grid-logo.svg';
import AGChartsLogo from '../../images/inline-svgs/ag-charts-logo.svg';
import ChartsPricing from '../../images/inline-svgs/pricing-charts.svg';
import GridCommunity from '../../images/inline-svgs/pricing-community.svg';
import GridEnterprise from '../../images/inline-svgs/pricing-enterprise.svg';
import ChartsGrid from '../../images/inline-svgs/pricing-grid-charts.svg';
// @ts-ignore
import styles from '@design-system/modules/Licenses.module.scss';


type LicenseData = {
    className: string;
    id: string;
    subHeading: string;
    licenseBenefits: string[];
    priceFullDollars: string;
    launchPrice: any;
    buyLink: string;
    learnMoreLink: string;
    Logo: any;
    description: string;
};

const DEV_LICENSE_DATA: LicenseData[] = [
    {
        className: styles.gridLicense,
        id: 'community',
        subHeading: 'Community',
        description: 'Free for everyone, including production use',
        priceFullDollars: '0',
        launchPrice: null,
        licenseBenefits: ['Free to use', 'Basic grid features', 'Theming and customisation'],
        buyLink: 'https://ag-grid.com/react-data-grid/licensing/',
        learnMoreLink: "https://www.ag-grid.com/javascript-data-grid/licensing/",
        Logo: GridCommunity
    },
    {
        className: styles.gridLicense,
        id: 'grid',
        subHeading: 'Enterprise',
        description: 'All the grid features and support via Zendesk',
        priceFullDollars: '999',
        launchPrice: null,
        licenseBenefits: ['Community features + more', '1 year of support', '1 year of updates'],
        buyLink: 'https://www.ag-grid.com/ecommerce/#/ecommerce/?licenseType=single&productType=aggrid',
        learnMoreLink: "https://www.ag-grid.com/javascript-data-grid/licensing/",
        Logo: GridEnterprise
    },
    {
        className: styles.chartsLicense,
        id: 'togther',
        subHeading: 'Grid + Charts',
        description: 'Extend to our enterprise grid and charting library',
        licenseBenefits: ['Enterprise grid + chart library', '1 year of support', '1 year of updates'],
        priceFullDollars: '1198',
        launchPrice: null,
        buyLink: 'https://www.ag-grid.com/ecommerce/#/ecommerce/?licenseType=single&productType=both',
        learnMoreLink: "https://charts.ag-grid.com/javascript/licensing/",
        Logo: ChartsGrid
    },
    
];

const makeNonBreaking = (text: string) => {
    const nonBreakingSpace = '\u00A0';

    return text.replace(' ', nonBreakingSpace);
};

const Price = ({ priceFullDollars, launchPrice }) => {
    return (
        <div className={styles.price}>
            <p><b></b></p>
            <p className={styles.priceFullDollars}>
                {launchPrice ? launchPrice : priceFullDollars}
                { launchPrice && (
                    <>
                        <span className={styles.standardPrice}>
                            {priceFullDollars}
                        </span>
                    </>
                )}
                  <p className={styles.developerText}>
            per developer
            </p>
            </p>
          
        </div>
    );
};

const License = (props: LicenseData) => {
    const { id, description, subHeading, licenseBenefits, priceFullDollars, launchPrice, buyLink, learnMoreLink, Logo } = props;

    return (
        <>
            <div className={classnames(styles.top, 'top')} id={id}>
            {/* <Logo className={styles.logo}/> */}
                <div className={styles.licenseMeta}>
                <h2 className="">{subHeading}</h2>
                <p className="">{description}</p>
                  
                    {/* <p className="text-sm"><Icon name="enterprise" /> {subHeading}</p> */}
                </div>

                <Price priceFullDollars={priceFullDollars} launchPrice={launchPrice} />
                <div className={styles.licenseActions}>
                <a
                        className={`${id === 'community' ? 'button-tertiary' : 'button'} ${styles.pricing}`}
                        href={buyLink}
                        target="_blank"
                        onClick={() => {
                            trackBuyButton({
                                type: id,
                            });
                        }}
                    >
                           {id === 'community' ? 'Start for free' : 'Configure now'}
                    </a>
                </div>

                <div className={styles.licenseBenefits}>
                    <ul className="list-style-none">
                        {licenseBenefits.map((benefit, i) => {
                            return <li key={i}><Icon name="tick"/> {makeNonBreaking(benefit)}</li>;
                        })}
                    </ul>
                </div>
            </div>
        </>
    );
};

export const Licenses: FunctionComponent = () => {
    return (
        <>
            <div className={styles.emptyColumn}>
            <div className={styles.pricingText}>Pricing</div>
                
                </div> {/* Empty Column */}
            {DEV_LICENSE_DATA.map((data) => {
                return (
                    <div key={data.id} className={classnames(styles.license, data.className)}>
                        <License {...data} />
                    </div>
                );
            })}
        </>
    );
};
