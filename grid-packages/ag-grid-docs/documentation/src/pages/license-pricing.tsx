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

    const faqs =[
        {
            "question": "What does a Single Application Development License include?",
            "answer": "A Single Application Development License allows embedding AG Grid Enterprise and/or AG Charts Enterprise into one application for internal use in perpetuity. It includes a 1-year subscription to new versions, support, and maintenance. All concurrent front-end JavaScript developers working on the application must be included in the license count. The license is bound to an application name and cannot be reused for other applications."
        },
        {
            "question": "How is a Multiple Application License different from a Single Application License?",
            "answer": "A Multiple Application Development License permits the embedding of AG Grid Enterprise and/or AG Charts Enterprise in an unlimited number of applications for internal use in perpetuity, unlike the Single Application License which is limited to one application. It also includes a 1-year subscription to new versions, support, and maintenance, with all concurrent front-end JavaScript developers working across the licensed applications needing to be counted."
        },
        {
            "question": "What is required for deploying customer-facing applications?",
            "answer": "For customer-facing applications, a Deployment License Add-on is required in addition to a Developer License. This add-on allows licensed developers to sublicense AG Grid and/or AG Charts for one application in one production environment in perpetuity and includes a 1-year subscription to new versions, support, and maintenance."
        },
        {
            "question": "Does the Deployment License cover multiple servers or environments?",
            "answer": "The Deployment License covers one production environment for one project, regardless of the number of servers or virtual containers. Production failover deployments do not require a separate license as they are considered part of the overall application production deployment. However, different instances of the same application not in a cluster for failover or load balancing are considered independent deployments and need a separate Deployment License for each instance."
        },
        {
            "question": "How does licensing work for multi-tenant deployments?",
            "answer": "Multi-tenant deployments, where one application instance serves many customers over different URLs, are considered one deployment. This is because each tenant is serviced by the same application instance. Therefore, only one Deployment License is required for the entire multi-tenant deployment."
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
