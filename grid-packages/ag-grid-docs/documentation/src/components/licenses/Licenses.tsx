import classnames from 'classnames';
import React, { FunctionComponent } from 'react';
import { Icon } from '../../components/Icon';
import { trackBuyButton } from '../../utils/analytics';
import AGGridLogo from '../../images/inline-svgs/ag-grid-logo.svg';
import AGChartsLogo from '../../images/inline-svgs/ag-charts-logo.svg';

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
};

const DEV_LICENSE_DATA: LicenseData[] = [
    {
        className: styles.gridLicense,
        id: 'grid',
        subHeading: 'Enterprise',
        priceFullDollars: '999',
        launchPrice: null,
        licenseBenefits: ['Perpetual License', '1 Year of Support', '1 Year of Updates'],
        buyLink: 'https://www.ag-grid.com/ecommerce/#/ecommerce/?licenseType=single&productType=aggrid',
        learnMoreLink: "https://www.ag-grid.com/javascript-data-grid/licensing/",
        Logo: AGGridLogo
    },
    {
        className: styles.chartsLicense,
        id: 'charts',
        subHeading: 'Enterprise',
        licenseBenefits: ['Perpetual License', '1 Year of Support', '1 Year of Updates'],
        priceFullDollars: '399',
        launchPrice: '199',
        buyLink: 'https://www.ag-grid.com/ecommerce/#/ecommerce/?licenseType=single&productType=agcharts',
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
            <p><b>Starting at...</b></p>
            <p className={styles.priceFullDollars}>
                {launchPrice ? launchPrice : priceFullDollars}
                { launchPrice && (
                    <>
                        <span className={styles.standardPrice}>
                            {priceFullDollars}
                        </span>
                    </>
                )}
            </p>
            <p>
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
                    <p className="font-size-small"><Icon name="enterprise" /> {subHeading}</p>
                </div>

                <Price priceFullDollars={priceFullDollars} launchPrice={launchPrice} />

                <div className={styles.licenseBenefits}>
                    <ul className="list-style-none">
                        {licenseBenefits.map((benefit, i) => {
                            return <li key={i}><Icon name="tick"/> {makeNonBreaking(benefit)}</li>;
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
                        target="_blank"
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
                    <div key={data.id} className={classnames(styles.license, data.className)}>
                        <License {...data} />
                    </div>
                );
            })}
        </>
    );
};
