import styles from '@design-system/modules/license-pricing.module.scss';
import classnames from 'classnames';
import React, { useEffect, useState, useRef } from 'react';
import { InfoEmailLink } from '../components/InfoEmailLink';
import { Licenses } from '../components/licenses/Licenses';
import ChartsActive from '../images/inline-svgs/pricing/charts-active.svg';
import ChartsInactive from '../images/inline-svgs/pricing/charts-inactive.svg';
import GridActive from '../images/inline-svgs/pricing/grid-active.svg';
import GridInactive from '../images/inline-svgs/pricing/grid-inactive.svg';
import SocialProof from '../components/SocialProof';
import { trackOnceInfoEmail } from '../utils/analytics';
import SEO from './components/SEO';
import { ComparisonTable } from '../components/comparison-table/ComparisonTable';
import gridFeaturesData from '../../doc-pages/licensing/gridFeaturesMatrix.json'
import chartsFeaturesData from '../../doc-pages/licensing/chartsFeaturesMatrix.json'

import { CHARTS_URL } from '../utils/consts';

export type LicenseTab = 'grid' | 'charts';

interface Props {
    initialTab?: LicenseTab
    isWithinIframe?: boolean
}

export const LicensePricing = ({ initialTab, isWithinIframe }: Props) => {
    const [showFullWidthBar, setShowFullWidthBar] = useState(false);
    
    const contactSalesRef = useRef(null); // Step 1: Create a ref for the contactSales div
    
    useEffect(() => {
        const handleScroll = () => {
            // Step 2: Determine the position of the contactSales div
            const contactSalesPosition = contactSalesRef.current ? contactSalesRef.current.getBoundingClientRect().top : 0;
            
            // Check if contactSales div is at the top of the viewport or if the scroll is beyond a certain point
            if (window.scrollY > 390 && contactSalesPosition > 0) {
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
    const [chartsIsSelected, setChartsIsSelected] = useState(false);

    const handleToggle = () => {
        setChartsIsSelected(!chartsIsSelected);
    };

    // Set toggle based on prop
    useEffect(() => {
        setChartsIsSelected(initialTab === 'charts');
    }, [initialTab]);


    useEffect(() => {
        if (isWithinIframe) {
            const message = {
                type: 'tabChange',
                tab: chartsIsSelected ? 'charts' : 'grid' as LicenseTab,
                windowHeight: document.body.clientHeight
            };
            parent.postMessage(message, CHARTS_URL!);
        }
    }, [chartsIsSelected])

    const featuresData = chartsIsSelected ? chartsFeaturesData : gridFeaturesData; 

    return (
        <>
            {showFullWidthBar && (
                <div className={styles.fullWidthBar}>
                    <div className={classnames('layout-max-width-small', styles.fullWidthBarContainer)}>
                        <div className={styles.fullWidthBarLeft}> </div>
                        <div className={styles.fullWidthBarItem}>AG { chartsIsSelected ? 'Charts' : 'Grid' } Community</div>
                        <div className={styles.fullWidthBarItem}>AG { chartsIsSelected ? 'Charts' : 'Grid' } Enterprise</div>
                        <div className={styles.fullWidthBarItem}>AG Grid Bundle</div>

                        <div className={styles.fullWidthBarRight}></div>
                    </div>
                </div>
            )}

            <div className={classnames('layout-max-width-small', styles.container)}>
                <div className={styles.topSection}>
                    <div className={styles.intro}>
                        <div className={styles.introSection}>
                            <div className={styles.switchContainer}>
                                <div className={styles.gradient}></div>
                                {/* <ToggleBackground className={styles.toggleBackground} /> */}
                                {/* <hr className={styles.horizontalRule} /> */}
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
                        <div className={styles.licensesOuter}>
                            <Licenses className={styles.licensesInfo} isChecked={chartsIsSelected} />
                        </div>

                        <div className={styles.desktopTableContainer}>
                        {featuresData.map((section, i) => {
                          return <div className={styles.tableContainer} key={i}>
                              <h4 className={styles.categoryTableHeader}>{section.group.name}</h4>

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
                        </div>

                        <div ref={contactSalesRef} className={styles.contactSales}>
                    <h3 className="text-2xl">Need help?</h3>

                    <p className="text-secondary">
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

                    </div>
                </div>

                <SocialProof />

            </div>
        </>
    );
};

const LicensePricingPage = (props) => {
    return (
        <>
            <SEO
                title="AG Grid: License and Pricing"
                description="AG Grid is a feature-rich datagrid available in Community or Enterprise versions. This page describes the License and Pricing details for AG Grid Enterprise."
            />
            <LicensePricing {...props} />
        </>
    );
};

export default LicensePricingPage;
