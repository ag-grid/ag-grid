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

                <img src={urlWithBaseUrl(`images/about/about-us.png`)} class={styles.aboutHeaderImage} />

                <section className={styles.customerLogos}>
                    <CustomerLogos client:load />
                </section>

                <section className={styles.memoriumSection}>
                    <div className={styles.content}>
                        <img src={urlWithBaseUrl(`images/about/niall.png`)} class={styles.aboutHeaderImage} />
                        <div>
                            {' '}
                            <h2>In memory of our amazing founder Niall Crosby</h2>
                            <p>
                                AG Grid’s success has a lot to do with Niall’s ingenunity, craft and commitment to
                                building
                            </p>
                            <a
                                class="button-tertiary"
                                href="https://github.com/ag-grid/ag-grid-demos/tree/main/finance"
                            >
                                <span>Read Niall's story</span>
                                <Icon name="chevronRight" />
                            </a>
                        </div>
                    </div>
                </section>

                <section className={styles.historySection}>
                    {' '}
                    <h2>The history</h2>
                    <p>A datagrid was born out of a gap in the market, enter AG Grid</p>
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
