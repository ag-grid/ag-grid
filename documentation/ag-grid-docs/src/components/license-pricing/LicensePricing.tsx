import styles from '@design-system/modules/license-pricing.module.scss';
import ChartsActive from '@images/inline-svgs/pricing/charts-active.svg?react';
import ChartsInactive from '@images/inline-svgs/pricing/charts-inactive.svg?react';
import GridActive from '@images/inline-svgs/pricing/grid-active.svg?react';
import GridInactive from '@images/inline-svgs/pricing/grid-inactive.svg?react';
import { trackOnceInfoEmail } from '@utils/analytics';
import classnames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import chartsFeaturesData from '../../content/licence-features/chartsFeaturesMatrix.json';
import gridFeaturesData from '../../content/licence-features/gridFeaturesMatrix.json';
import { InfoEmailLink } from './InfoEmailLink';
import { Licenses } from './Licenses';
import SocialProof from './SocialProof';
import { ComparisonTable } from './comparison-table/ComparisonTable';

export type LicenseTab = 'grid' | 'charts';

export const LicensePricing = () => {
    const [showFullWidthBar, setShowFullWidthBar] = useState(false);

    const contactSalesRef = useRef(null); // Step 1: Create a ref for the contactSales div

    useEffect(() => {
        const handleScroll = () => {
            // Step 2: Determine the position of the contactSales div
            const contactSalesPosition = contactSalesRef.current
                ? contactSalesRef.current.getBoundingClientRect().top
                : 0;

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

    const featuresData = chartsIsSelected ? chartsFeaturesData : gridFeaturesData;

    return (
        <>
            {showFullWidthBar && (
                <div className={styles.fullWidthBar}>
                    <div className={classnames('layout-max-width-small', styles.fullWidthBarContainer)}>
                        <div className={styles.fullWidthBarLeft}> </div>
                        <div className={styles.fullWidthBarItem}>
                            AG {chartsIsSelected ? 'Charts' : 'Grid'} Community
                        </div>
                        <div className={styles.fullWidthBarItem}>
                            AG {chartsIsSelected ? 'Charts' : 'Grid'} Enterprise
                        </div>
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

                        <div ref={contactSalesRef} className={styles.contactSales}>
                            <h3 className="text-2xl">Need help?</h3>

                            <p className="text-secondary">
                                Email{' '}
                                <InfoEmailLink emailSubject="AG Grid Developer license query" trackingType="headerLink">
                                    info@ag-grid.com
                                </InfoEmailLink>{' '}
                                and start a conversation. We can provide quotes, give bulk pricing, and answer any sales
                                or contract-related questions you may have.
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
                            <a
                                href="https://www.youtube.com/watch?v=VPr__OKxH50"
                                target="_blank"
                                className={styles.thumbnail}
                            >
                                <img
                                    src="https://img.youtube.com/vi/VPr__OKxH50/hqdefault.jpg"
                                    alt="AG Grid license explained video"
                                />
                            </a>

                            <div>
                                <h3>Which licenses do I need?</h3>
                                <p>
                                    <a href="https://www.youtube.com/watch?v=VPr__OKxH50" target="_blank">
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
