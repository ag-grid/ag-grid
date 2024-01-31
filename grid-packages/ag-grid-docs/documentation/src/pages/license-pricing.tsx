import React, { useEffect, useState } from 'react';
import classnames from 'classnames';
import ukraineFlagSVG from 'images/ukraine-flag.svg';
import { Icon } from '../components/Icon';
import { InfoEmailLink } from '../components/InfoEmailLink';
import { Licenses } from '../components/licenses/Licenses';
import NPMIcon from '../images/inline-svgs/npm.svg';
import { trackOnceInfoEmail } from '../utils/analytics';
import { hostPrefix } from '../utils/consts';
import SEO from './components/SEO';
import styles from '@design-system/modules/license-pricing.module.scss';
import AGGridLogo from '../images/inline-svgs/ag-grid-logo.svg';
import AGChartsLogo from '../images/inline-svgs/ag-charts-logo.svg';
import Background from '../images/inline-svgs/grid-pricing-background.svg';
import ComparisonTable from '../components/licenses/ComparisonTable';


export const LicensePricing = () => {
    const [showFullWidthBar, setShowFullWidthBar] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 850) {
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

    return (
        <>
            {showFullWidthBar && (
                <div className={styles.fullWidthBar}>
                    <div className={classnames('layout-max-width-small', styles.fullWidthBarContainer)}>
                        <div className={styles.fullWidthBarLeft}>
                            Pricing
                        </div>
                        <div className={styles.fullWidthBarItem}>Community</div>
                            <div className={styles.fullWidthBarItem}>Enterprise</div>
                            <div className={styles.fullWidthBarItem}>Grid + Charts</div>

                        <div className={styles.fullWidthBarRight}>
                            
                        </div>
                    </div>
                </div>
            )}

            <Background className={styles.backgroundPricing} />
            <div className={classnames('layout-max-width-small', styles.container)}>
                <div className={styles.topSection}>
                    <div className={styles.intro}>
                        <div className={styles.introSection}>
                            <h1>Buy a licence</h1>

                            <p className="text-lg">
                                Email
                                <InfoEmailLink
                                    emailSubject="AG Grid Developer license query"
                                    trackingType="headerLink"
                                >
                                    info@ag-grid.com
                                </InfoEmailLink>{' '}
                                and start a conversation. We can provide quotes, give bulk pricing, and answer any sales or
                                contract-related questions you may have.
                            </p>

                            <p className={styles.salesEmail}>
                                <InfoEmailLink isButton withIcon className="button-tertiary" trackingType="headerButton">
                                    info@ag-grid.com
                                </InfoEmailLink>
                            </p>
                        </div>

                        <div className={styles.licensesOuter}>
                            <Licenses />
                        </div>
                        <ComparisonTable/>

                        <div className={styles.videoPrompt}>
                            <a href="#video-explainer" className={styles.thumbnail}>
                                <img
                                    src="https://img.youtube.com/vi/xacx_attYuo/hqdefault.jpg"
                                    alt="AG Grid license explained video" />
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
                    </div>
                </div>

                <div className={styles.communityEnterprise}>
                    <div className={styles.community}>
                        <h3>Community Versions</h3>
                        <p>
                            <a href="https://www.npmjs.com/package/ag-grid-community" target='_blank'><b>AG Grid Community</b></a> and <a href="https://www.npmjs.com/package/ag-charts-community" target='_blank'><b>AG Charts Community</b></a> are free and open source products distributed under the{' '}
                            <a href="https://www.ag-grid.com/eula/AG-Grid-Community-License.html" target="_blank">
                                MIT License
                            </a>
                            . These versions are free to use in production environments.
                        </p>

                        <a
                            href="https://www.npmjs.com/package/ag-grid-community"
                            target='_blank'
                            className={classnames(styles.NpmButton, 'button-secondary')}
                        >
                            <NPMIcon /> Get AG Grid Community at NPM
                        </a>
                        <br />
                        <a
                            href="https://www.npmjs.com/package/ag-charts-community"
                            target='_blank'
                            className={classnames(styles.NpmButton, 'button-secondary')}
                        >
                            <NPMIcon /> Get AG Charts Community at NPM
                        </a>
                    </div>

                    <div className={styles.enterprise}>
                        <h3>
                            Enterprise Versions <Icon name="enterprise" />
                        </h3>
                        <p>
                            <a href="https://www.ag-grid.com/javascript-data-grid/licensing/" target='_blank'><b>AG Grid Enterprise</b></a> and <a href="https://charts.ag-grid.com/javascript/licensing/" target='_blank'><b>AG Charts Enterprise</b></a> are commercial products distributed
                            under our{' '}
                            <a href="https://www.ag-grid.com/eula/AG-Grid-Enterprise-License-Latest.html" target="_blank">
                                EULA
                            </a>{' '}
                            and supported by our technical staff.
                        </p>

                        <p>
                            To evaluate <a href="https://www.ag-grid.com/javascript-data-grid/licensing/" target='_blank'><b>AG Grid Enterprise</b></a> or <a href="https://charts.ag-grid.com/react/licensing/#feature-comparison" target='_blank'><b>AG Charts Enterprise</b></a> you don't need our
                            permission – all features are unlocked. To temporarily hide the watermark and browser console
                            errors e-mail us to{' '}
                            <InfoEmailLink
                                emailSubject="AG Grid Trial license request"
                                trackingType="enterpriseEvaluationKey"
                            >
                                get a temporary evaluation key
                            </InfoEmailLink>
                            .
                        </p>

                        <p>
                            Once you're ready to begin development, please purchase an appropriate license key from the
                            options above.
                        </p>

                        <p>
                            Expanded definitions are available further down the page. For any other questions please{' '}
                            <InfoEmailLink
                                emailSubject="AG Grid Developer license query"
                                trackingType="enterpriseGetInContact"
                            >
                                get in contact
                            </InfoEmailLink>
                            .
                        </p>

                        <a
                            href={`${hostPrefix}/javascript-data-grid/licensing/#feature-comparison`}
                            className="button-secondary"
                            target='_blank'
                        >
                            See all AG Grid Enterprise features
                        </a>
                        <br />
                        <a
                            href="https://charts.ag-grid.com/react/licensing/#feature-comparison"
                            className="button-secondary"
                            target='_blank'
                        >
                            See all AG Charts Enterprise features
                        </a>
                    </div>
                </div>

                <div className={styles.ukraineNotice}>
                    <img src={ukraineFlagSVG} alt="flag of Ukraine" />

                    <p className="text-secondary text-sm">
                        In light of current events in Ukraine we are choosing to express our disappointment in the breakdown
                        of diplomacy, and its effects on the people of Ukraine, the global economy and community by not
                        licensing software to companies or individuals registered or residing in the Russian Federation.
                    </p>
                </div>

                <div className={styles.videoExplainer} id="video-explainer">
                    <div>
                        <h3 className="text-2xlive">Questions about our licenses? </h3>
                        <p>
                            Watch our short video for an in-depth look at exactly how the license works. Learn which license
                            is right for you, how many licenses you need for your team, and exactly when you need a
                            deployment license.
                        </p>
                        <p>
                            If you have any other questions, or want to investigate volume pricing please{' '}
                            <InfoEmailLink
                                emailSubject="AG Grid Developer license query"
                                trackingType="questionsGetInContact"
                            >
                                get in contact
                            </InfoEmailLink>
                            .
                        </p>
                    </div>

                    <iframe
                        src="https://www.youtube.com/embed/xacx_attYuo"
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
                <div className={styles.contactSales}>
                    <p className="text-secondary">
                        For any enquires about bulk pricing, questions on which license is right for you, or any other
                        license related questions please contact our friendly sales team.{' '}
                    </p>

                    <InfoEmailLink
                        emailSubject="AG Grid Developer license query"
                        className="text-xl"
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