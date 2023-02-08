import classnames from 'classnames';
import React from 'react';
// @ts-ignore
import styles from './Licenses.module.scss';

type LicenseDataBase = {
    className: string;
    image: string;
    name: string;
    subHeading: string;
    priceFullDollars: string;
    pricePer: string;
};
type LicenseBuyButton = LicenseDataBase & {
    buyLink: string;
};
type LicenseBuyText = LicenseDataBase & {
    buyText: string;
};
type LicenseData = LicenseBuyButton | LicenseBuyText;

const LICENSE_DATA: LicenseData[] = [
    {
        className: styles.singleApplicationLicense,
        image: '../images/pricing/SA.svg',
        name: 'Single Application',
        subHeading: 'Development License',
        priceFullDollars: '999',
        pricePer: 'Developer',
        buyLink: '/ecommerce/#/ecommerce/?licenseType=single',
    },
    {
        className: styles.multipleApplicationsLicense,
        image: '../images/pricing/MA.svg',
        name: 'Multiple Applications',
        subHeading: 'Development License',
        priceFullDollars: '1,499',
        pricePer: 'Developer',
        buyLink: '/ecommerce/#/ecommerce/?licenseType=multi',
    },
    {
        className: styles.deploymentLicense,
        image: '../images/pricing/Deployment%20Add-on.svg',
        name: 'Deployment License',
        subHeading: 'Add-on',
        priceFullDollars: '750',
        pricePer: 'Application Production Environment',
        buyText: 'Buy with a Development License',
    },
];

const LicensePrice = (props: LicenseData) => {
    const { className, image, name, subHeading, priceFullDollars, pricePer } = props;

    return (
        <>
            <img src={image} alt={name} />
            <div className={styles.licenseHeader}>
                <span className="font-size-small">AG Grid Enterprise</span>
                <h2>{name}</h2>
                <span className="font-size-small">{subHeading}</span>
            </div>

            <div className={styles.licensePrice}>
                <p>Starting at</p>
                <p>
                    <span className={styles.price}>&#x24;{priceFullDollars}</span>.00
                </p>
                <p>Per {pricePer}</p>
            </div>

            <div className={styles.licenseFooter}>
                {(props as LicenseBuyButton).buyLink ? (
                    <a
                        className={classnames(styles.buyButton, 'button')}
                        href={(props as LicenseBuyButton).buyLink}
                        target="_blank"
                        rel="noreferrer"
                    >
                        Buy
                    </a>
                ) : (
                    <div className={styles.buyText}>{(props as LicenseBuyText).buyText}</div>
                )}
            </div>
        </>
    );
};

export const Licenses = () => {
    return (
        <ul className={classnames('list-style-none', styles.licenses)}>
            {LICENSE_DATA.map((data) => {
                return (
                    <li key={data.name} className={classnames(styles.license, data.className)}>
                        <LicensePrice {...data} />
                    </li>
                );
            })}
        </ul>
    );
};
