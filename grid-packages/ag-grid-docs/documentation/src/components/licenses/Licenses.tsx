import classnames from 'classnames';
import React, { FunctionComponent } from 'react';
import { Icon } from '../../components/Icon';
import { trackBuyButton } from '../../utils/analytics';
import AGGridLogo from '../../images/inline-svgs/ag-grid-logo.svg';
import AGChartsLogo from '../../images/inline-svgs/ag-charts-logo.svg';

// @ts-ignore
import styles from './Licenses.module.scss';

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
};

const DEV_LICENSE_DATA: LicenseData[] = [
    {
        className: styles.gridLicense,
        id: 'single-application',
        subHeading: 'AG Grid Enterprise',
        priceFullDollars: '999',
        launchPrice: null,
        licenseBenefits: ['Perpetual License', '1 Year of Support', '1 Year of Updates'],
        buyLink: 'https://ag-grid.com/ecommerce/#/ecommerce/?licenseType=single&productType=aggrid',
        learnMoreLink: "https://ag-grid.com/javascript-data-grid/licensing/",
        Logo: AGGridLogo
    },
    {
        className: styles.chartsLicense,
        id: 'single-application',
        subHeading: 'AG Charts Enterprise',
        licenseBenefits: ['Perpetual License', '1 Year of Support', '1 Year of Updates'],
        priceFullDollars: '399',
        launchPrice: '199',
        buyLink: 'https://ag-grid.com/ecommerce/#/ecommerce/?licenseType=single&productType=agcharts',
        learnMoreLink: "https://charts.ag-grid.com/javascript/licensing/",
        Logo: AGChartsLogo
    },
];

const makeNonBreaking = (text: string) => {
    const nonBreakingSpace = '\u00A0';

    return text.replace(' ', nonBreakingSpace);
};

const Price = ({ priceFullDollars, launchPrice }) => {
    return (
        <div className={styles.price}>
            <p className="font-size-small"><b>Starting at...</b></p>
            { launchPrice && (
                <>
                    <p className={styles.standardPrice}>
                        {priceFullDollars}
                        <svg className={styles.standardPriceCross} viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="m0 0 100 100M100 0 0 100"/>
                        </svg>
                    </p>
                </>
            )}
            <p className={styles.priceFullDollars}>{launchPrice ? launchPrice : priceFullDollars}</p>
            <p className="font-size-small">
                <b>Per Developer</b>
            </p>
        </div>
    );
};

const License = (props: LicenseData) => {
    const { id, subHeading, licenseBenefits, priceFullDollars, launchPrice, buyLink, learnMoreLink, Logo } = props;

    return (
        <>
            <div className={classnames(styles.top, 'top')}>
                <div className={styles.licenseMeta}>
                    <Logo className={styles.logo}/>
                    <p className="font-size-small">{subHeading}<Icon name="enterprise" /></p>
                </div>

                <Price priceFullDollars={priceFullDollars} launchPrice={launchPrice} />

                <div className={styles.licenseBenefits}>
                    <ul className="font-size-small list-style-none">
                        {licenseBenefits.map((benefit, i) => {
                            return <li key={i}>{makeNonBreaking(benefit)}</li>;
                        })}
                    </ul>

                    <a className={classnames(styles.learnMoreLink, 'font-size-small')} href={learnMoreLink}>
                        Learn more
                    </a>
                </div>

                
                <div className={styles.launchExplainer}>
                    { launchPrice && (
                        <>
                            <p className='font-size-small'>Limited time launch price</p>
                            <p className='font-size-small'>Standard price <b>${priceFullDollars}</b></p>
                        </>
                    )}
                </div>

                <div className={styles.licenseActions}>
                    <a
                        className="button"
                        href={buyLink}
                        target="_parent"
                        onClick={() => {
                            trackBuyButton({
                                type: id,
                            });
                        }}
                    >
                        Configure Now
                    </a>
                </div>
            </div>
        </>
    );
};

export const Licenses: FunctionComponent = () => {
    return (
        <>
            {DEV_LICENSE_DATA.map((data) => {
                return (
                    <div key={data.name} className={classnames(styles.license, data.className, 'card')}>
                        <License {...data} />
                    </div>
                );
            })}
        </>
    );
};
