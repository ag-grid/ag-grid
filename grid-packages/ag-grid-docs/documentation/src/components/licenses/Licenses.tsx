import classnames from 'classnames';
import React from 'react';
import EmailIcon from '../../images/inline-svgs/email.svg';
import EnterpriseIcon from '../../images/inline-svgs/enterprise.svg';
import PurchaseIcon from '../../images/inline-svgs/purchase.svg';
// @ts-ignore
import styles from './Licenses.module.scss';

type LicenseData = {
    className: string;
    name: string;
    id: string;
    subHeading: string;
    licenseBenefits: string[];
    priceFullDollars: string;
    pricePer: string;
    buyLink: string;
};

const DEV_LICENSE_DATA: LicenseData[] = [
    {
        className: styles.singleApplicationLicense,
        name: 'Single Application',
        id: 'single-application',
        subHeading: 'Development License',
        priceFullDollars: '999',
        licenseBenefits: ['Perpetual license', '1 year of support', '1 year of updates'],
        pricePer: 'Developer',
        buyLink: '/ecommerce/#/ecommerce/?licenseType=single',
    },
    {
        className: styles.multipleApplicationsLicense,
        name: 'Multiple Application',
        id: 'multiple-application',
        subHeading: 'Development License',
        licenseBenefits: ['Unlimited applications', 'Perpetual license', '1 year of support', '1 year of updates'],
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
};

const makeNonBreaking = (text: string) => {
    const nonBreakingSpace = '\u00A0';

    return text.replace(' ', nonBreakingSpace);
};

const Price = ({ priceFullDollars, pricePer }) => {
    return (
        <div className={styles.price}>
            <p className={styles.priceFullDollars}>{priceFullDollars}</p>
            <p className="font-size-small">
                <b>Per {pricePer}</b>
            </p>
        </div>
    );
};

const DevelopmentLicense = () => {
    return (
        <div className={classnames(styles.bottom, 'bottom')}>
            <div className={styles.licenseMeta}>
                <p className={styles.name}>{DEPLOY_LICENSE_DATA.name}</p>
                <p className="font-size-small text-secondary">{DEPLOY_LICENSE_DATA.subHeading}</p>
            </div>

            <Price priceFullDollars={DEPLOY_LICENSE_DATA.priceFullDollars} pricePer={DEPLOY_LICENSE_DATA.pricePer} />

            <p className={classnames(styles.devLicenseRequired, 'font-size-extra-small')}>
                Required to deploy for external users{' '}
                <a className={styles.learnMoreLink} href={`#${DEPLOY_LICENSE_DATA.id}`}>
                    Learn more
                </a>
            </p>
        </div>
    );
};

const License = (props: LicenseData) => {
    const { name, id, subHeading, licenseBenefits, priceFullDollars, pricePer, buyLink } = props;

    return (
        <>
            <div className={classnames(styles.top, 'top')}>
                <div className={styles.licenseMeta}>
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

                <div className={styles.licenseBenefits}>
                    <ul className="font-size-small list-style-none">
                        {licenseBenefits.map((benefit, i) => {
                            return <li key={i}>{makeNonBreaking(benefit)}</li>;
                        })}
                    </ul>

                    <a className={classnames(styles.learnMoreLink, 'font-size-small')} href={`#${id}`}>
                        Learn more
                    </a>
                </div>

                <div className={styles.licenseActions}>
                    <a className="button button-secondary" href={buyLink}>
                        <span className="icon">
                            <PurchaseIcon />
                        </span>{' '}
                        Pay with card
                    </a>
                    <a className="button" href={`mailto:info@ag-grid.com?subject=AG Grid - ${name} License Quote`}>
                        <span className="icon">
                            <EmailIcon />
                        </span>{' '}
                        Request a quote
                    </a>
                </div>
            </div>

            <DevelopmentLicense />
        </>
    );
};

export const Licenses = () => {
    return DEV_LICENSE_DATA.map((data) => {
        return (
            <div key={data.name} className={classnames(styles.license, data.className, 'ag-card', data.id)}>
                <License {...data} />
            </div>
        );
    });
};
