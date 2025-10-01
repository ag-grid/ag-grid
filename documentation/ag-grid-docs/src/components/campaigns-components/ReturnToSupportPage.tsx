import { ContactForm } from '@ag-website-shared/components/contact-form/ContactForm';
import { Icon } from '@ag-website-shared/components/icon/Icon';
import { ReleasesSection } from '@ag-website-shared/components/releases-section/ReleasesSection';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import React, { useEffect, useState } from 'react';

import styles from '../../pages-styles/return-to-support.module.scss';
import FlipCountdown from './FlipCountdown';
import RenewNowButton from './RenewNowButton';

interface ReturnToSupportPageProps {
    versionsData: any;
    utm: string;
}

const END_DATE = new Date('2025-08-31T23:59:59');

const ReturnToSupportPage: React.FC<ReturnToSupportPageProps> = ({ versionsData, utm }) => {
    // Content states
    const [heroTitle, setHeroTitle] = useState<string | React.ReactElement>(
        'Welcome back to better support & new features'
    );
    const [heroDescription, setHeroDescription] = useState(
        'Take advantage of our limited-time renewal offer and unlock the full power of AG Grid support before our return to support policy takes effect. Renew today and stay ahead.'
    );
    const [showCountdownText, setShowCountdownText] = useState(true);
    const [isCountdownEnded, setIsCountdownEnded] = useState(false);

    // Generate mailto content based on countdown state
    const mailtoAddress = 'info@ag-grid.com';
    const mailtoSubject = isCountdownEnded ? 'Enquire about Renewing' : 'Return To Support Offer';
    const mailtoBody = '';
    const mailto = `mailto:${mailtoAddress}?subject=${encodeURIComponent(mailtoSubject)}&body=${encodeURIComponent(mailtoBody)}`;

    // Check if countdown has ended on component mount
    useEffect(() => {
        const searchParams = window.location.search;
        const hasEndedParam = new URLSearchParams(searchParams).get('hasEnded') === 'true';
        const now = new Date();
        if (now > END_DATE || hasEndedParam) {
            updateContentOnCountdownEnd();
        }
    }, []);

    const updateContentOnCountdownEnd = () => {
        setHeroTitle(
            <>
                Renewing your
                <br />
                support at AG Grid
            </>
        );
        setHeroDescription(
            'Renew your AG Grid subscription to unlock full support, stay ahead with expert guidance, and ensure uninterrupted access to all updates and resources.'
        );
        setShowCountdownText(false);
        setIsCountdownEnded(true);
    };

    return (
        <div className={`layout-max-width-small ${isCountdownEnded ? styles.countdownEnded : ''}`}>
            <div className={styles.rtsHeroGradient}></div>

            <div className={styles.rtsHeroSection}>
                {isCountdownEnded ? (
                    // Full-width layout when countdown has ended
                    <div className={styles.rtsHeroEndedLayout}>
                        <div className={styles.rtsHeroContent}>
                            <h2 id="hero-title">{heroTitle}</h2>
                            <p id="hero-description">{heroDescription}</p>
                            <div className={styles.rtsFlipClockBox}>
                                <RenewNowButton
                                    href={mailto}
                                    className={`button ${styles.button}`}
                                    plausibleEventType="renew-header-cta"
                                    text="Renew Now"
                                />
                            </div>
                        </div>
                        <div className={styles.rtsHeroImageContainer}>
                            <img
                                src={urlWithBaseUrl('images/campaigns/hero-ag-grid.png')}
                                alt="AG Grid Hero"
                                className={`${styles.rtsHeroImage} ${styles.rtsHeroImageLight}`}
                            />
                            <img
                                src={urlWithBaseUrl('images/campaigns/hero-ag-grid-dark.png')}
                                alt="AG Grid Hero"
                                className={`${styles.rtsHeroImage} ${styles.rtsHeroImageDark}`}
                            />
                        </div>
                    </div>
                ) : (
                    // Original side-by-side layout when countdown is active
                    <>
                        <div className={styles.rtsHeroContent}>
                            <h2 id="hero-title">{heroTitle}</h2>
                            <p id="hero-description">{heroDescription}</p>
                            <div className={styles.rtsFlipClockBox}>
                                <RenewNowButton
                                    href={mailto}
                                    className={`button ${styles.button}`}
                                    plausibleEventType="renew-header-cta"
                                    text="Renew Now"
                                />
                            </div>
                        </div>
                        <div className={styles.rtsFlipClockBox}>
                            <div className={styles.rtsFlipClock}>
                                {showCountdownText && (
                                    <div className={styles.rtsFlipClockEnds} id="countdown-text">
                                        OFFER ENDS AUGUST 31ST
                                    </div>
                                )}
                                <FlipCountdown endDate={END_DATE} onCountdownEnd={updateContentOnCountdownEnd} />
                            </div>
                        </div>
                    </>
                )}
            </div>

            <section className={styles.rtsBenefitsSection}>
                <div className={styles.sectionTitle}>
                    <h2>
                        Why renewing makes sense, <br />
                        at a glance
                    </h2>
                    <p>
                        Avoid future reinstatement charges by keeping your support current and renewing now. To take
                        advantage of the benefits and security provided by our support and maintenance program, get in
                        touch today.
                    </p>
                </div>

                <div className={styles.rtsBenefitsTableWrapper}>
                    <table className={styles.rtsBenefitsTable}>
                        <thead>
                            <tr>
                                <th></th>
                                <th className={styles.renewedSupportTitle}>Renewed Support & Maintenance</th>
                                <th>Lapsed Support & Maintenance</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>New features and improvements</td>
                                <td>
                                    {' '}
                                    <span className={styles.tick}>
                                        <Icon name="tick" />
                                    </span>
                                </td>
                                <td>
                                    <span className={styles.cross}>
                                        <Icon name="cross" />
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td>Access to latest versions and updates</td>
                                <td>
                                    {' '}
                                    <span className={styles.tick}>
                                        <Icon name="tick" />
                                    </span>
                                </td>
                                <td>
                                    <span className={styles.cross}>
                                        <Icon name="cross" />
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td>Security patches and critical fixes</td>
                                <td>
                                    {' '}
                                    <span className={styles.tick}>
                                        <Icon name="tick" />
                                    </span>
                                </td>
                                <td>
                                    <span className={styles.cross}>
                                        <Icon name="cross" />
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td>Technical support from AG Grid team</td>
                                <td>
                                    {' '}
                                    <span className={styles.tick}>
                                        <Icon name="tick" />
                                    </span>
                                </td>
                                <td>
                                    <span className={styles.cross}>
                                        <Icon name="cross" />
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td>Compatibility with latest browsers</td>
                                <td>
                                    {' '}
                                    <span className={styles.tick}>
                                        <Icon name="tick" />
                                    </span>
                                </td>
                                <td>
                                    <span className={styles.cross}>
                                        <Icon name="cross" />
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td>Compatibility with latest framework versions</td>
                                <td>
                                    {' '}
                                    <span className={styles.tick}>
                                        <Icon name="tick" />
                                    </span>
                                </td>
                                <td>
                                    <span className={styles.cross}>
                                        <Icon name="cross" />
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td>Priority issue resolution</td>
                                <td>
                                    {' '}
                                    <span className={styles.tick}>
                                        <Icon name="tick" />
                                    </span>
                                </td>
                                <td>
                                    <span className={styles.cross}>
                                        <Icon name="cross" />
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td>Peace of mind for your team</td>
                                <td>
                                    {' '}
                                    <span className={styles.tick}>
                                        <Icon name="tick" />
                                    </span>
                                </td>
                                <td>
                                    <span className={styles.cross}>
                                        <Icon name="cross" />
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <h2>Contact us</h2>
                <ContactForm />
            </section>

            <ReleasesSection
                versionsData={versionsData}
                utm={utm}
                title="Recent improvements"
                subtitle="The latest updates and improvements to AG Grid"
                viewAllButtonText="View recent releases"
                viewAllButtonUrl="/whats-new"
            />

            <section className={styles.rtsTrustedSection}>
                <h2>Trusted by developers worldwide</h2>
                <div className={styles.rtsTrustedQuotes}>
                    <div className={styles.rtsTrustedQuote}>
                        <p>"The flexibility provided by AG Grid and your support is unmatched."</p>
                        <span>IT Services, EMEA</span>
                    </div>
                    <div className={styles.rtsTrustedQuote}>
                        <p>"Amazing software! Used it for years and it has been great."</p>
                        <span>Global Professional Services Firm</span>
                    </div>
                    <div className={styles.rtsTrustedQuote}>
                        <p>"Keep up the great work, it's still the best grid in the world."</p>
                        <span>Developer on X</span>
                    </div>
                </div>
            </section>

            <section className={styles.rtsRenewSection} id="renew">
                <div className={styles.rtsRenewLeft}>
                    <h2>Ready to renew?</h2>

                    <RenewNowButton
                        href={mailto}
                        className={`button ${styles.button}`}
                        plausibleEventType="renew-footer-cta"
                        text="Renew now"
                    />
                </div>
                <div className={styles.rtsRenewRight}>
                    <div className={styles.rtsRenewContent}>
                        {isCountdownEnded ? (
                            <p>
                                If your support agreement is renewed after a break in coverage, you'll be required to
                                pay the full back-pay for the inactive period, along with a reinstatement fee - 15% of
                                your upcoming support fee if the gap was under a year, or 25% of the back-pay if the gap
                                was over a year.
                            </p>
                        ) : (
                            <>
                                <p>
                                    To ensure fairness for customers who maintain continuous support and to help us
                                    deliver consistent, high-quality service and enhancements, we're updating our
                                    Support & Maintenance renewal policy.
                                </p>
                                <p>
                                    From 31 August, if you renew your agreement after a break in coverage, you'll be
                                    required to pay the <b>full back-pay for the inactive period</b>, plus a{' '}
                                    <b>reinstatement fee</b>. This fee will be <b>15% of your go-forward support fee</b>{' '}
                                    if the break was <b>under a year</b>, or
                                    <b> 25% of the back-pay</b> if the break was <b>over a year</b>.
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ReturnToSupportPage;
