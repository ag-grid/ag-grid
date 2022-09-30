import React from 'react';
import SEO from './components/SEO';
// @ts-ignore
import styles from './components/assets/homepage/homepage.module.scss';

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
                                    <div className={styles['license-pricing__content__packages__ag-enterprise__video']}>
                                        <h4>
                                        Enterprise License<br/>Explained Video
                                        </h4>
                                        <a href="https://www.youtube.com/watch?v=20SLdu4wLtI" target="_">
                                            <img src="https://localhost:8000/videos/AgGridVideo.png"/>
                                            <span className="LearningVideos-module--learning-videos__video__anchor-body__body__video-content__running-time--TN9pm">
                                                8:30
                                            </span>
                                        </a>
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
                    <section className={styles['license-pricing__timeline']}>
                        <div>
                            <div>&nbsp;</div>
                            <div style={{textDecoration: "underline", color: "magenta"}}>
                                <h2 style={{color: "black", fontSize: "2.5rem"}}>LICENSE TIMELINE</h2>
                            </div>
                        </div>
                        <div>
                            <div>
                                <img src="../images/pricing/Perpetual.svg" alt="Perpetual"/>
                            </div>
                            <div>
                                <span>Perpetual License</span>
                                <p>
                                    When you purchase AG Grid Enterprise you are granted a license to use a version of the product in
                                    perpetuity. There are no further charges until you choose to extend your license to cover newer
                                    versions (see next point).
                                </p>
                                <p>Please note that while use of the software is perpetual, Support and Corrective Maintenance are not. We
                                    do not provide issue resolution to versions of AG Grid Enterprise older than 12 months. We roll bug fixes,
                                    performance enhancements and other improvements into new releases; we don't patch, fix or in any way
                                    alter older versions.
                                </p>
                                <div>
                                    <img src="../images/pricing/Version%201.svg" alt="Perpetual timeline"/>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div>
                                <img src="../images/pricing/1-year.svg" alt="1-year"/>
                            </div>
                            <div>
                                <span>1-year Subscription to New Versions (included)</span>
                                <p>When you make a purchase you get a Subscription to license new versions of AG Grid Enterprise for 365 days.
                                    You can see our release list <a href="/changelog/">here</a>. After 365 days you will no longer be able to
                                    license the latest versions
                                    of AG Grid Enterprise without renewing your subscription. You can continue to use your licensed versions
                                    in perpetuity.
                                </p>
                                <p>
                                    Please note that while use of the software is perpetual, Support and Corrective Maintenance are not. We
                                    do not provide issue resolution to versions of AG Grid Enterprise older than 12 months. We roll bug fixes,
                                    performance enhancements and other improvements into new releases; we don't patch, fix or in any way
                                    alter older versions.
                                </p>
                                <div>
                                    <img src="../images/pricing/Versions%202.svg" alt="1-year timeline"/>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div>
                                <img src="../images/pricing/Renewal%20icon.svg" alt="Renewal"/>
                            </div>
                            <div>
                                <span>Subscription Renewal (optional)</span>
                                <p>
                                    At the end of your subscription period you will no longer be able to license the latest
                                    versions of AG Grid Enterprise or access support without renewing. This could range from
                                    365 days up to a 3-year term. Renewal pricing starts as follows: Single Application Developer
                                    License, $350; Multiple Applications Developer License, $560;
                                    Deployment License Add-on, $350.
                                </p>
                                <p>
                                    Please note that while use of the software is perpetual Support and Corrective Maintenance
                                    are not. We do not provide issue resolution to versions of AG Grid Enterprise older than
                                    12 months. We roll bug fixes, performance enhancements and other improvements into new
                                    releases; we don’t patch, fix or in any way alter older versions.
                                </p>
                                <div>
                                    <img src="../images/pricing/Versions%203.svg" alt="Renewal timeline"/>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div>
                                &nbsp;
                            </div>
                            <div>
                                <span>Support (only with an active subscription)</span>
                                <p>
                                    We offer a log-in protected support portal that has a vast knowledge base and access to
                                    our ticketing system. We aim to respond to support requests within 24 hours. We operate on business days
                                    only, between 9am and 5pm GMT.
                                </p>
                            </div>
                        </div>
                        <div>
                            <div>
                                &nbsp;
                            </div>
                            <div>
                                <span>Corrective maintenance (only with an active subscription)</span>
                                <p>
                                    We roll bug fixes, performance enhancements and other improvements into new releases and
                                    expect customers to upgrade to a version of AG Grid that resolves their issue. Starting
                                    with version 22.0 we will also aim to release Patches for critical issues on a bi-weekly
                                    schedule.
                                </p>

                            </div>
                        </div>
                    </section>
                    <section className={styles['license-pricing__deeper-dive']}>
                        <div>
                            <div>&nbsp;</div>
                            <div style={{textDecoration: "underline", color: "red"}}>
                                <h2 style={{color: "black", fontSize: "2.5rem"}}>DEEPER DIVE</h2>
                            </div>
                        </div>
                        <div>
                            <div>
                                <img src="../images/pricing/Dependency.svg" alt="Project dependency"/>
                            </div>
                            <div>
                                <span>Project Dependency</span>
                                <p>A software project will have a dependency on AG Grid Enterprise if it requires our software to
                                    perform some of its functions. Every Front-End JavaScript developer working on the project will need
                                    to be licensed.
                                </p>
                                <div className="example card">
                                    <div className="card-header">Example</div>
                                    <div className="card-body">
                                        <div className="card-text">
                                            Company &lsquo;A&rsquo; is developing an application named &lsquo;MyApp&rsquo;. The app needs to render
                                            10K rows of data in a table and allow users to group, filter and sort. The dev team adds AG Grid
                                            Enterprise
                                            to the project to satisfy that requirement. 5 Front-End and 10 Back-End developers are working on
                                            &lsquo;MyApp&rsquo;. Only 1 Front-End developer is tasked with configuring and modifying the data grid.
                                            The benefit to the UI is project-wide however and all developers contributing to it need to be licensed.
                                            Company &lsquo;A&rsquo; purchases 5 licenses for AG Grid Enterprise.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div>
                                <img src="../images/pricing/Indirect.svg" alt="Indirect dependency"/>
                            </div>
                            <div>
                                <span>Indirect Project Dependency</span>
                                <p>
                                    A software project will have an indirect dependency on AG Grid Enterprise even if it's wrapped into
                                    another framework, file, library, etc. Every Front-End JavaScript developer working on a project using
                                    a library that wraps AG Grid Enterprise will need to be licensed.
                                </p>
                                <p>Please note: You are not allowed to wrap AG Grid Enterprise in a framework, library, component, etc. and
                                    make it available as a development tool outside of your organisation.
                                </p>
                                <div className="example card">
                                    <div className="card-header">Example</div>
                                    <div className="card-body">
                                        <div className="card-text">
                                            A UI development team at Company &lsquo;A&rsquo; creates its own UI library for internal development
                                            and includes AG Grid Enterprise as a component. The team working on &lsquo;MyApp&rsquo; uses the new
                                            library and so does the team working on &lsquo;NewApp&rsquo;. &lsquo;MyApp&rsquo; has 5 Front-End
                                            JavaScript developers and &lsquo;NewApp&rsquo; has 3. There are 2 Front-End JavaScript developers on
                                            the UI development team. Company &lsquo;A&rsquo; purchases 10 licenses for AG Grid Enterprise.
                                        </div>
                                    </div>
                                </div>
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
