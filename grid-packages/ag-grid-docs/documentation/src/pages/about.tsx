import classnames from 'classnames';
import React from 'react';
import styles from './about.module.scss';
import SEO from './components/SEO';

const AboutPage = () => {
    return (
        <>
            <SEO
                title="Our Mission, Our Principles and Our Team at AG Grid"
                description="AG Grid is a feature-rich datagrid available in Community or Enterprise versions. This is the story of AG Grid and explains our mission, where we came from and who we are."
            />
            <div className={classnames(styles.aboutPage, 'ag-styles')}>
                <div className="page-margin">
                    <section>
                        <h1>About AG Grid</h1>
                    </section>

                    <section>
                        <h2>Our Mission</h2>

                        <article>
                            <p>
                                At AG Grid, our mission is simple: <strong>Build the best datagrid in the world</strong>
                                .
                            </p>
                            <p>
                                Born out of frustration with existing solutions, <strong>AG Grid</strong> evolved from a
                                side project to becoming the leading JavaScript datagrid on the market. We are a company
                                built by developers for developers, and - true to our roots - we offer{' '}
                                <strong>AG Grid Community</strong>: a free and open-source project that delivers world
                                class grid performance. <strong>AG Grid Enterprise</strong> is our commercially-licensed
                                offering which has enjoyed widespread adoption and facilitates us to keep delivering on
                                our mission.
                            </p>
                            <p>
                                Our story is proof that necessity is the mother of invention. During his time working in
                                London-based financial institutions, <strong>Niall Crosby</strong> - founder and CEO -
                                struggled to find any datagrid component that could deliver the performance required in
                                tandem with a complete feature list. This struggle ultimately led Niall to pulling out
                                the keyboard one Christmas holiday period and starting <strong>AG Grid</strong> as a
                                side project. This was then released as open source and quickly developed a following.
                            </p>
                            <p>
                                Niall found himself having to devote considerable time and effort to maintaining
                                <strong> AG Grid</strong>, even fielding feature requests from users. It became apparent
                                that this thing had legs - and the idea of <strong>AG Grid Enterprise</strong> took seed
                                in Niall’s mind. A little over one year after the project started the first commercial
                                version was launched.
                            </p>
                            <p>
                                Today, <strong>AG Grid</strong> is a self-funded, bootstrapped company with thousands of
                                customers globally. Our product has resonated in the market - as our users face the same
                                challenges Niall did - and this has been central to our rapid growth. And we’re not
                                stopping here: we are working on the next great features to continue our mission.
                            </p>
                        </article>
                    </section>

                    <section>
                        <h2>Our Principles</h2>

                        <article>
                            <p>
                                We believe that a datagrid should be agnostic to the framework that developers choose.
                                This allows flexibility and future-proofs your development. This is also where the 'ag'
                                in <strong>AG Grid </strong>
                                comes from.
                            </p>
                            <p>
                                Our experience is in building Enterprise applications: we know that the datagrid is at
                                the core of an Enterprise application, and needs to deliver performance and a rich
                                feature set.
                            </p>
                            <p>
                                We give away what others charge for. <strong>AG Grid Community</strong> provides all of
                                the features of our competition. We only charge when we go above and beyond, with
                                features that other grids don’t provide.
                            </p>
                        </article>
                    </section>

                    <section>
                        <h2>The Dev Team</h2>

                        <article className={styles.team}>
                            <div>
                                <img src="../images/team/niall.jpg" alt="Niall Crosby, Founder / CEO / CTO" />
                                <h3>Niall Crosby</h3>
                                <p>CEO / CTO</p>
                            </div>
                            <div>
                                <img src="../images/team/rob.jpg" alt="Rob Clarke, VP of Engineering" />
                                <h3>Rob Clarke</h3>
                                <p>VP of Engineering</p>
                            </div>
                            <div>
                                <img src="../images/team/sean.jpg" alt="Sean Landsman, Lead Developer" />
                                <h3>Sean Landsman</h3>
                                <p>Lead Developer, Frameworks</p>
                            </div>
                            <div>
                                <img src="../images/team/gil.jpg" alt="Guilherme Lopes, Lead Developer" />
                                <h3>Guilherme Lopes</h3>
                                <p>Lead Developer, UI</p>
                            </div>
                            <div>
                                <img src="../images/team/stephen.jpeg" alt="Stephen Cooper, Developer" />
                                <h3>Stephen Cooper</h3>
                                <p>Developer, Grid Core</p>
                            </div>
                            <div>
                                <img src="../images/team/andy.jpeg" alt="Andrew Glazier, Developer" />
                                <h3>Andrew Glazier</h3>
                                <p>Developer, Grid Core</p>
                            </div>
                            <div>
                                <img src="../images/team/tak.png" alt="Tak Tran, Developer" />
                                <h3>Tak Tran</h3>
                                <p>Developer, Grid Core</p>
                            </div>
                            <div>
                                <img src="../images/team/peter.jpg" alt="Peter Reynolds, Developer" />
                                <h3>Peter Reynolds</h3>
                                <p>Developer, Grid Core</p>
                            </div>
                            <div>
                                <img src="../images/team/alanT.jpg" alt="Alan Treadway, Developer" />
                                <h3>Alan Treadway</h3>
                                <p>Lead Developer, Data Visualisation</p>
                            </div>
                            <div>
                                <img src="../images/team/mana.jpeg" alt="Mana Peirov, Developer" />
                                <h3>Mana Peirov</h3>
                                <p>Developer, Data Visualisation</p>
                            </div>
                            <div>
                                <img src="../images/team/alex.png" alt="Alex (Sasha) Shutau, Developer" />
                                <h3>Alex (Sasha) Shutau</h3>
                                <p>Developer, Data Visualisation</p>
                            </div>
                            <div>
                                <img src="../images/team/sergei.jpg" alt="Sergei Riazanov, Developer" />
                                <h3>Sergei Riazanov</h3>
                                <p>Developer, Data Visualisation</p>
                            </div>
                            <div>
                                <img
                                    src="../images/team/alberto.jpg"
                                    alt="Alberto Gutierrez, Head of Customer Services"
                                />
                                <h3>Alberto Gutierrez</h3>
                                <p>Head of Customer Services</p>
                            </div>
                            <div>
                                <img src="../images/team/kiril.png" alt="Kiril Matev, Technical Product Manager" />
                                <h3>Kiril Matev</h3>
                                <p>Technical Product Manager</p>
                            </div>
                            <div>
                                <img src="../images/team/david.jpg" alt="David Glickman, Technical Product Analyst" />
                                <h3>David Glickman</h3>
                                <p>Technical Product Analyst</p>
                            </div>
                            <div>
                                <img src="../images/team/viqas.jpg" alt="Viqas Hussain, Lead Developer" />
                                <h3>Viqas Hussain</h3>
                                <p>Lead Developer, E-commerce</p>
                            </div>
                            <div>
                                <img src="../images/team/mark.jpg" alt="Mark Durrant, Lead UX Designer" />
                                <h3>Mark Durrant</h3>
                                <p>Lead UX Designer</p>
                            </div>
                        </article>
                    </section>

                    <section>
                        <h2>The Operations Team</h2>

                        <article className={styles.team}>
                            <div>
                                <img src="../images/team/dimo.jpg" alt="Dimo Iliev, Managing Director" />
                                <h3>Dimo Iliev</h3>
                                <p>Managing Director</p>
                            </div>
                            <div>
                                <img src="../images/team/simon.jpg" alt="Simon Kenny, Customer Experience Manager" />
                                <h3>Simon Kenny</h3>
                                <p>Sales Director</p>
                            </div>
                            <div>
                                <img src="../images/team/nathan.jpeg" alt="Nathan Gauge-Klein, General Counsel" />
                                <h3>Nathan Gauge-Klein</h3>
                                <p>General Counsel</p>
                            </div>
                            <div>
                                <img
                                    src="../images/team/victoria.jpeg"
                                    alt="Victoria Tennant, Business Development Manager"
                                />
                                <h3>Victoria Tennant</h3>
                                <p>Renewals Team Manager</p>
                            </div>
                            <div>
                                <img src="../images/team/dimple.jpg" alt="Dimple Unalkat, Customer Experience Team" />
                                <h3>Dimple Unalkat</h3>
                                <p>Initials Team Manager</p>
                            </div>
                            <div>
                                <img
                                    src="../images/team/sachshell.png"
                                    alt="Sachshell Rhoden, Customer Experience Manager"
                                />
                                <h3>Sachshell Rhoden</h3>
                                <p>Sales Operations Manager</p>
                            </div>
                            <div>
                                <img
                                    src="../images/team/alison.jpeg"
                                    alt="Alison Bunworth, Business Development Manager"
                                />
                                <h3>Alison Bunworth</h3>
                                <p>Business Development Manager</p>
                            </div>
                            <div>
                                <img src="../images/team/robD.jpg" alt="Rob Dunkiert, Customer Experience Manager" />
                                <h3>Rob Dunkiert</h3>
                                <p>Customer Experience Manager</p>
                            </div>
                            <div>
                                <img
                                    src="../images/team/seweety.jpeg"
                                    alt="Seweety Kumar, Customer Experience Manager"
                                />
                                <h3>Seweety Kumar</h3>
                                <p>Customer Experience Manager</p>
                            </div>
                            <div>
                                <img src="../images/team/laiyan.jpeg" alt="Laiyan Woo, Customer Experience Manager" />
                                <h3>Laiyan Woo</h3>
                                <p>Customer Experience Manager</p>
                            </div>
                            <div>
                                <img src="../images/team/amir.jpeg" alt="Amir Hussain, Customer Experience Manager" />
                                <h3>Amir Hussain</h3>
                                <p>Customer Experience Manager</p>
                            </div>
                            <div>
                                <img
                                    src="../images/team/jordan.jpeg"
                                    alt="Jordan Shekoni, Customer Experience Manager"
                                />
                                <h3>Jordan Shekoni</h3>
                                <p>Customer Experience Manager</p>
                            </div>
                            <div>
                                <img src="../images/team/tobi.jpg" alt="Tobi Aguda, Customer Experience Manager" />
                                <h3>Tobi Aguda</h3>
                                <p>Customer Experience Manager</p>
                            </div>
                            <div>
                                <img
                                    src="../images/team/kathryn.png"
                                    alt="Kathryn Knapman, Customer Experience Manager"
                                />
                                <h3>Kathryn Knapman</h3>
                                <p>PA to CEO and Office Manager</p>
                            </div>
                        </article>
                    </section>

                    <section>
                        <h2>Contact Us</h2>

                        <article className={styles.footer}>
                            <div>
                                <h3>Our Address</h3>
                                <address>
                                    <strong>AG Grid Ltd.</strong>
                                    <br />
                                    Bank Chambers
                                    <br />
                                    6 Borough High Street
                                    <br />
                                    London
                                    <br />
                                    SE1 9QQ
                                    <br />
                                    United Kingdom
                                </address>
                                <p>
                                    Email Enquiries: <a href="mailto:info@ag-grid.com">info@ag-grid.com</a>
                                </p>
                            </div>

                            <div>
                                <h3>Want to work with us?</h3>
                                <p>
                                    {' '}
                                    We are always looking for Javascript Developers with Enterprise Applications
                                    experience.{' '}
                                </p>
                                <p>
                                    Check the <a href="/ag-grid-jobs-board/">jobs board</a>.
                                </p>
                            </div>
                        </article>
                    </section>
                </div>
            </div>
        </>
    );
};

export default AboutPage;
