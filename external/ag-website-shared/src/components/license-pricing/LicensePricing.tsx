import ChartsActive from '@ag-website-shared/images/inline-svgs/pricing/charts-active.svg?react';
import ChartsInactive from '@ag-website-shared/images/inline-svgs/pricing/charts-inactive.svg?react';
import GridActive from '@ag-website-shared/images/inline-svgs/pricing/grid-active.svg?react';
import GridInactive from '@ag-website-shared/images/inline-svgs/pricing/grid-inactive.svg?react';
import { chartsUrlWithPrefix } from '@ag-website-shared/utils/chartsUrlWithPrefix';
import { gridUrlWithPrefix } from '@ag-website-shared/utils/gridUrlWithPrefix';
import { useFrameworkFromStore } from '@utils/hooks/useFrameworkFromStore';
import classnames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import type { FunctionComponent } from 'react';

import chartsFeaturesData from '../../content/license-features/chartsFeaturesMatrix.json';
import gridFeaturesData from '../../content/license-features/gridFeaturesMatrix.json';
import { TrialLicenceForm } from '../trial-licence-form/TrialLicenceForm';
import { InfoEmailLink } from './InfoEmailLink';
import { Licenses } from './Licenses';
import SocialProof from './SocialProof';
import { ComparisonTable } from './comparison-table/ComparisonTable';
import styles from './license-pricing.module.scss';

export type LicenseTab = 'grid' | 'charts';

interface Props {
    defaultSelection: LicenseTab;
}

export const LicensePricing: FunctionComponent<Props> = ({ defaultSelection }) => {
    const [showFullWidthBar, setShowFullWidthBar] = useState(false);

    const contactSalesRef = useRef(null); // Step 1: Create a ref for the contactSales div
    const framework = useFrameworkFromStore();

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

    // Handles charts/grid toggle logic
    const [chartsIsSelected, setChartsIsSelected] = useState(defaultSelection === 'charts');

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

                        <div ref={contactSalesRef} className={styles.contactSales}>
                            <h3 className="text-2xl">Need help?</h3>

                            <p className="text-secondary">
                                Email{' '}
                                <InfoEmailLink emailSubject="AG Grid Developer licence query" trackingType="headerLink">
                                    info@ag-grid.com
                                </InfoEmailLink>{' '}
                                and start a conversation. We can provide quotes, give bulk pricing, and answer any sales
                                or contract-related questions you may have.
                            </p>

                            <InfoEmailLink
                                emailSubject="AG Grid Developer licence query"
                                className="button"
                                trackingType="footer"
                            >
                                info@ag-grid.com
                            </InfoEmailLink>
                        </div>

                        <div className={styles.trialLicence}>
                            <h3 className="text-2xl" id="request-trial-licence">
                                Request an Enterprise Bundle Trial License Key
                            </h3>

                            <p>
                                If you would like to trial AG Grid Enterprise in an environment, you can request a free
                                trial license key. The trial license key will remove the watermark & console error
                                message, and provide access to both AG Grid and AG Charts Enterprise.
                            </p>

                            <p>
                                Fill out the form below and we'll send you an Enterprise Bundle license key, valid for
                                two weeks:
                            </p>

                            <TrialLicenceForm />
                        </div>

                        <div className={styles.licenceKeyDocs}>
                            <h3>Already have a licence and need to install your key?</h3>
                            <p>
                                Read our documentation on{' '}
                                {defaultSelection === 'grid' ? (
                                    <a href={gridUrlWithPrefix({ framework, url: './license-install' })}>
                                        Installing Your Licence Key
                                    </a>
                                ) : (
                                    <a href={chartsUrlWithPrefix({ framework, url: './license-install' })}>
                                        Installing Your Licence Key
                                    </a>
                                )}
                                .
                            </p>
                        </div>

                        <div className={styles.videoPrompt}>
                            <a
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
