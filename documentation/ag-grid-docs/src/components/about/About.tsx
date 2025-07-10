import { Icon } from '@ag-website-shared/components/icon/Icon';
import { CustomerLogos } from '@components/customer-logos/CustomerLogos';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';

import styles from './About.module.scss';
import LifeAtAgGridCarousel from './LifeAtAgGridCarousel';
import AdoptionIcon from './svgs/adoption.svg?react';
import BarChart from './svgs/bar-chart.svg?react';
import BornIcon from './svgs/born.svg?react';
import CeoIcon from './svgs/ceo.svg?react';
import ChartIcon from './svgs/chart.svg?react';
import ConferenceIcon from './svgs/conference.svg?react';
import DonutAcceleratingIcon from './svgs/donut-accelerating.svg?react';
import LicenseIcon from './svgs/license.svg?react';
import Question from './svgs/question.svg?react';
import RocketIcon from './svgs/rocket.svg?react';

export const About = () => {
    return (
        <div className={styles.aboutPage}>
            <div className="layout-max-width-small">
                <section className={styles.introSection}>
                    <h2>
                        Open source heart, <br /> <span>enterprise muscle.</span>
                    </h2>
                    <p>
                        Our community versions remain true to our roots, offering free, open-source grids and charts
                        delivering world-class performance. Our enterprise products deliver powerful features and direct
                        developer technical support.
                    </p>
                </section>

                <div>
                    <img
                        src={urlWithBaseUrl(`images/about/about-us.png`)}
                        className={`${styles.aboutHeaderImage} ${styles.aboutHeaderImageLight}`}
                    />
                    <img
                        src={urlWithBaseUrl(`images/about/dark-mode-about.png`)}
                        className={`${styles.aboutHeaderImage} ${styles.aboutHeaderImageDark}`}
                    />
                </div>
                <section className={styles.customerLogos}>
                    <CustomerLogos />
                    <p className={styles.footnote}>
                        <span>Built by developers for developers</span>, AG Grid was born out of frustration with the
                        performance limitations of existing solutions. Our grid and charts products are now trusted by
                        developers worldwide when building their applications.
                    </p>
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
                        <h2>Our history</h2>
                        <p>
                            Born from a gap in the market, now providing world-class data-grids and charts to millions
                            of users.
                        </p>
                    </div>
                    <div className={styles.timeline}>
                        <div className={styles.timelineLine}></div>
                        <div className={styles.timelineItem}>
                            <div className={styles.timelineYear}>2016</div>
                            <div className={styles.timelineIcon}>
                                <BornIcon />
                            </div>
                            <div className={styles.timelineContent}>
                                <div className={styles.timelineTitle}>AG Grid is born</div>
                                <div className={styles.timelineDesc}>
                                    <a href="">Niall Crosby</a> creates AG Grid as an open-source data grid solution to
                                    address a gap in the market
                                </div>
                            </div>
                        </div>
                        <div className={styles.timelineItem}>
                            <div className={styles.timelineYear}>2017</div>
                            <div className={styles.timelineIcon}>
                                <RocketIcon />
                            </div>
                            <div className={styles.timelineContent}>
                                <div className={styles.timelineTitle}>Commercial launch</div>
                                <div className={styles.timelineDesc}>
                                    <a href="">AG Grid Enterprise</a> is launched to widespread adoption within the
                                    developer community.
                                </div>
                            </div>
                        </div>
                        <div className={styles.timelineItem}>
                            <div className={styles.timelineYear}>2018</div>
                            <div className={styles.timelineIcon}>
                                <ConferenceIcon />
                            </div>
                            <div className={styles.timelineContent}>
                                <div className={styles.timelineTitle}>AG Grid Conf</div>
                                <div className={styles.timelineDesc}>
                                    Dedicated AG Grid conferences delivered in London & New York, engaging us with our
                                    growing developer community.
                                </div>
                            </div>
                        </div>
                        <div className={styles.timelineItem}>
                            <div className={styles.timelineYear}>2019</div>
                            <div className={styles.timelineIcon}>
                                <BarChart />
                            </div>
                            <div className={styles.timelineContent}>
                                <div className={styles.timelineTitle}>Integrated Charting</div>
                                <div className={styles.timelineDesc}>
                                    <a href="ic-docs-page-link">Integrated Charts</a> is launched within AG Grid. The
                                    first JS data-grid to contain built-in charting.
                                </div>
                            </div>
                        </div>
                        <div className={styles.timelineItem}>
                            <div className={styles.timelineYear}>2020</div>
                            <div className={styles.timelineIcon}>
                                <ChartIcon />
                            </div>
                            <div className={styles.timelineContent}>
                                <div className={styles.timelineTitle}>AG Charts</div>
                                <div className={styles.timelineDesc}>
                                    <a href="https://charts.ag-grid.com">AG Charts</a> is released as a standalone
                                    library with both community and enterprise versions.
                                </div>
                            </div>
                        </div>
                        <div className={styles.timelineItem}>
                            <div className={styles.timelineYear}>2021</div>
                            <div className={styles.timelineIcon}>
                                <LicenseIcon />
                            </div>
                            <div className={styles.timelineContent}>
                                <div className={styles.timelineTitle}>Self-service licensing</div>
                                <div className={styles.timelineDesc}>
                                    <a href="e-com-link">eCommerce platform</a> is launched to allow customers to
                                    self-service.
                                </div>
                            </div>
                        </div>
                        <div className={styles.timelineItem}>
                            <div className={styles.timelineYear}>2022</div>
                            <div className={styles.timelineIcon}>
                                <AdoptionIcon />
                            </div>
                            <div className={styles.timelineContent}>
                                <div className={styles.timelineTitle}>Mass adoption</div>
                                <div className={styles.timelineDesc}>
                                    <a href="npm-grid-link">AG Grid Community</a> breaks one million downloads per month
                                    on NPM.
                                </div>
                            </div>
                        </div>
                        <div className={styles.timelineItem}>
                            <div className={styles.timelineYear}>2023</div>
                            <div className={styles.timelineIcon}>
                                <DonutAcceleratingIcon />
                            </div>
                            <div className={styles.timelineContent}>
                                <div className={styles.timelineTitle}>Accelerating Charts</div>
                                <div className={styles.timelineDesc}>
                                    <a href="npm-charts-link">AG Charts Community</a> hits 500k downloads per month
                                    across all frameworks.
                                </div>
                            </div>
                        </div>
                        <div className={styles.timelineItem}>
                            <div className={styles.timelineYear}>2024</div>
                            <div className={styles.timelineIcon}>
                                <ConferenceIcon />
                            </div>
                            <div className={styles.timelineContent}>
                                <div className={styles.timelineTitle}>Leadership updates</div>
                                <div className={styles.timelineDesc}>
                                    <a href="leadership-section-anchor-link">John Masterson</a> appointed CEO, a new
                                    board is formed.
                                </div>
                            </div>
                        </div>
                        <div className={styles.timelineItem}>
                            <div className={`${styles.timelineYear} ${styles.timelineNow}`}>Now</div>
                            <div className={styles.timelineIcon}>
                                <RocketIcon />
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
                                <RocketIcon />
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
                                <ConferenceIcon />
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
                                <BarChart />
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
                                <DonutAcceleratingIcon />
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
                                    Experienced financial professional, qualifying as a chartered accountant with Big
                                    Four in 2005 and focusing solely on software businesses since. Extensive experience
                                    leading strategic, financial, and commercial initiatives and teams at managerial,
                                    executive, and PLC Board levels. Holds a current practicing certificate with the
                                    Institute of Chartered Accountants of Scotland.
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
                                    Jon is an experienced commercial leader having spent the past 25 years in the
                                    software industry across a range of companies from very small start-ups to large
                                    global organisations. Recent roles include Boxever, a Dublin based SaaS
                                    personalisation engine platform where he developed the go-to-market strategy that
                                    ultimately led to the company being acquired by Sitecore, a large player in the CMS
                                    market. At Sitecore Jon then led the integration of the Boxever business as well as
                                    ran the global new name SaaS business unit. Prior to Boxever Jon was the Senior Vice
                                    President at Aprimo, a US based SaaS marketing platform, where he ran all of their
                                    non-US operations.
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
                                    Jason is a seasoned technology executive with over 25 years of experience driving
                                    growth, scaling operations, and building high-performing, commercially focused
                                    organisations. He brings a strong track record of value creation through strategic
                                    leadership, operational discipline, and a focus on sustainable, recurring revenue
                                    models. As Chairman, Jason works closely with AG Grid’s leadership team to support
                                    long-term growth and market expansion.
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
