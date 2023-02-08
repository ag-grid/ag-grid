import classnames from 'classnames';
import React from 'react';
import EnterpriseIcon from '../../images/inline-svgs/enterprise.svg';
// @ts-ignore
import styles from './Licenses.module.scss';

type LicenseDataBase = {
    className: string;
    name: string;
    id: string;
    subHeading: string;
    licenceBenifits: string[];
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

const DEV_LICENSE_DATA: LicenseData[] = [
    {
        className: styles.singleApplicationLicense,
        name: 'Single Application',
        id: 'single-application',
        subHeading: 'Development License',
        priceFullDollars: '999',
        licenceBenifits: ['Perpetual licence', '1 year of support', '1 year of updates'],
        pricePer: 'Developer',
        buyLink: '/ecommerce/#/ecommerce/?licenseType=single',
    },
    {
        className: styles.multipleApplicationsLicense,
        name: 'Multiple Applications',
        id: 'multiple-applications',
        subHeading: 'Development License',
        licenceBenifits: ['Unlimited applications', 'Perpetual licence', '1 year of support', '1 year of updates'],
        priceFullDollars: '1,499',
        pricePer: 'Developer',
        buyLink: '/ecommerce/#/ecommerce/?licenseType=multi',
    },
];

const DEPLOY_LICENSE_DATA = {
    name: 'Deployment License',
    id: 'deployment',
    subHeading: 'Add-on',
    priceFullDollars: '750',
    pricePer: 'Application Production Environment',
    buyText: 'Buy with a Development License',
};

const Price = ({ priceFullDollars, pricePer }) => {
    return (
        <div className={styles.price}>
            <p className="font-size-small text-secondary">Starting at</p>
            <p className={styles.priceFullDollars}>{priceFullDollars}</p>
            <p className="font-size-small text-secondary">Per {pricePer}</p>
        </div>
    );
};

const DevelopmentLicence = () => {
    return (
        <div className="bottom">
            <div className={styles.licenceMeta}>
                <p className={styles.name}>{DEPLOY_LICENSE_DATA.name}</p>
                <p className="font-size-small text-secondary">{DEPLOY_LICENSE_DATA.subHeading}</p>
            </div>

            <Price priceFullDollars={DEPLOY_LICENSE_DATA.priceFullDollars} pricePer={DEPLOY_LICENSE_DATA.pricePer} />

            <p className={classnames(styles.devLicenceRequired, 'font-size-extra-small')}>
                Required to deploy for external users{' '}
                <a className={styles.learnMoreLink} href={`#${DEPLOY_LICENSE_DATA.id}`}>
                    Learn more
                </a>
            </p>
        </div>
    );
};

const License = (props: LicenseData) => {
    const { name, id, subHeading, licenceBenifits, priceFullDollars, pricePer } = props;

    return (
        <>
            <div className="top">
                <div className={styles.licenceMeta}>
                    <p className="font-size-small text-secondary">
                        AG Grid Enterprise{' '}
                        <span>
                            <EnterpriseIcon />
                        </span>
                    </p>
                    <p className={classnames(styles.name, 'font-size-extra-large', 'bold-text')}>{name}</p>
                    <p className="font-size-small text-secondary">{subHeading}</p>
                </div>

                <Price priceFullDollars={priceFullDollars} pricePer={pricePer} />

                <div className={styles.licenceBenifits}>
                    <ul className="font-size-small">
                        {licenceBenifits.map((benifit, i) => {
                            return <li key={i}>{benifit}</li>;
                        })}
                    </ul>

                    <a className={classnames(styles.learnMoreLink, 'font-size-small')} href={`#${id}`}>
                        Learn more
                    </a>
                </div>

                <div className={styles.licenceActions}>
                    <a className="button button-secondary" href="#">
                        Pay with card
                    </a>
                    <a className="button" href="#">
                        Request a quote
                    </a>
                </div>
            </div>

            <DevelopmentLicence />
        </>
    );
};

export const Licenses = () => {
    return (
        <ul className={classnames('list-style-none', styles.licenses)}>
            {DEV_LICENSE_DATA.map((data) => {
                return (
                    <li key={data.name} className={classnames(styles.license, data.className, 'ag-card')}>
                        <License {...data} />
                    </li>
                );
            })}
        </ul>
    );
};
