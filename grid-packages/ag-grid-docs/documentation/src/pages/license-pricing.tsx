import styles from '@design-system/modules/license-pricing.module.scss';
import classnames from 'classnames';
import React, { useEffect, useState } from 'react';
import { InfoEmailLink } from '../components/InfoEmailLink';
import { Licenses } from '../components/licenses/Licenses';
import ChartsActive from '../images/inline-svgs/pricing/charts-active.svg';
import ChartsInactive from '../images/inline-svgs/pricing/charts-inactive.svg';
import GridActive from '../images/inline-svgs/pricing/grid-active.svg';
import GridInactive from '../images/inline-svgs/pricing/grid-inactive.svg';
import { trackOnceInfoEmail } from '../utils/analytics';
import SEO from './components/SEO';
import ToggleBackground from '../images/inline-svgs/pricing/toggle-background.svg';
import ComparisonTable from '../components/licenses/ComparisonTable';

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
            "answer": "This license allows using AG Grid Enterprise and/or AG Charts in one internal application forever. It comes with a year of updates, support, and requires all front-end developers to be licensed. It's tied to one application name and can't be transferred."
        },
        {
            "question": "How is a Multiple Application License different from a Single Application License?",
            "answer": "The Multiple Application License covers unlimited internal applications indefinitely with AG Grid and/or AG Charts. It includes a year of updates and support. All JavaScript developers must be included. Unlike the Single Application License, it's not limited to one application."
        },
        {
            "question": "What is required for deploying customer-facing applications?",
            "answer": "Customer-facing apps need a Deployment License Add-on along with a Developer License. This permits sublicensing AG Grid/Charts for one app in one production environment forever, plus a year of updates and support."
        },
        {
            "question": "Does the Deployment License cover multiple servers or environments?",
            "answer": "The Deployment License covers one production environment, regardless of server count. Failovers don't need extra licenses. Separate deployments for the same app need individual licenses."
        },
        {
            "question": "How does licensing work for multi-tenant deployments?",
            "answer": "Multi-tenant deployments are covered by one Deployment License, as all tenants are served by the same application instance. This applies to different URLs under one application."
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
                        <ComparisonTable isChecked={isChecked} />

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
                           
                        <h3 className='text-2xl'>Frequently asked questions</h3>

                            <p className="text-regular">
                            Here are some of the most commonly asked questions our customers ask us at AG Grid
                            </p>
                            </div>


                        <FAQ faqs={faqs} />

                       
                    </div>
                </div>

                <div className={styles.contactSales}>
                    <h3 className='text-2xl'>Need help?</h3>

                    <p className="text-secondary text-lg">
                        Email{' '}
                        <InfoEmailLink emailSubject="AG Grid Developer license query" trackingType="headerLink">
                            info@ag-grid.com
                        </InfoEmailLink>
                        {' '} and start a conversation. We can provide quotes, give bulk pricing, and
                        answer any sales or contract-related questions you may have.
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
