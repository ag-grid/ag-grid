import { ContactForm } from '@ag-website-shared/components/contact-form/ContactForm';
import { chartsUrlWithPrefix } from '@ag-website-shared/utils/chartsUrlWithPrefix';
import { gridUrlWithPrefix } from '@ag-website-shared/utils/gridUrlWithPrefix';
import { PRODUCTION_STUDIO_SITE_URL } from '@constants';
import { useFrameworkFromStore } from '@utils/hooks/useFrameworkFromStore';
import classnames from 'classnames';
import type { FunctionComponent } from 'react';

import chartsFeaturesData from '../../content/license-features/chartsFeaturesMatrix.json';
import gridFeaturesData from '../../content/license-features/gridFeaturesMatrix.json';
import { ComparisonTable } from './comparison-table/ComparisonTable';
import styles from './license-pricing.module.scss';
import {
    BUNDLE_LINE,
    BUYING_ROUTES,
    COMMUNITY,
    CONTACT,
    ECOMMERCE_URLS,
    FAQS_HEADING,
    FEATURES,
    LIBRARY_PRODUCTS,
    type LibraryProduct,
    ONLINE_PURCHASE,
    PRICING_ANCHORS,
    PRICING_FAQS,
    STUDIO_PRODUCT,
    STUDIO_TRIAL_PATH,
} from './pricingContent';

export type LicenseTab = 'grid' | 'charts';

interface Props {
    /** The site hosting the page, recorded against contact form submissions. */
    defaultSelection: LicenseTab;
}

const CONTACT_HREF = `#${PRICING_ANCHORS.contact}`;
const STUDIO_TRIAL_URL = `${PRODUCTION_STUDIO_SITE_URL}${STUDIO_TRIAL_PATH}`;

const LibraryProductCard: FunctionComponent<{ product: LibraryProduct; gettingStartedUrl: string }> = ({
    product,
    gettingStartedUrl,
}) => (
    <article id={PRICING_ANCHORS[product.id]} className={styles.productCard}>
        <p className={styles.productCategory}>{product.category}</p>
        <h2 className={styles.productName}>{product.name}</h2>
        <p className={styles.productTagline}>{product.tagline}</p>

        <div className={styles.tiers}>
            {[product.community, product.enterprise].map(({ name, description }) => (
                <div key={name}>
                    <h3 className={styles.tierName}>{name}</h3>
                    <p>{description}</p>
                </div>
            ))}
        </div>

        <p className={styles.purchaseNote}>
            {ONLINE_PURCHASE.limit} {ONLINE_PURCHASE.otherwise}
        </p>

        <div className={styles.cardActions}>
            <a id={`${product.id}-buy-online`} className="button" href={ECOMMERCE_URLS[product.id]}>
                Buy Enterprise online
            </a>
            <p className={styles.secondaryActions}>
                <a id={`${product.id}-get-started`} href={gettingStartedUrl}>
                    Get started free
                </a>
                {' / '}
                <a id={`${product.id}-contact-sales`} href={CONTACT_HREF}>
                    Contact sales
                </a>
            </p>
        </div>
    </article>
);

const StudioProductCard: FunctionComponent = () => (
    <article id={PRICING_ANCHORS.studio} className={styles.productCard}>
        <p className={styles.productCategory}>{STUDIO_PRODUCT.category}</p>
        <h2 className={styles.productName}>{STUDIO_PRODUCT.name}</h2>
        <p className={styles.productTagline}>{STUDIO_PRODUCT.tagline}</p>

        <div className={styles.tiers}>
            <div>
                <h3 className={styles.tierName}>{STUDIO_PRODUCT.pricing}</h3>
                <p>{STUDIO_PRODUCT.description}</p>
            </div>
        </div>

        <div className={styles.cardActions}>
            <a id="studio-contact-sales" className="button" href={CONTACT_HREF}>
                Contact sales
            </a>
            <a id="studio-start-trial" className="button-secondary" href={STUDIO_TRIAL_URL}>
                Start a 45-day free trial
            </a>
            <p className={styles.purchaseNote}>{STUDIO_PRODUCT.trialNote}</p>
        </div>
    </article>
);

const FeatureComparison: FunctionComponent<{ title: string; data: typeof gridFeaturesData }> = ({ title, data }) => (
    <details className={styles.disclosure}>
        <summary>{title}</summary>
        <div className={styles.featureTable}>
            <div className={styles.featureTableHeader}>
                {FEATURES.columns.map((column) => (
                    <span key={column}>{column}</span>
                ))}
            </div>
            {data.map((section) => (
                <div key={section.group.name}>
                    <h4 className={styles.featureGroupName}>{section.group.name}</h4>
                    <ComparisonTable
                        data={section.items}
                        columns={{ label: '', community: '', enterprise: '', chartsGrid: '' }}
                        cellRenderer={{
                            label: 'label',
                            community: 'feature',
                            enterprise: 'feature',
                            chartsGrid: 'feature',
                        }}
                    />
                </div>
            ))}
        </div>
    </details>
);

