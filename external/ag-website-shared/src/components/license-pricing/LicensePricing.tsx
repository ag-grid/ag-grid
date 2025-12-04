import { ContactForm } from '@ag-website-shared/components/contact-form/ContactForm';
import { Icon } from '@ag-website-shared/components/icon/Icon';
import ChartsActive from '@ag-website-shared/images/inline-svgs/pricing/charts-active.svg?react';
import ChartsInactive from '@ag-website-shared/images/inline-svgs/pricing/charts-inactive.svg?react';
import GridActive from '@ag-website-shared/images/inline-svgs/pricing/grid-active.svg?react';
import GridInactive from '@ag-website-shared/images/inline-svgs/pricing/grid-inactive.svg?react';
import { chartsUrlWithPrefix } from '@ag-website-shared/utils/chartsUrlWithPrefix';
import { gridUrlWithPrefix } from '@ag-website-shared/utils/gridUrlWithPrefix';
import { CustomerLogos } from '@components/customer-logos/CustomerLogos';
import { useFrameworkFromStore } from '@utils/hooks/useFrameworkFromStore';
import classnames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import type { FunctionComponent } from 'react';

import chartsFeaturesData from '../../content/license-features/chartsFeaturesMatrix.json';
import gridFeaturesData from '../../content/license-features/gridFeaturesMatrix.json';
import { Licenses } from './Licenses';
import { DEV_LICENSE_DATA } from './Licenses';
import SocialProof from './SocialProof';
import { ComparisonTable } from './comparison-table/ComparisonTable';
import styles from './license-pricing.module.scss';

export type LicenseTab = 'grid' | 'charts';

interface Props {
    defaultSelection: LicenseTab;
}

