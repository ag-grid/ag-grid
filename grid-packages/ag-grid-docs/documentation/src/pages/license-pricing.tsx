import styles from '@design-system/modules/license-pricing.module.scss';
import classnames from 'classnames';
import React, { useEffect, useState } from 'react';
import { InfoEmailLink } from '../components/InfoEmailLink';
import { Licenses } from '../components/licenses/Licenses';
import ChartsActive from '../images/inline-svgs/pricing/charts-active.svg';
import ChartsInactive from '../images/inline-svgs/pricing/charts-inactive.svg';
import GridActive from '../images/inline-svgs/pricing/grid-active.svg';
import GridInactive from '../images/inline-svgs/pricing/grid-inactive.svg';
import SocialProof from '../components/SocialProof';
import { trackOnceInfoEmail } from '../utils/analytics';
import SEO from './components/SEO';
import ToggleBackground from '../images/inline-svgs/pricing/toggle-background.svg';
import { ComparisonTable } from '../components/comparison-table/ComparisonTable';
import gridFeaturesData from '../../doc-pages/licensing/gridFeaturesMatrix.json'
import chartsFeaturesData from '../../doc-pages/licensing/chartsFeaturesMatrix.json'
import pricingFAQData from '../../doc-pages/licensing/pricingFAQs.json'

import FAQ from '../components/licenses/FAQ';

export const LicensePricing = () => {
    const [showFullWidthBar, setShowFullWidthBar] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 830) {
                setShowFullWidthBar(true);
            } else {
                setShowFullWidthBar(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        const onSelectionChange = () => {
            const selection = document.getSelection()?.toString();
            if (selection?.includes('info@ag-grid.com')) {
                trackOnceInfoEmail({
                    type: 'selectedEmail',
                });
            }
        };
        document.addEventListener('selectionchange', onSelectionChange);

        return () => {
            document.removeEventListener('selectionchange', onSelectionChange);
        };
    });

    // Handles charts/grid toggle logic

    const [isChecked, setIsChecked] = useState(false);

    const handleToggle = () => {
        setIsChecked(!isChecked);
    };

    const featuresData = !isChecked ? gridFeaturesData : chartsFeaturesData;

    return (
        <>
            {showFullWidthBar && (
                <div className={styles.fullWidthBar}>
                    <div className={classnames('layout-max-width-small', styles.fullWidthBarContainer)}>
                        <div className={styles.fullWidthBarLeft}> </div>
                        <div className={styles.fullWidthBarItem}>Community</div>
                        <div className={styles.fullWidthBarItem}>Enterprise</div>
                        <div className={styles.fullWidthBarItem}>Grid + Charts</div>

                        <div className={styles.fullWidthBarRight}></div>
                    </div>
                </div>
            )}

            <div className={classnames('layout-max-width-small', styles.container)}>
                <div className={styles.topSection}>
                    <div className={styles.intro}>
                        <div className={styles.introSection}>
                            <h1 className={styles.pricingHeading}>Pricing</h1>

                            <p className="text-regular">
                                Need bulk pricing? We can provide quotes, give bulk pricing, contact us at
                                <InfoEmailLink emailSubject="AG Grid Developer license query" trackingType="headerLink">
                                    info@ag-grid.com
                                </InfoEmailLink>{' '}
                                for info.
                            </p>

                            <div className={styles.switchContainer}>
                                <div className={styles.gradient}></div>
                                <ToggleBackground className={styles.toggleBackground} />
                                <hr className={styles.horizontalRule} />
                                <div className={styles.toggleWrapper}>
                                    <input
                                        type="checkbox"
                                        id="toggle"
                                        className={styles.toggleCheckbox}
                                        checked={isChecked}
                                        onChange={handleToggle}
                                    />
                                    <label htmlFor="toggle" className={styles.toggleContainer}>
                                        <div className={styles.gridToggle}>
                                            <GridActive className={styles.gridActive} />
                                            <GridInactive className={styles.gridInactive} />
                                            Grid
                                        </div>
                                        <div className={styles.chartsToggle}>
                                            <ChartsActive className={styles.chartsActive} />
                                            <ChartsInactive className={styles.chartsInactive} />
                                            Charts <div className={styles.newTag}>New</div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className={styles.licensesOuter}>
                            <Licenses isChecked={isChecked} />
                        </div>

                        {featuresData.map((section, i) => {
                          return <div key={i}>
                              <h4>{section.group.name}</h4>

                              <ComparisonTable
                                  data={section.items}
                                  columns={{
                                      'label': '',
                                      'community': '',
                                      'enterprise': '',
                                      'chartsGrid': '',
                                    }}
                                    cellRenderer={{
                                      'label': 'label',
                                      'community': "feature",
                                      'enterprise': "feature",
                                      'chartsGrid': "feature",
                                  }}
                              />
                          </div>
                        })}

                        <div className={styles.videoPrompt}>
                            <a href="https://www.youtube.com/watch?v=xacx_attYuo" target="_blank" className={styles.thumbnail}>
                                <img
                                    src="https://img.youtube.com/vi/xacx_attYuo/hqdefault.jpg"
                                    alt="AG Grid license explained video"
                                />
                            </a>

                            <div>
                                <h3>Which licenses do I need?</h3>
                                <p>
                                    <a href="https://www.youtube.com/watch?v=xacx_attYuo" target="_blank">
                                        <span className="icon"></span>
                                        Watch our short explainer video
                                    </a>
                                </p>
                            </div>
                        </div>

                        <div className={styles.contactSales}>
                            <h3 className="text-2xl">Frequently asked questions</h3>

                            <p className="text-regular">
                                Here are some of the most commonly asked questions our customers ask us at AG Grid
                            </p>
                        </div>

                        <FAQ faqs={pricingFAQData} />
                    </div>
                </div>

                <SocialProof />

                <div className={styles.contactSales}>
                    <h3 className="text-2xl">Need help?</h3>

                    <p className="text-secondary text-lg">
                        Email{' '}
                        <InfoEmailLink emailSubject="AG Grid Developer license query" trackingType="headerLink">
                            info@ag-grid.com
                        </InfoEmailLink>{' '}
                        and start a conversation. We can provide quotes, give bulk pricing, and answer any sales or
                        contract-related questions you may have.
                    </p>

                    <InfoEmailLink
                        emailSubject="AG Grid Developer license query"
                        className="button"
                        trackingType="footer"
                    >
                        info@ag-grid.com
                    </InfoEmailLink>
                </div>
            </div>
        </>
    );
};

const LicensePricingPage = () => {
    return (
        <>
            <SEO
                title="AG Grid: License and Pricing"
                description="AG Grid is a feature-rich datagrid available in Community or Enterprise versions. This page describes the License and Pricing details for AG Grid Enterprise."
            />
            <LicensePricing />
        </>
    );
};

export default LicensePricingPage;