export const LicensePricing: FunctionComponent<Props> = ({ defaultSelection }) => {
    const framework = useFrameworkFromStore();
    const gettingStartedUrls: Record<LibraryProduct['id'], string> = {
        grid: gridUrlWithPrefix({ framework, url: './getting-started' }),
        charts: chartsUrlWithPrefix({ framework, url: './quick-start' }),
    };

    return (
        <div className={classnames('layout-max-width-small', styles.container)}>
            <section id={PRICING_ANCHORS.products}>
                <div className={styles.productCards}>
                    {LIBRARY_PRODUCTS.map((product) => (
                        <LibraryProductCard
                            key={product.id}
                            product={product}
                            gettingStartedUrl={gettingStartedUrls[product.id]}
                        />
                    ))}
                    <StudioProductCard />
                </div>

                <div className={styles.bundleLine}>
                    <h2 className="text-lg">{BUNDLE_LINE.heading}</h2>
                    <p>{BUNDLE_LINE.body}</p>
                    <a id="bundle-buy-online" className="button-secondary" href={ECOMMERCE_URLS.bundle}>
                        Buy the Enterprise Bundle
                    </a>
                </div>
            </section>

            <section className={styles.buyingRoutes}>
                <div>
                    <h2 className="text-2xl">{BUYING_ROUTES.online.heading}</h2>
                    <p>{BUYING_ROUTES.online.body}</p>
                    <div className={styles.routeActions}>
                        <a id="route-buy-grid" className="button" href={ECOMMERCE_URLS.grid}>
                            Buy AG Grid
                        </a>
                        <a id="route-buy-charts" className="button" href={ECOMMERCE_URLS.charts}>
                            Buy AG Charts
                        </a>
                        <a id="route-buy-bundle" className="button-secondary" href={ECOMMERCE_URLS.bundle}>
                            Buy the bundle
                        </a>
                    </div>
                </div>
                <div>
                    <h2 className="text-2xl">{BUYING_ROUTES.tailored.heading}</h2>
                    <p>{BUYING_ROUTES.tailored.body}</p>
                    <p>{BUYING_ROUTES.tailored.supporting}</p>
                    <div className={styles.routeActions}>
                        <a id="route-contact-sales" className="button" href={CONTACT_HREF}>
                            Contact sales
                        </a>
                    </div>
                </div>
            </section>

            <section className={styles.section}>
                <h2 className="text-2xl">{COMMUNITY.heading}</h2>
                <p>{COMMUNITY.body}</p>
                <p className="text-secondary">{COMMUNITY.studioNote}</p>
                <p className={styles.inlineLinks}>
                    <a id="community-get-started-grid" href={gettingStartedUrls.grid}>
                        Get started with AG Grid
                    </a>
                    {' / '}
                    <a id="community-get-started-charts" href={gettingStartedUrls.charts}>
                        Get started with AG Charts
                    </a>
                </p>
            </section>

            <section id={PRICING_ANCHORS.features} className={styles.section}>
                <h2 className="text-2xl">{FEATURES.heading}</h2>
                <p>{FEATURES.intro}</p>
                <FeatureComparison title="Compare AG Grid features" data={gridFeaturesData} />
                <FeatureComparison title="Compare AG Charts features" data={chartsFeaturesData} />
                <p className={styles.inlineLinks}>
                    <a id="explore-studio" href={`${PRODUCTION_STUDIO_SITE_URL}/`}>
                        Explore AG Studio
                    </a>
                </p>
            </section>

            <section id={PRICING_ANCHORS.faqs} className={styles.section}>
                <h2 className="text-2xl">{FAQS_HEADING}</h2>
                {PRICING_FAQS.map(({ question, answer }) => (
                    <details key={question} className={styles.disclosure}>
                        <summary>{question}</summary>
                        <p>{answer}</p>
                    </details>
                ))}
            </section>

            <section id={PRICING_ANCHORS.contact} className={styles.contactSection}>
                <div>
                    <h2 className="text-2xl">{CONTACT.heading}</h2>
                    <p>{CONTACT.intro}</p>
                </div>
                <div className="trial-licence-form">
                    <ContactForm
                        formLocation={defaultSelection === 'grid' ? 'Grid pricing page' : 'Charts pricing page'}
                    />
                </div>
            </section>
        </div>
    );
};