export const LicensePricing: FunctionComponent<Props> = ({ defaultSelection }) => {
    const [showFullWidthBar, setShowFullWidthBar] = useState(false);

    const contactSalesRef = useRef(null);
    const framework = useFrameworkFromStore();

    const gridLicenseData = DEV_LICENSE_DATA.filter(
        (license) => license.tabGroup === 'grid' || license.tabGroup === 'both'
    );
    const chartsLicenseData = DEV_LICENSE_DATA.filter(
        (license) => license.tabGroup === 'charts' || license.tabGroup === 'both'
    );

    useEffect(() => {
        const handleScroll = () => {
            const contactSalesPosition = contactSalesRef.current
                ? contactSalesRef.current.getBoundingClientRect().top
                : 0;

            if (window.scrollY > 300 && contactSalesPosition > 200) {
                setShowFullWidthBar(true);
            } else {
                setShowFullWidthBar(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        // Call once on mount to set initial state
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Handles charts/grid toggle logic
    const [chartsIsSelected, setChartsIsSelected] = useState(defaultSelection === 'charts');

    const handleToggle = () => {
        setChartsIsSelected(!chartsIsSelected);
    };

    const featuresData = chartsIsSelected ? chartsFeaturesData : gridFeaturesData;
    const licenseData = chartsIsSelected ? chartsLicenseData : gridLicenseData;

    return (
        <>
            <div className={classnames(styles.fullWidthBar, { [styles.active]: showFullWidthBar })}>
                <div className={classnames('layout-max-width-small', styles.fullWidthBarContainer)}>
                    {licenseData.map((license, i) => {
                        const isCommunity = license.id === 'community';
                        const ctaId =
                            license.id === 'community'
                                ? 'get-started'
                                : license.id.includes('enterprise')
                                  ? 'buy-now'
                                  : 'bundle-buy-now';

                        return (
                            <div className={styles.fullWidthBarItem} key={i}>
                                <span className={classnames(styles.fwProduct, 'text-lg')}>{license.subHeading}</span>
                                <div>
                                    <span className={styles.fwPrice}>
                                        {isCommunity ? (
                                            <b>Free</b>
                                        ) : (
                                            <>
                                                <span className={styles.fwPriceDollars}>
                                                    ${license.priceFullDollars}
                                                </span>
                                            </>
                                        )}
                                    </span>

                                    <a
                                        id={ctaId}
                                        className={classnames(
                                            styles.fwAction,
                                            isCommunity ? 'button-tertiary' : 'button'
                                        )}
                                        href={license.buyLink}
                                    >
                                        {isCommunity ? 'Get started' : 'Buy now'}
                                    </a>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className={styles.introSection}>
                <div className={styles.gradient}></div>
                <div className={styles.switchContainer}>
                    <div className={styles.toggleWrapper}>
                        <input
                            type="checkbox"
                            id="toggle"
                            className={styles.toggleCheckbox}
                            checked={chartsIsSelected}
                            onChange={handleToggle}
                        />
                        <label htmlFor="toggle" className={styles.toggleContainer}>
                            <div className={styles.gridToggle}>
                                <GridActive className={styles.gridActive} />
                                <GridInactive className={styles.gridInactive} />
                                AG Grid
                            </div>
                            <div className={styles.chartsToggle}>
                                <ChartsActive className={styles.chartsActive} />
                                <ChartsInactive className={styles.chartsInactive} />
                                AG Charts
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            <div className={classnames('layout-max-width-small', styles.container)}>
                <div className={styles.topSection}>
                    <div className={styles.intro}>
                        <div className={styles.licensesOuter}>
                            <Licenses className={styles.licensesInfo} isChecked={chartsIsSelected} />
                        </div>

                        <div className={styles.desktopTableContainer}>
                            {featuresData.map((section, i) => {
                                return (
                                    <div className={styles.tableContainer} key={i}>
                                        <h4 className={styles.categoryTableHeader}>{section.group.name}</h4>

                                        <ComparisonTable
                                            data={section.items}
                                            columns={{
                                                label: '',
                                                community: '',
                                                enterprise: '',
                                                chartsGrid: '',
                                            }}
                                            cellRenderer={{
                                                label: 'label',
                                                community: 'feature',
                                                enterprise: 'feature',
                                                chartsGrid: 'feature',
                                            }}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                        <div ref={contactSalesRef} className={styles.salesForm}>
                            <div className={styles.salesFormCopy}>
                                <h3 className="text-2xl">
                                    <span>Contact Our Sales Team</span>
                                </h3>

                                <p className={styles.salesContactsubHeading}>
                                    Get help with pricing, explore use-cases for your team, and more
                                </p>

                                <div className={styles.testimonialContainer}>
                                    <p className={styles.testimonalHeading}>Millions use AG Grid every day:</p>
                                    <div className={styles.customerLogosWrapper}>
                                        <CustomerLogos />
                                    </div>
                                </div>
                            </div>

                            <div className={classnames(styles.salesFormForm, 'trial-licence-form')}>
                                <ContactForm
                                    formLocation={
                                        defaultSelection === 'grid' ? 'Grid pricing page' : 'Charts pricing page'
                                    }
                                />
                            </div>
                        </div>

                        <div className={styles.trialLicence}>
                            <div className={styles.trialLicenceCopy}>
                                <h3 className="text-2xl">
                                    <Icon name="enterprise" svgClasses={styles.enterpriseIcon} />
                                    <span>Enterprise Bundle Trial</span>
                                </h3>

                                <p>
                                    See the differences between our community and enterprise versions and request a
                                    trial license
                                </p>

                                <a
                                    id="request-trial-licence"
                                    className={classnames('button', styles.trialButton)}
                                    href={gridUrlWithPrefix({
                                        framework,
                                        url: './community-vs-enterprise/#request-a-30-day-enterprise-bundle-trial-licence',
                                    })}
                                >
                                    Get a trial license
                                </a>
                            </div>

                            <div className={styles.trialLicenceSeparator}></div>

                            <div className={classnames(styles.trialLicenceCopy, 'trial-licence-form')}>
                                <div className={styles.trialLicenceCopyItem}>
                                    <Icon name="alarm" svgClasses={styles.alarmIcon} />
                                    <p>
                                        <b>Two Week Trial</b>
                                        <br />
                                        Trial licences are valid for two weeks from the date of issue, or{' '}
                                        <a href="mailto:info@ag-grid.com">contact&nbsp;us</a> to extend.
                                    </p>
                                </div>

                                <div className={styles.trialLicenceSeparator}></div>

                                <div className={styles.trialLicenceCopyItem}>
                                    <Icon name="terminal" svgClasses={styles.terminalIcon} />
                                    <p>
                                        <b>Suppresses Console Warnings</b>
                                        <br />
                                        Removes console errors and watermarks from AG Grid and
                                        AG&nbsp;Chart&nbsp;components.
                                    </p>
                                </div>

                                <div className={styles.trialLicenceSeparator}></div>

                                <div className={styles.trialLicenceCopyItem}>
                                    <Icon name="support" svgClasses={styles.supportIcon} />
                                    <p>
                                        <b>Access Support</b>
                                        <br />
                                        Access dedicated support from our engineering team via{' '}
                                        <a href="https://ag-grid.zendesk.com/hc/en-us">Zendesk</a>.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.licenceKeyDocs}>
                            <h3>Already have a licence and need to install your key?</h3>
                            <p>
                                Read our documentation on{' '}
                                {defaultSelection === 'grid' ? (
                                    <a
                                        id="licence-install-cta"
                                        href={gridUrlWithPrefix({ framework, url: './license-install' })}
                                    >
                                        Installing Your Licence Key
                                    </a>
                                ) : (
                                    <a
                                        id="licence-install-cta"
                                        href={chartsUrlWithPrefix({ framework, url: './license-install' })}
                                    >
                                        Installing Your Licence Key
                                    </a>
                                )}
                                .
                            </p>
                        </div>

                        <div className={styles.videoPrompt}>
                            <a
                                id="licence-explainer-video-thumbnail"
                                href="https://www.youtube.com/watch?v=VPr__OKxH50"
                                target="_blank"
                                className={styles.thumbnail}
                            >
                                <img
                                    src="https://img.youtube.com/vi/VPr__OKxH50/hqdefault.jpg"
                                    alt="AG Grid licence explained video"
                                />
                            </a>

                            <div>
                                <h3>Which licences do I need?</h3>
                                <p>
                                    <a
                                        id="licence-explainer-video-text"
                                        href="https://www.youtube.com/watch?v=VPr__OKxH50"
                                        target="_blank"
                                    >
                                        <span className="icon"></span>
                                        Watch our short explainer video
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <SocialProof />
            </div>
        </>
    );
};
