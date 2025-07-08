import { Icon } from '@ag-website-shared/components/icon/Icon';
import { CustomerLogos } from '@components/customer-logos/CustomerLogos';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';

import styles from './About.module.scss';

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
                    </article>
                </section>
            </div>
        </div>
    );
};
