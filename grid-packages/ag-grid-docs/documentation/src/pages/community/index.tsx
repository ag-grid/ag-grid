import React from 'react';
import styles from '@design-system/modules/GridDocs.module.scss';
import classnames from 'classnames';
import SEO from '../components/SEO';

const CommunityPage = () => {
    return (
        <div id="doc-page-wrapper" className={styles['doc-page-wrapper']}>
            <div id="doc-content" className={classnames("doc-content", styles['doc-page'])}>
                <SEO title="Community" description="Explore the AG Grid community" />
                <header className={styles.docsPageHeader}>
                    <h1 id="top" className={styles.docsPageTitle}>
                        <div className={styles.pageTitleContainer}>
                            <div className={styles.pageTitleGroup}>
                                <span>Welcome to the AG Grid Community!</span>
                            </div>
                        </div>
                    </h1>
                </header>
                <span>
                    AG Grid is used and trusted by a community of 100,000s of JavaScript developers 
                </span>
                <div>
                    <h2>Whats New at AG Grid</h2>
                    <span>Highlight of content from news & updates page</span>
                </div>
                <div>
                    <h2>Community Showcase</h2>
                    <span>Favourites from showcase</span>
                </div>
                <div>
                    <h2>3rd Party Tools & Extensions</h2>
                    <span>Favourites from tools & extensions</span>
                </div>
                <div>
                    <h2>Champions Corner</h2>
                    <span>Spotlight whomever is the best/biggest contributor</span>
                </div>
                {/* <div className={styles.pageSections} style={{ marginTop: '25px' }}>
                    <h2>Whats Happening at AG Grid?</h2>
                    <ul>                        
                        <li><a href="https://blog.ag-grid.com/ag-grid-a-look-back-on-2023/">[BLOG] Whats new in AG Grid v31</a></li>
                        <li><a href="https://blog.ag-grid.com/introducing-ag-charts-enterprise/">[BLOG] Introducing AG Charts Enterprise</a></li>
                        <li><a href="https://www.youtube.com/watch?v=qR608qHWTCA">[VIDEO] React: Patterns for Performance</a></li>                     
                        <li><a href="https://www.youtube.com/watch?v=69d3QIDVKDc">[VIDEO] React: To Sync or Not to Sync?</a></li>
                        <li><a href="https://www.youtube.com/watch?v=ELRCT7ooNCU">[VIDEO] Angular: Typing the not so secret to customisation ngTemplateOutlet</a></li>
                    </ul>
                </div>
                <div className={styles.pageSections} style={{ marginTop: '25px' }}>
                    <h2>Community Spotlight</h2>
                    <span>AG Grid have a vibrant community of developers... open source... contribute to be featured here..</span>
                    <h3 style={{ marginTop: '25px' }}>Champion Corner:</h3>
                    <span></span>
                    <ul>
                        <li>Joe Myler</li>
                        <li>Bio...</li>
                        <li>Socials  & content</li>
                    </ul>
                    <h3 style={{ marginTop: '25px' }}>Community Content:</h3>
                    <ul>                                   
                        <li><a href="https://ably.com/blog/how-to-enhance-ag-grid-with-avatars-building-a-collaborative-grid-with-react-and-ably">[BLOG] Enhancing AG Grid with Avatars</a></li>
                        <li><a href="https://javascript.plainenglish.io/the-best-javascript-grid-in-the-world-4b5b5551fa12">[BLOG] The Best JavaScript Grid in the World</a></li>
                        <li><a href="https://www.youtube.com/watch?v=XqH7gXY0Rb8&t=650s">[VIDEO] How to use ag grid in angular</a></li>
                        <li><a href="https://www.youtube.com/watch?v=QfOR5IwndiE">[VIDEO] Test AG Grid Table Using Cypress And Cypress-Map Plugin</a></li>
                    </ul>
                    <span><i><a>Submit your content</a> for the chance to be featured here...</i></span>
                </div>
                <div className={styles.pageSections} style={{ marginTop: '25px' }}>
                    <h2>Support Channels</h2>
                    <span>
                        Looking for support? Head to one of our support channels to seek assistance from the AG Grid
                        community, or for enterprise customers, reach out to us directly at Zendesk
                    </span>
                    <ul style={{ marginTop: '25px' }}>
                        <li><a href="https://stackoverflow.com/questions/tagged/ag-grid+or+ag-charts">StackOverflow</a></li>
                        <li><a href="https://ag-grid.zendesk.com/hc/en-us">ZenDesk</a></li>
                        <li><a href="https://github.com/ag-grid">GitHub</a></li>
                    </ul>
                </div>
                <div className={styles.pageSections} style={{ marginTop: '25px' }}>
                    <h2>Staying up to Date</h2>
                    <span>
                        Want to stay up to date with the latest news from AG Grid? Follow us on one (or all) of our
                        platforms, where we share regular updates and news:
                    </span>
                    <ul style={{ marginTop: '25px' }}>
                        <li><a href="">X (Twitter)</a></li>
                        <li><a href="">LinkedIn</a></li>
                        <li><a href="">YouTube</a></li>
                        <li><a href="">Newsletter</a></li>
                    </ul>
                </div> */}
            </div>
        </div>
    );
};

export default CommunityPage;
