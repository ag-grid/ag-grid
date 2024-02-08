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
import featuresData from '../../doc-pages/licensing/featuresMatrix.json'

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


    // Handles questions and answers for FAQ section

    const faqs = [
        {
            "question": "What does a Single Application Development License include?",
            "answer": "Licenses AG Grid/Charts for one internal app perpetually. Includes 1-year updates, support, and covers all JS developers. Tied to one app name, not transferable."
        },
        {
            "question": "How is a Multiple Application License different from a Single Application License?",
            "answer": "Covers unlimited internal apps with AG Grid/Charts forever. Includes 1-year updates and support. Requires all JS developers to be licensed, not just for one app."
        },
        {
            "question": "What is required for deploying customer-facing applications?",
            "answer": "Needs a Deployment License Add-on plus Developer License. Allows sublicensing AG Grid/Charts for one app in one production environment forever, with 1-year updates/support."
        },
        {
            "question": "Does the Deployment License cover multiple servers or environments?",
            "answer": "Covers one production environment, regardless of server count. Failovers included, but separate deployments need their own licenses."
        },
        {
            "question": "How does licensing work for multi-tenant deployments?",
            "answer": "One Deployment License needed for multi-tenant setups, serving multiple customers under one application instance."
        }
    ]
    
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

                        <ComparisonTable
                            data={featuresData}
                            columns={{
                                'name': '',
                                'community': '',
                                'enterprise': '',
                                'chartsGrid': '',
                              }}
                              cellRenderer={{
                                'community': "featuresTickCross",
                                'enterprise': "featuresTickCross",
                                'chartsGrid': "featuresTickCross",
                            }}
                        />

                        <div className={styles.videoPrompt}>
                            <a href="#video-explainer" className={styles.thumbnail}>
                                <img
                                    src="https://img.youtube.com/vi/xacx_attYuo/hqdefault.jpg"
                                    alt="AG Grid license explained video"
                                />
                            </a>

                            <div>
                                <h3>Which licenses do I need?</h3>
                                <p>
                                    <a href="#video-explainer">
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

                        <FAQ faqs={faqs} />
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
