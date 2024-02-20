import React from 'react';
import styles from '@design-system/modules/GridDocs.module.scss';
import classnames from 'classnames';
import SEO from '../../../components/SEO';

const CommunityPage = () => {
    return (
        <div id="doc-page-wrapper" className={styles['doc-page-wrapper']}>
            <div id="doc-content" className={classnames('doc-content', styles['doc-page'])}>
                <SEO title="Community" description="Explore the AG Grid community" />
                <header className={styles.docsPageHeader}>
                    <h1 id="top" className={styles.docsPageTitle}>
                        <div className={styles.pageTitleContainer}>
                            <div className={styles.pageTitleGroup}>
                                <span>Friends and Partners</span>
                            </div>
                        </div>
                    </h1>
                </header>
                <span>A list of AG Grid community champions</span>
                <div className={styles.pageSections} style={{ marginTop: '25px' }}>
                    <p>
                        We were not sure what to call this page, but we wanted to put something up to thank and showcase
                        people that have been involved in sharing their knowledge and experience of using AG Grid,
                        people we&#39;ve collaborated and bounced ideas around with.
                    </p>
                    <p>
                        We were tempted to categorise everything into bloggers, trainers, consultants etc. but people
                        wear too many hats so we went for &quot;People&quot; and &quot;Companies and Projects&quot;.
                    </p>
                    <p>
                        This list is a work in progress. We wanted to get it out there even if it isn&#39;t complete
                        yet.
                    </p>
                    <p>
                        If you are building on, or helping people with, AG Grid; or if know someone who is, then let us
                        know and we might be able to include a mention on the page.
                    </p>
                    <p>
                        <strong>A big thank you to everyone who has worked with us and helped us.</strong>
                    </p>
                    <h2 id="people">People</h2>
                    <ul>
                        <li>
                            <a href="https://twitter.com/aaronfrost">Aaron Frost</a> co-hosts{' '}
                            <a href="https://www.spreaker.com/show/angular-show">The Angular Show</a>, helps organize
                            JavaScript conferences like <a href="https://www.2021.ng-conf.org/">NG Conf</a> and is CEO
                            and co-founder of <a href="https://herodevs.com/">HeroDevs</a>.{' '}
                        </li>
                        <li>
                            <a href="https://twitter.com/bonnster75">Bonnie Brennon</a> founder of the{' '}
                            <a href="https://www.angularnation.net/">Angular Nation</a> community, a free private
                            network where Angular developers can network and collaborate
                        </li>
                        <li>
                            <a href="https://brianflove.com/">Brian Love</a> created the free Thinkster course{' '}
                            <a href="https://thinkster.io/tutorials/fundamentals-of-ag-grid-with-angular">
                                Fundamentals of AG Grid with Angular
                            </a>{' '}
                            and co-hosts <a href="https://www.spreaker.com/show/angular-show">The Angular Show</a>.
                            Brian also provides training and consultancy through{' '}
                            <a href="https://liveloveapp.com">LiveLoveApp</a>.
                        </li>
                        <li>
                            <a href="https://twitter.com/josepheames">Joe Eames</a> organizer of conferences like{' '}
                            <a href="https://www.ng-conf.org/">NG Conf</a> and Reliable Web Summit. Joe is also involved
                            in many other developer focussed initiatives.
                        </li>
                        <li>
                            <a href="https://johnpapa.net/">John Papa</a> consults and hosts the{' '}
                            <a href="https://webrush.io/">WebRush podcast</a> where he and guests share experience
                            solving concrete problems when building real Web applications.
                        </li>
                        <li>
                            <a href="https://twitter.com/maxkoretskyi">Max Koretskyi</a> helps promote AG Grid through
                            blogs, speaking and code examples and now builds the community at{' '}
                            <a href="https://indepth.dev/">indepth.dev</a>
                        </li>
                        <li>
                            <a href="https://twitter.com/samjulien">Sam Julien</a> helps developers improve their skills
                            and become better developer relations professionals. Sam also created the course{' '}
                            <a href="https://thinkster.io/tutorials/using-ag-grid-with-react-getting-started">
                                Using AG Grid with React
                            </a>
                        </li>
                        <li>
                            <a href="https://github.com/TheLarkInn">Sean Larkin</a> helped create{' '}
                            <a href="https://webpack.js.org/">WebPack</a>.
                        </li>
                    </ul>
                    <h2 id="companies-and-projects">Companies and Projects</h2>
                    <ul>
                        <li>
                            <a href="https://adaptabletools.com/">Adaptable Tools</a> build a set of libraries and
                            components that add extra user focussed functionality to AG Grid. To see what the product is
                            capable of you can view{' '}
                            <a href="https://www.adaptabletools.com/demos">functional demos on line</a>, all of these
                            demos show AdapTable augmenting AG Grid.
                        </li>
                        <li>
                            <a href="https://cube.dev/">Cube.dev</a> create an analytics api that helps combine multiple
                            applications and components to help build Data and Business Intelligence apps. They maintain
                            a list of <a href="https://awesome.cube.dev/">Awesome Data Vizualisation Tools here</a>
                        </li>
                        <li>
                            <a href="https://www.lab49.com/">Lab 49</a> build enterprise applications for finance
                            companies with AG Grid featuring in many of their projects.
                        </li>
                        <li>
                            <a href="https://liveloveapp.com">LiveLoveApp</a> are a team of software architects
                            providing technology leadership and{' '}
                            <a href="https://liveloveapp.com/courses/ag-grid/">expert-led training on AG Grid</a> to
                            startups and Fortune 100 companies. Their performance analysis and architecture reviews help
                            improve product development in web technologies including Angular, NgRx, Node.js, React and
                            AG Grid.
                        </li>
                        <li>
                            <a href="https://www.openfin.co/">OpenFin</a> helps financial companies configure an
                            integrated desktop of apps and components (including AdapTable and AG Grid). Developers can
                            write for the web and release to a content store as native apps in a secure and performant
                            container.
                        </li>
                        <li>
                            <a href="https://plnkr.co/">Plunker</a> lets you edit, develop and host your code online for
                            free. We use Plunker extensively for our{' '}
                            <a href="https://www.ag-grid.com/javascript-grid/">documentation examples</a> and during
                            support to create working examples for customers. We are{' '}
                            <a href="https://blog.ag-grid.com/plunker-backed-by-ag-grid/">
                                happy to help sponsor the ongoing development
                            </a>{' '}
                            of Plunker.
                        </li>
                        <li>
                            <a href="https://thinkster.io">Thinkster.io</a> host free and paid training courses relevant
                            to JavaScript developers. Including the free courses on AG Grid:{' '}
                            <a href="https://thinkster.io/tutorials/fundamentals-of-ag-grid-with-angular">
                                Fundamentals of AG Grid with Angular
                            </a>{' '}
                            and{' '}
                            <a href="https://thinkster.io/tutorials/using-ag-grid-with-react-getting-started">
                                Using AG Grid with React
                            </a>
                        </li>
                        <li>
                            <a href="https://webpack.js.org/">WebPack.js.org</a> helps you bundle all your code and
                            dependencies into a smaller set of static assets. We use WebPack and{' '}
                            <a href="https://medium.com/webpack/ag-grid-partners-with-webpack-24f8cf9d890b">
                                sponsor the development of the project
                            </a>
                            .
                        </li>
                    </ul>
                    <h2 id="training-and-workshops">Training and Workshops</h2>
                    <ul>
                        <li>
                            <a href="https://liveloveapp.com/workshops/ag-grid">Expert Led AG Grid Workshops</a> from
                            LiveLoveApp.com - hands on training and workshops covering AG Grid.
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CommunityPage;
