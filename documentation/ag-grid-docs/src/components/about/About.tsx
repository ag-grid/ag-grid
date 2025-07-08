import { Icon } from '@ag-website-shared/components/icon/Icon';
import { CustomerLogos } from '@components/customer-logos/CustomerLogos';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';

import styles from './About.module.scss';
import LifeAtAgGridCarousel from './LifeAtAgGridCarousel';

export const About = () => {
    return (
        <div className={styles.aboutPage}>
            <div className="layout-max-width-small">
                <section className={styles.introSection}>
                    <h2>
                        Open source heart, <br /> enterprise muscle.
                    </h2>
                    <p>
                        Built by developers for developers, AG Grid was born out of frustration with the performance
                        limitations of existing solutions. Our grid and charts products are now trusted by developers
                        worldwide when building their applications.
                    </p>
                </section>

                <img src={urlWithBaseUrl(`images/about/about-us.png`)} className={styles.aboutHeaderImage} />

                <section className={styles.customerLogos}>
                    <CustomerLogos />
                </section>

                <section className={styles.memoriumSection}>
                    <div className={styles.content}>
                        <img src={urlWithBaseUrl(`images/about/niall.png`)} className={styles.aboutHeaderImage} />
                        <div>
                            {' '}
                            <h2>In memory of our amazing founder Niall Crosby</h2>
                            <p>
                                AG Grid's success has a lot to do with Niall's ingenunity, craft and commitment to
                                building
                            </p>
                            <a
                                className="button-tertiary"
                                href="https://github.com/ag-grid/ag-grid-demos/tree/main/finance"
                            >
                                <span>Read Niall's story</span>
                                <Icon name="chevronRight" />
                            </a>
                        </div>
                    </div>
                </section>

                <section className={styles.historySection}>
                    <div className={styles.historyContent}>
                        <h2>The history</h2>
                        <p>A datagrid was born out of a gap in the market, enter AG Grid</p>
                    </div>
                    <div className={styles.timeline}>
                        <div className={styles.timelineItem}>
                            <div className={styles.timelineYear}>2015</div>
                            <div className={styles.timelineIcon}>
                                <Icon name="github" />
                            </div>
                            <div className={styles.timelineContent}>
                                <div className={styles.timelineTitle}>Niall fixes his own problem</div>
                                <div className={styles.timelineDesc}>Finds a need for a data grid in the market</div>
                            </div>
                            <div className={styles.timelineLine}></div>
                        </div>
                        <div className={styles.timelineItem}>
                            <div className={styles.timelineYear}>2016</div>
                            <div className={styles.timelineIcon}>
                                <Icon name="github" />
                            </div>
                            <div className={styles.timelineContent}>
                                <div className={styles.timelineTitle}>AG Grid's first customer</div>
                                <div className={styles.timelineDesc}>
                                    Finds product market fit and a product is born
                                </div>
                            </div>
                            <div className={styles.timelineLine}></div>
                        </div>
                        <div className={styles.timelineItem}>
                            <div className={styles.timelineYear}>2023</div>
                            <div className={styles.timelineIcon}>
                                <Icon name="github" />
                            </div>
                            <div className={styles.timelineContent}>
                                <div className={styles.timelineTitle}>AG Charts was born</div>
                                <div className={styles.timelineDesc}>Our suite of products expands to charting</div>
                            </div>
                            <div className={styles.timelineLine}></div>
                        </div>
                        <div className={styles.timelineItem}>
                            <div className={`${styles.timelineYear} ${styles.timelineNow}`}>Now</div>
                            <div className={styles.timelineIcon}>
                                <Icon name="github" />
                            </div>
                            <div className={styles.timelineContent}>
                                <div className={styles.timelineTitle}>What's next</div>
                                <div className={styles.timelineDesc}>
                                    We're always on the look out for the next exciting product, stay tuned
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className={styles.principlesSection}>
                    <div className={styles.principlesContent}>
                        <h2>Our principles</h2>
                        <p>The values that define the world's best data grid</p>
                    </div>
                    <div className={styles.principlesList}>
                        <div className={styles.principleItem}>
                            <div className={styles.principleIcon}>
                                <Icon name="github" />
                            </div>
                            <div className={styles.principleText}>
                                <div className={styles.principleTitle}>Excellence and innovation</div>
                                <div className={styles.principleDesc}>
                                    from within and building market leading products
                                </div>
                            </div>
                        </div>
                        <div className={styles.principleItem}>
                            <div className={styles.principleIcon}>
                                <Icon name="github" />
                            </div>
                            <div className={styles.principleText}>
                                <div className={styles.principleTitle}>We're customer obsessed</div>
                                <div className={styles.principleDesc}>
                                    and passionate about our users, building the best solutions for our early users
                                </div>
                            </div>
                        </div>
                        <div className={styles.principleItem}>
                            <div className={styles.principleIcon}>
                                <Icon name="github" />
                            </div>
                            <div className={styles.principleText}>
                                <div className={styles.principleTitle}>We're growing</div>
                                <div className={styles.principleDesc}>
                                    and eager to build our team with the best developers, marketers and product builders
                                    alike
                                </div>
                            </div>
                        </div>
                        <div className={styles.principleItem}>
                            <div className={styles.principleIcon}>
                                <Icon name="github" />
                            </div>
                            <div className={styles.principleText}>
                                <div className={styles.principleTitle}>Expand our global footprint</div>
                                <div className={styles.principleDesc}>
                                    in team and reach the world's leading developers and teams
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className={styles.leadershipSection}>
                    <div className={styles.leadershipContent}>
                        <h2>Leadership</h2>
                        <p>Decades of experience, that you can count on</p>
                    </div>
                    <div className={styles.leadershipList}>
                        <div className={styles.leaderItem}>
                            <img
                                src={urlWithBaseUrl('images/about/1.png')}
                                className={styles.leaderPhoto}
                                alt="John Matterson"
                            />
                            <div className={styles.leaderText}>
                                <div className={styles.leaderName}>John Matterson</div>
                                <div className={styles.leaderTitle}>CEO</div>
                                <div className={styles.leaderDesc}>
                                    John brings a wealth of experience in technology leadership. He is passionate about
                                    building high-performing teams and delivering innovative solutions.
                                </div>
                            </div>
                        </div>
                        <div className={styles.leaderItem}>
                            <img
                                src={urlWithBaseUrl('images/about/2.png')}
                                className={styles.leaderPhoto}
                                alt="Rob Clarke"
                            />
                            <div className={styles.leaderText}>
                                <div className={styles.leaderName}>Rob Clarke</div>
                                <div className={styles.leaderTitle}>CTO</div>
                                <div className={styles.leaderDesc}>
                                    Rob oversees all technical aspects of the company. He is dedicated to driving
                                    innovation and ensuring technical excellence across the organization.
                                </div>
                            </div>
                        </div>
                        <div className={styles.leaderItem}>
                            <img
                                src={urlWithBaseUrl('images/about/3.png')}
                                className={styles.leaderPhoto}
                                alt="Rob Grubb"
                            />
                            <div className={styles.leaderText}>
                                <div className={styles.leaderName}>Rob Grubb</div>
                                <div className={styles.leaderTitle}>CFO</div>
                                <div className={styles.leaderDesc}>
                                    Rob manages the financial actions of the company. He brings strategic insight and a
                                    strong focus on sustainable growth.
                                </div>
                            </div>
                        </div>
                        <div className={styles.leaderItem}>
                            <img
                                src={urlWithBaseUrl('images/about/4.png')}
                                className={styles.leaderPhoto}
                                alt="Jon Williams"
                            />
                            <div className={styles.leaderText}>
                                <div className={styles.leaderName}>Jon Williams</div>
                                <div className={styles.leaderTitle}>VP Sales</div>
                                <div className={styles.leaderDesc}>
                                    Jon leads the sales team with a customer-first approach. He is committed to building
                                    lasting relationships and driving business success.
                                </div>
                            </div>
                        </div>
                        <div className={styles.leaderItem}>
                            <img
                                src={urlWithBaseUrl('images/about/5.png')}
                                className={styles.leaderPhoto}
                                alt="Kiril Matev"
                            />
                            <div className={styles.leaderText}>
                                <div className={styles.leaderName}>Kiril Matev</div>
                                <div className={styles.leaderTitle}>VP TPA</div>
                                <div className={styles.leaderDesc}>
                                    Kiril is responsible for third-party alliances. He excels at forging partnerships
                                    and expanding the company's reach.
                                </div>
                            </div>
                        </div>
                        <div className={styles.leaderItem}>
                            <img
                                src={urlWithBaseUrl('images/about/6.png')}
                                className={styles.leaderPhoto}
                                alt="Jason Osmond"
                            />
                            <div className={styles.leaderText}>
                                <div className={styles.leaderName}>Jason Osmond</div>
                                <div className={styles.leaderTitle}>Chair of the Board</div>
                                <div className={styles.leaderDesc}>
                                    Jason provides strategic guidance and oversight. His leadership ensures the company
                                    remains focused on its mission and values.
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <LifeAtAgGridCarousel />

            <div className="layout-max-width-small">
                <section className={styles.resourcesSection}>
                    <div className={styles.resourcesContent}>
                        <h2>Resources</h2>
                        <p>How to find us, common resources</p>
                    </div>
                    <div className={styles.resourcesList}>
                        <div className={styles.resourceItem}>
                            <div className={styles.resourceIcon}>
                                <Icon name="lightBulb" />
                            </div>
                            <div className={styles.resourceText}>
                                <div className={styles.resourceTitle}>Blog</div>
                                <div className={styles.resourceDesc}>Some content goes here</div>
                            </div>
                        </div>
                        <div className={styles.resourceItem}>
                            <div className={styles.resourceIcon}>
                                <Icon name="lightBulb" />
                            </div>
                            <div className={styles.resourceText}>
                                <div className={styles.resourceTitle}>Press Kit</div>
                                <div className={styles.resourceDesc}>Some content goes here</div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className={styles.contactSection}>
                    <div className={styles.contactContent}>
                        <h2>Get in touch</h2>
                        <p>We are here to help with licenses, developer support and any other queries.</p>
                    </div>
                    <div className={styles.contactOffice}>
                        <strong>Our office</strong>
                        <br />
                        Bank Chambers
                        <br />
                        6 Borough High Street
                        <br />
                        London
                        <br />
                        SE1 9QQ
                    </div>
                    <div className={styles.contactEmail}>
                        Contact us over email
                        <br />
                        <span className={styles.contactEmailDesc}>
                            We can be also reached at <a href="mailto:info@ag-grid.com">info@ag-grid.com</a>
                        </span>
                    </div>
                </section>
            </div>
        </div>
    );
};
