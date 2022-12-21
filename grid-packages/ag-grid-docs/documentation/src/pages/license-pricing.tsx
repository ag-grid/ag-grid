import React from 'react';
import SEO from './components/SEO';
// @ts-ignore
import styles from './components/assets/homepage/homepage.module.scss';
// @ts-ignore
import {hostPrefix} from '../utils/consts';

const LicensePricing = () => {
    return (
        <div className={styles['page-content']} style={{marginLeft: "5rem", marginRight: "4rem"}}>
            <div className={styles['license-pricing']}>
                <div className={styles['license-pricing__content']}>
                    <h1 className={styles['page-title']}>AG Grid Licensing &amp; Pricing</h1>
                    <section className={styles['license-pricing__content__packages']}>
                        <div>
                            <div>
                                <div style={{width: "75px"}}>
                                    <div style={{backgroundColor: "#0057b7", height: "25px"}}>
                                    </div>
                                    <div style={{backgroundColor: "#ffd700", height: "25px"}}>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3>Sales Update</h3>
                                <p>
                                    In light of current events in Ukraine we are choosing to express our disappointment in the breakdown of diplomacy,
                                    and its effects on the people of Ukraine, the global economy and community by not licensing software to companies
                                    or individuals registered or residing in the Russian Federation.
                                </p>
                            </div>
                        </div>
                        <div>
                            <div>
                                <img src="../images/pricing/Community.svg" style={{maxWidth: 50}} alt="MIT"/>
                            </div>
                            <div>
                                <h3>AG Grid Community</h3>
                                <p>
                                    AG Grid Community is a free to use product distributed under the <a href="/eula/AG-Grid-Community-License.html">MIT
                                    License</a>. It is free to use in your production environments.
                                </p>
                                <h3 style={{marginTop: 26}}>AG Charts Community</h3>
                                <p>
                                    AG Charts Community (a.k.a. <a href="/javascript-charts/overview/">Standalone Charts</a>)
                                    is a free to use product distributed under the <a href="/eula/AG-Grid-Community-License.html">MIT License</a>.
                                    It is free to use in your production environments.
                                </p>
                            </div>
                        </div>
                        <div>
                            <div>
                                <img src="../images/svg/enterprise.svg" style={{maxWidth: 50}} alt="Enterprise"/>
                            </div>
                            <div className={styles['license-pricing__content__packages__ag-enterprise']}>
                                <h3>AG Grid Enterprise</h3>
                                <div className={styles['license-pricing__content__packages__ag-enterprise__contents']}>
                                    <div>
                                        <p>
                                            AG Grid Enterprise is a commercial product distributed under our <a
                                            href="/eula/AG-Grid-Enterprise-License-Latest.html">EULA</a> and supported by our
                                            technical staff. It has advanced functionality like Row Grouping, Range Selection,
                                            Master / Detail, Server Side Row Model and <a href="/javascript-grid/licensing/">more</a>.
                                            AG Grid Enterprise also comes with <a href="/javascript-grid/integrated-charts/">Integrated Charts</a>, allowing
                                            users to create charts
                                            using the grid's UI.
                                        </p>
                                        <p>
                                            To evaluate AG Grid Enterprise you don’t need our permission – all features are unlocked.
                                            To temporarily hide the watermark and browser console errors e-mail <a
                                            href="mailto:info@ag-grid.com">info@ag-grid.com</a> to
                                            get a temporary evaluation key.
                                        </p>
                                        <p>
                                            Once you’re ready to begin development, please purchase an appropriate license key from the
                                            options below.
                                        </p>
                                        <p>
                                            Expanded definitions and FAQ responses are available further down the page. You can e-mail
                                            us at any time on <a href="mailto:info@ag-grid.com">info@ag-grid.com</a>.
                                        </p>
                                    </div>
                                    <div style={{float: 'right'}}>
                                        <iframe width="400" height="226" 
                                            src="https://www.youtube.com/embed/20SLdu4wLtI" 
                                            title="YouTube video player" 
                                            frameborder="0" 
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>                                            
                                        </iframe>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className={styles['license-pricing__licenses']}>
                        <div className={styles['license-pricing__licenses__license-container']}>
                            <div className={styles['license-pricing__licenses__license']} style={{borderColor: "#009ede"}}>
                                <div>
                                    <img src="../images/pricing/SA.svg" alt="Single Application"/>
                                    <h3>AG Grid Enterprise</h3>
                                    <h2>Single Application</h2>
                                    <h3>Development License</h3>
                                </div>
                                <h4>
                                    <div style={{fontSize: "0.9rem"}}>Starting at</div>
                                    &#x24;750.<span style={{fontSize: "small"}}>00</span>
                                    <p>Per Developer</p>
                                </h4>
                                <div>
                                    <a className="btn" style={{color: "#009ede", borderColor: "#009ede"}}
                                       href="/ecommerce/#/ecommerce/?licenseType=single" target="_blank" rel="noreferrer">BUY</a>
                                </div>
                            </div>
                            <div className={styles['license-pricing__licenses__license']} style={{borderColor: "#009d70"}}>
                                <div>
                                    <img src="../images/pricing/MA.svg" alt="Multiple Applications"/>
                                    <h3>AG Grid Enterprise</h3>
                                    <h2>Multiple Applications</h2>
                                    <h3>Development License</h3>
                                </div>
                                <h4>
                                    <div style={{fontSize: "0.9rem"}}>Starting at</div>
                                    &#x24;1,200.<span style={{fontSize: "small"}}>00</span>
                                    <p>Per Developer</p>
                                </h4>
                                <div>
                                    <a className="btn" style={{color: "#009d70", borderColor: "#009d70"}}
                                       href="/ecommerce/#/ecommerce/?licenseType=multi" target="_blank" rel="noreferrer">BUY</a>
                                </div>
                            </div>
                            <div className={styles['license-pricing__licenses__license']} style={{borderColor: "#fbad18"}}>
                                <div>
                                    <img src="../images/pricing/Deployment%20Add-on.svg" alt="Deployment License"/>
                                    <h3>AG Grid Enterprise</h3>
                                    <h2>Deployment License</h2>
                                    <h3>Add-on</h3>
                                </div>
                                <h4>
                                    <div style={{fontSize: "0.9rem"}}>Starting at</div>
                                    &#x24;750.<span style={{fontSize: "small"}}>00</span>
                                    <p>Per Application Production Environment</p>
                                </h4>
                                <div>
                            <span style={{
                                display: "inline-block",
                                padding: "0.5rem 1rem",
                                fontSize: "1.25rem",
                                lineHeight: "1.5",
                                borderRadius: "0.3rem"
                            }}>
                                Buy with a Development License
                            </span>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section>
                        <div>
                            <div style={{textAlign: "center"}}>
                                <div style={{maxWidth: 800, display: "inline-block"}}>
                                    Bulk pricing discounts available. Use the BUY buttons above to see pricing for up to 10 developers.
                                    For more than 10 developers or any questions with regards your purchase, please email <a
                                    href="mailto:info@ag-grid.com">info@ag-grid.com</a>.
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className={styles['license-pricing__definitions']}>
                        <div>
                            <div>&nbsp;</div>
                            <div style={{textDecoration: "underline", color: "orange"}}>
                                <h2 style={{color: "black", fontSize: "2.5rem"}}>DEFINITIONS</h2>
                            </div>
                        </div>
                        <div>
                            <div>
                                <img src="../images/pricing/SA.svg"/>
                            </div>
                            <div>
                                <h3>Single Application Development License</h3>
                                <p></p>
                                <p>
                                    Licenses <b>one application</b>, developed for internal use, to embed AG Grid
                                    Enterprise in perpetuity.
                                </p>
                                <ul>
                                    <li>
                                        Includes a 1-year subscription to new versions, support
                                        and maintenance.
                                    </li>
                                    <li>
                                        For customer-facing applications you will also need a Deployment
                                        License add-on.
                                    </li>
                                    <li>
                                        All concurrent, front-end, JavaScript developers working on the Application
                                        would need to be added to the license count, not just the ones working with
                                        AG Grid.
                                    </li>
                                    <li>
                                        Developers within the Single Application Development License count are
                                        unnamed, so long as the total licensed count isn’t exceeded.
                                    </li>
                                    <li>
                                        Single Application Development Licenses are bound to an application name
                                        and can’t be reused on other applications.
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div>
                            <div>
                                <img src="../images/pricing/MA.svg"/>
                            </div>
                            <div>

                                <h3>Multiple Application Development License</h3>
                                <p></p>

                                <p>
                                    Licenses <b>unlimited number of applications</b>, developed for internal use, to embed AG Grid
                                    Enterprise in perpetuity.
                                </p>

                                <ul>
                                    <li>
                                        Includes a 1-year subscription to new versions, support
                                        and maintenance.
                                    </li>
                                    <li>
                                        For customer-facing applications you will also need a Deployment
                                        License add-on.
                                    </li>
                                    <li>
                                        All concurrent, front-end, JavaScript developers working across the
                                        licensed Applications would need to be added to the license count,
                                        not just the ones working with AG Grid.
                                    </li>
                                    <li>
                                        Developers within the Multiple Application Development License count are
                                        unnamed, so long as the total licensed count isn’t exceeded.
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div>
                            <div>
                                <img src="../images/pricing/Deployment%20Add-on.svg"/>
                            </div>
                            <div>
                                <h3>Deployment License Add-on</h3>
                                <p>
                                    Allows licensed developers to sub-license AG Grid for one application on one production
                                    environment in perpetuity. Includes a 1-year subscription to new versions, support and
                                    maintenance. Only available with a Developer License.
                                </p>

                                <ul>
                                    <li>
                                        A Deployment License Add-on allows making a project available
                                        to individuals (eg your customers) outside of your organisation
                                        (sub-license).
                                    </li>
                                    <li>
                                        One Deployment License Add-on covers one production environment
                                        for one project.
                                    </li>
                                    <li>
                                        Only production environments require licensing. All other environments
                                        (eg development, test, pre-production) do not require a license.
                                    </li>
                                    <li>
                                        We do not charge per server. A cluster of many servers
                                        part of one application installation is considered one deployment
                                        and requires one Deployment License. This is true so long as the
                                        application instances within the cluster are replicas of each other
                                        and server to provide load balancing and fail over only.
                                    </li>
                                    <li>
                                        Production failover deployments do not need to be licensed separately.
                                        They are considered part of the overall application production deployment.
                                    </li>
                                    <li>
                                        Multi-tenant deployments, where one application instance is serving
                                        many customers over different URLs, is considered one deployment, as
                                        each tenant is getting serviced by the same application instance.
                                    </li>
                                    <li>
                                        Different instances of the same application, where the instances
                                        are not part of a cluster for fail over or load balancing, are considered
                                        independent deployments and need a Deployment License for each
                                        individual application instance.
                                    </li>
                                    <li>
                                        Deploying an application to a cloud service (eg AWS or Docker) requires
                                        one Deployment License, regardless of how many virtual containers
                                        or servers the cloud application spawns for that one single instance
                                        of the application.
                                    </li>
                                </ul>

                                <p>
                                    If you have a deployment that doesn't fit within our licensing model,
                                    please start a conversation with us through <a href="mailto:info@ag-grid.com">info@ag-grid.com</a> and we will do
                                    our
                                    best to get to something that works.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}

const LicensePricingPage = () => {
    return (
        <>
            <SEO title="AG Grid: License and Pricing"
                 description="AG Grid is a feature-rich datagrid available in Community or Enterprise versions. This page describes the License and Pricing details for AG Grid Enterprise."/>
            <LicensePricing/>
        </>
    )
}

export default LicensePricingPage;
