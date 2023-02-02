import classnames from 'classnames';
import ukraineFlagSVG from 'images/ukraine-flag.svg';
import React from 'react';
import { Alert } from '../components/alert/Alert';
import SEO from './components/SEO';
// @ts-ignore
import styles from './license-pricing.module.scss';

const LicensePricing = () => {
    return (
        <div className="ag-styles">
            <div className={classnames('page-margin', styles.container)}>
                <h1 className={styles.pageHeader}>AG Grid Licensing&nbsp;&amp;&nbsp;Pricing</h1>

                <Alert type="flag">
                    <img src={ukraineFlagSVG} alt="flag of Ukraine" />

                    <p>
                        In light of current events in Ukraine we are choosing to express our disappointment in the
                        breakdown of diplomacy, and its effects on the people of Ukraine, the global economy and
                        community by not licensing software to companies or individuals registered or residing in the
                        Russian Federation.
                    </p>
                </Alert>

                {/* <section className={styles.info}>
                    <div className={styles.infoItem}>
                        <div className={styles.ukraineFlag}>
                            <div className={styles.top}></div>
                            <div className={styles.bottom}></div>
                        </div>
                        <div>
                            <h3>Sales Update</h3>
                            <p>
                                In light of current events in Ukraine we are choosing to express our disappointment in
                                the breakdown of diplomacy, and its effects on the people of Ukraine, the global economy
                                and community by not licensing software to companies or individuals registered or
                                residing in the Russian Federation.
                            </p>
                        </div>
                    </div>
                    <div className={styles.infoItem}>
                        <img src="../images/pricing/Community.svg" className={styles.mitLogo} alt="MIT" />
                        <div>
                            <h3>AG Grid Community</h3>
                            <p>
                                AG Grid Community is a free to use product distributed under the{' '}
                                <a href="/eula/AG-Grid-Community-License.html">MIT License</a>. It is free to use in
                                your production environments.
                            </p>
                            <h3>AG Charts Community</h3>
                            <p>
                                AG Charts Community (a.k.a. <a href="/javascript-charts/overview/">Standalone Charts</a>
                                ) is a free to use product distributed under the{' '}
                                <a href="/eula/AG-Grid-Community-License.html">MIT License</a>. It is free to use in
                                your production environments.
                            </p>
                        </div>
                    </div>
                    <div className={styles.infoItem}>
                        <img src="../images/svg/enterprise.svg" className={styles.enterpriseLogo} alt="Enterprise" />
                        <div>
                            <h3>AG Grid Enterprise</h3>
                            <div className={styles.enterpriseContent}>
                                <div>
                                    <p>
                                        AG Grid Enterprise is a commercial product distributed under our{' '}
                                        <a href="/eula/AG-Grid-Enterprise-License-Latest.html">EULA</a> and supported by
                                        our technical staff. It has advanced functionality like Row Grouping, Range
                                        Selection, Master / Detail, Server Side Row Model and{' '}
                                        <a href="/javascript-data-grid/licensing/">more</a>. AG Grid Enterprise also comes
                                        with <a href="/javascript-data-grid/integrated-charts/">Integrated Charts</a>,
                                        allowing users to create charts using the grid's UI.
                                    </p>
                                    <p>
                                        To evaluate AG Grid Enterprise you don&apos;t need our permission – all features
                                        are unlocked. To temporarily hide the watermark and browser console errors
                                        e-mail <a href="mailto:info@ag-grid.com">info@ag-grid.com</a> to get a temporary
                                        evaluation key.
                                    </p>
                                    <p>
                                        Once you&apos;re ready to begin development, please purchase an appropriate
                                        license key from the options below.
                                    </p>
                                    <p>
                                        Expanded definitions and FAQ responses are available further down the page. You
                                        can e-mail us at any time on{' '}
                                        <a href="mailto:info@ag-grid.com">info@ag-grid.com</a>.
                                    </p>
                                </div>

                                <iframe
                                    src="https://www.youtube.com/embed/20SLdu4wLtI"
                                    title="YouTube video player"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </div>
                    </div>
                </section>
                <section>
                    <Licenses />
                </section>
                <section className={styles.bulkDiscount}>
                    <p>
                        Bulk pricing discounts available. Use the BUY buttons above to see pricing for up to 10
                        developers. For more than 10 developers or any questions with regards your purchase, please
                        email <a href="mailto:info@ag-grid.com">info@ag-grid.com</a>.
                    </p>
                </section>
                <section className={styles.definitions}>
                    <h2>Definitions</h2>
                    <dl>
                        <dt className={styles.definitionTerm}>
                            <img src="../images/pricing/SA.svg" />
                            Single Application Development License
                        </dt>
                        <dd>
                            <p>
                                Licenses <b>one application</b>, developed for internal use, to embed AG Grid Enterprise
                                in perpetuity.
                            </p>
                            <ul>
                                <li>Includes a 1-year subscription to new versions, support and maintenance.</li>
                                <li>
                                    For customer-facing applications you will also need a Deployment License add-on.
                                </li>
                                <li>
                                    All concurrent, front-end, JavaScript developers working on the Application would
                                    need to be added to the license count, not just the ones working with AG Grid.
                                </li>
                                <li>
                                    Developers within the Single Application Development License count are unnamed, so
                                    long as the total licensed count isn’t exceeded.
                                </li>
                                <li>
                                    Single Application Development Licenses are bound to an application name and can’t
                                    be reused on other applications.
                                </li>
                            </ul>
                        </dd>

                        <dt className={styles.definitionTerm}>
                            <img src="../images/pricing/MA.svg" />
                            Multiple Application Development License
                        </dt>
                        <dd>
                            <p>
                                Licenses <b>unlimited number of applications</b>, developed for internal use, to embed
                                AG Grid Enterprise in perpetuity.
                            </p>

                            <ul>
                                <li>Includes a 1-year subscription to new versions, support and maintenance.</li>
                                <li>
                                    For customer-facing applications you will also need a Deployment License add-on.
                                </li>
                                <li>
                                    All concurrent, front-end, JavaScript developers working across the licensed
                                    Applications would need to be added to the license count, not just the ones working
                                    with AG Grid.
                                </li>
                                <li>
                                    Developers within the Multiple Application Development License count are unnamed, so
                                    long as the total licensed count isn’t exceeded.
                                </li>
                            </ul>
                        </dd>

                        <dt className={styles.definitionTerm}>
                            <img src="../images/pricing/Deployment%20Add-on.svg" />
                            Deployment License Add-on
                        </dt>
                        <dd>
                            <p>
                                Allows licensed developers to sub-license AG Grid for one application on one production
                                environment in perpetuity. Includes a 1-year subscription to new versions, support and
                                maintenance. Only available with a Developer License.
                            </p>

                            <ul>
                                <li>
                                    A Deployment License Add-on allows making a project available to individuals (eg
                                    your customers) outside of your organisation (sub-license).
                                </li>
                                <li>
                                    One Deployment License Add-on covers one production environment for one project.
                                </li>
                                <li>
                                    Only production environments require licensing. All other environments (eg
                                    development, test, pre-production) do not require a license.
                                </li>
                                <li>
                                    We do not charge per server. A cluster of many servers part of one application
                                    installation is considered one deployment and requires one Deployment License. This
                                    is true so long as the application instances within the cluster are replicas of each
                                    other and server to provide load balancing and fail over only.
                                </li>
                                <li>
                                    Production failover deployments do not need to be licensed separately. They are
                                    considered part of the overall application production deployment.
                                </li>
                                <li>
                                    Multi-tenant deployments, where one application instance is serving many customers
                                    over different URLs, is considered one deployment, as each tenant is getting
                                    serviced by the same application instance.
                                </li>
                                <li>
                                    Different instances of the same application, where the instances are not part of a
                                    cluster for fail over or load balancing, are considered independent deployments and
                                    need a Deployment License for each individual application instance.
                                </li>
                                <li>
                                    Deploying an application to a cloud service (eg AWS or Docker) requires one
                                    Deployment License, regardless of how many virtual containers or servers the cloud
                                    application spawns for that one single instance of the application.
                                </li>
                            </ul>

                            <p>
                                If you have a deployment that doesn't fit within our licensing model, please start a
                                conversation with us through <a href="mailto:info@ag-grid.com">info@ag-grid.com</a> and
                                we will do our best to get to something that works.
                            </p>
                        </dd>
                    </dl>
                </section> */}
            </div>
        </div>
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
