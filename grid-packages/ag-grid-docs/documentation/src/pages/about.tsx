import React from 'react';
import SEO from './components/SEO';
import styles from './components/assets/homepage/homepage.module.scss';

const AboutPage = () => {
    return (
        <>
            <SEO title="Our Mission, Our Principles and Our Team at AG Grid"
                 description="AG Grid is a feature-rich datagrid available in Community or Enterprise versions. This is the story of AG Grid and explains our mission, where we came from and who we are."/>
            <div className={styles['page-content']} style={{marginLeft: "5rem", marginRight: "5rem"}}>
                <div className={styles['about-page']}>
                    <section>
                        <h1 className={styles['page-title']}>About AG Grid</h1>
                    </section>
                    <section>
                        <h2>Our Mission</h2>
                        <article>
                            <p className="lead">
                                At AG Grid, our mission is simple: <strong>Build the best datagrid in the world</strong>.
                            </p>
                            <p>
                                Born out of frustration with existing solutions, <strong>AG Grid</strong> evolved from a side
                                project to becoming the leading JavaScript datagrid on the market. We are a company built by
                                developers for developers, and - true to our roots - we offer <strong>AG Grid Community</strong>:
                                a free and open-source project that delivers world class grid performance. <strong>AG Grid
                                Enterprise</strong> is our commercially-licensed offering which has enjoyed widespread adoption
                                and facilitates us to keep delivering on our mission.
                            </p>
                            <p>
                                Our story is proof that necessity is the mother of invention. During his time working in
                                London-based financial institutions, <strong>Niall Crosby</strong> - founder and CEO - struggled
                                to find any datagrid component that could deliver the performance required in tandem with a
                                complete feature list. This struggle ultimately led Niall to pulling out the keyboard one
                                Christmas holiday period and starting <strong>AG Grid</strong> as a side project. This was then
                                released as open source and quickly developed a following.
                            </p>
                            <p>
                                Niall found himself having to devote considerable time and effort to maintaining
                                <strong> AG Grid</strong>, even fielding feature requests from users. It became apparent that
                                this thing had legs - and the idea of <strong>AG Grid Enterprise</strong> took seed in Niall’s
                                mind. A little over one year after the project started the first commercial version was
                                launched.
                            </p>
                            <p>
                                Today, <strong>AG Grid</strong> is a self-funded, bootstrapped company with thousands of
                                customers globally. Our product has resonated in the market - as our users face the same
                                challenges Niall did - and this has been central to our rapid growth. And we’re not stopping
                                here: we are working on the next great features to continue our mission.
                            </p>
                        </article>
                    </section>
                    <section>
                        <h2>Our Principles</h2>
                        <article>
                            <p>We believe that a datagrid should be agnostic to the framework that developers choose. This
                                allows flexibility and future-proofs your development. This is also where the 'ag' in <strong>AG Grid </strong>
                                comes from. </p>
                            <p>Our experience is in building Enterprise applications: we know that the datagrid is at the core
                                of an Enterprise application, and needs to deliver performance and a rich feature set. </p>
                            <p>We give away what others charge for. <strong>AG Grid Community</strong> provides all of the
                                features of our competition. We only charge when we go above and beyond, with features that
                                other grids don’t provide. </p>
                        </article>
                    </section>
                    <section>
                        <h2 id="core-development-team">The Dev Team</h2>
                        <article className="inline-container team">
                            <div className="row">
                                <div className="col-md-4">
                                    <div>
                                        <img src='../images/team/niall.jpg' alt="Niall Crosby, Founder / CEO / CTO"/>
                                    </div>
                                    <h3>Niall Crosby</h3>
                                    <h4>CEO / CTO</h4>
                                </div>
                                <div className="col-md-4">
                                    <div>
                                        <img src='../images/team/rob.jpg' alt="Rob Clarke, Head of Engineering"/>
                                    </div>
                                    <h3>Rob Clarke</h3>
                                    <h4>Head of Engineering</h4>
                                </div>
                                <div className="col-md-4">
                                    <div>
                                        <img src='../images/team/sean.jpg' alt="Sean Landsman, Lead Developer"/>
                                    </div>
                                    <h3>Sean Landsman</h3>
                                    <h4>Lead Developer, Frameworks</h4>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-4">
                                    <div>
                                        <img src='../images/team/gil.jpg' alt="Guilherme Lopes, Lead Developer"/>
                                    </div>
                                    <h3>Guilherme Lopes</h3>
                                    <h4>Lead Developer, UI</h4>
                                </div>
                                <div className="col-md-4">
                                    <div>
                                        <img src='../images/team/stephen.jpeg' alt="Stephen Cooper, Developer"/>
                                    </div>
                                    <h3>Stephen Cooper</h3>
                                    <h4>Developer, Grid Core</h4>
                                </div>
                                <div className="col-md-4">
                                    <div>
                                        <img src='../images/team/alanT.jpg' alt="Alan Treadway, Developer"/>
                                    </div>
                                    <h3>Alan Treadway</h3>
                                    <h4>Developer, Grid Core</h4>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-4">
                                    <div>
                                        <img src='../images/team/mana.jpeg' alt="Mana Peirov, Developer"/>
                                    </div>
                                    <h3>Mana Peirov</h3>
                                    <h4>Developer, Data Visualisation</h4>
                                </div>
                                <div className="col-md-4">
                                    <div>
                                        <img src='../images/team/alberto.jpg' alt="Alberto Gutierrez, Head of Customer Services"/>
                                    </div>
                                    <h3>Alberto Gutierrez</h3>
                                    <h4>Head of Customer Services</h4>
                                </div>
                                <div className="col-md-4">
                                    <div>
                                        <img src='../images/team/shuheb.jpg' alt="Shuheb Ahmed, Developer"/>
                                    </div>
                                    <h3>Shuheb Ahmed</h3>
                                    <h4>Developer</h4>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-4">
                                    <div>
                                        <img src='../images/team/bam.jpg' alt="Bamdad Fard, Developer"/>
                                    </div>
                                    <h3>Bamdad Fard</h3>
                                    <h4>Developer</h4>
                                </div>
                                <div className="col-md-4">
                                    <div>
                                        <img src='../images/team/louis.jpg' alt="Louis Moore, Developer"/>
                                    </div>
                                    <h3>Louis Moore</h3>
                                    <h4>Developer</h4>
                                </div>
                                <div className="col-md-4">
                                    <div>
                                        <img src='../images/team/marats.jpeg' alt="Marats Stelihs, Developer"/>
                                    </div>
                                    <h3>Marats Stelihs</h3>
                                    <h4>Developer</h4>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-4">
                                    <div>
                                        <img src='../images/team/kiril.png' alt="Kiril Matev, Developer"/>
                                    </div>
                                    <h3>Kiril Matev</h3>
                                    <h4>Technical Product Manager</h4>
                                </div>
                                <div className="col-md-4">
                                    <div>
                                        <img src='../images/team/viqas.jpg' alt="Viqas Hussain, Lead Developer"/>
                                    </div>
                                    <h3>Viqas Hussain</h3>
                                    <h4>Lead Developer, E-commerce</h4>
                                </div>
                                <div className="col-md-4">
                                    <div>
                                        <img src='../images/team/alan.jpg' alt="Alan Richardson, Digital Marketing"/>
                                    </div>
                                    <h3>Alan Richardson</h3>
                                    <h4>Digital Marketing</h4>
                                </div>
                            </div>
                        </article>
                    </section>
                    <section>
                        <h2 id="operations_team">The Operations Team</h2>
                        <article className="inline-container team">
                            <div className="row">
                                <div className="col-md-4">
                                    <div>
                                        <img src='../images/team/dimo.jpg' alt="Dimo Iliev, Managing Director"/>
                                    </div>
                                    <h3>Dimo Iliev</h3>
                                    <h4>Managing Director</h4>
                                </div>
                                <div className="col-md-4">
                                    <div>
                                        <img src='../images/team/simon.jpg' alt="Simon Kenny, Customer Experience Manager"/>
                                    </div>
                                    <h3>Simon Kenny</h3>
                                    <h4>Sales Director</h4>
                                </div>
                                <div className="col-md-4">
                                    <div>
                                        <img src='../images/team/nathan.jpeg' alt="Nathan Gauge-Klein, General Counsel"/>
                                    </div>
                                    <h3>Nathan Gauge-Klein</h3>
                                    <h4>General Counsel</h4>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-4">
                                    <div>
                                        <img src='../images/team/victoria.jpeg'
                                             alt="Victoria Tennant, Business Development Manager"/>
                                    </div>
                                    <h3>Victoria Tennant</h3>
                                    <h4>Renewals Team Manager</h4>
                                </div>
                                <div className="col-md-4">
                                    <div>
                                        <img src='../images/team/dimple.jpg' alt="Dimple Unalkat, Customer Experience Team"/>
                                    </div>
                                    <h3>Dimple Unalkat</h3>
                                    <h4>Initials Team Manager</h4>
                                </div>
                                <div className="col-md-4">
                                    <div>
                                        <img src='../images/team/sachshell.png' alt="Sachshell Rhoden, Customer Experience Manager"/>
                                    </div>
                                    <h3>Sachshell Rhoden</h3>
                                    <h4>Sales Operations Manager</h4>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-4">
                                    <div>
                                        <img src='../images/team/alison.jpeg'
                                             alt="Alison Bunworth, Business Development Manager"/>
                                    </div>
                                    <h3>Alison Bunworth</h3>
                                    <h4>Business Development Manager</h4>
                                </div>
                                <div className="col-md-4">
                                    <div>
                                        <img src='../images/team/robD.jpg' alt="Rob Dunkiert, Customer Experience Manager"/>
                                    </div>
                                    <h3>Rob Dunkiert</h3>
                                    <h4>Customer Experience Manager</h4>
                                </div>
                                <div className="col-md-4">
                                    <div>
                                        <img src='../images/team/ryan.png' alt="Ryan Short, Customer Experience Manager"/>
                                    </div>
                                    <h3>Ryan Short</h3>
                                    <h4>Customer Experience Manager</h4>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-4">
                                    <div>
                                        <img src='../images/team/seweety.jpeg' alt="Seweety Kumar, Customer Experience Manager"/>
                                    </div>
                                    <h3>Seweety Kumar</h3>
                                    <h4>Customer Experience Manager</h4>
                                </div>
                                <div className="col-md-4">
                                    <div>
                                        <img src='../images/team/kathryn.png' alt="Kathryn Knapman, Customer Experience Manager"/>
                                    </div>
                                    <h3>Kathryn Knapman</h3>
                                    <h4>PA to CEO and Office Manager</h4>
                                </div>
                            </div>
                        </article>
                    </section>

                    <section>
                        <h2 id="contact">Contact Us</h2>
                        <article className="row">
                            <div className="col-md-6">
                                <h3>Our Address</h3>
                                <address>
                                    <strong>AG Grid Ltd.</strong><br/>
                                    Bank Chambers<br/>
                                    6 Borough High Street<br/>
                                    London<br/>
                                    SE1 9QQ<br/>
                                    United Kingdom
                                </address>
                                <p>Email Enquiries: <a href="mailto:info@ag-grid.com">info@ag-grid.com</a></p>
                            </div>
                            <div className="col-md-6">
                                <h3>Want to work with us?</h3>
                                <p> We are always looking for Javascript Developers with Enterprise Applications
                                    experience. </p>
                                <p>Check the <a href="/ag-grid-jobs-board/">jobs board</a>.</p>
                            </div>
                        </article>
                    </section>
                </div>
            </div>
        </>
    )
}

export default AboutPage;
