import classnames from 'classnames';
import { convertUrl } from 'components/documentation-helpers';
import MenuView from 'components/menu-view/MenuView';
import { SEO } from 'components/SEO';
import logos from 'images/logos';
import React from 'react';
import menuData from '../../doc-pages/licensing/menu.json';
import { Icon } from '../components/Icon';
import tileStyles from '../components/menu-view/Tile.module.scss';
import supportedFrameworks from '../utils/supported-frameworks';
import styles from './home.module.scss';

const OverviewSection = () => {
    return(
        <div className={classnames(styles.gridContainer)}>
            <div className={classnames(styles.cardGroup)}>
                <div className={classnames(styles.card)}>
                    <div className={classnames(styles.cardTitle, 'font-size-extra-large')}>
                        Introduction
                        <img className={classnames(styles.cardIcon)} src="TODO" style={{ float: 'right' }}/>
                    </div>
                    <hr className={classnames(styles.cardDivider)}/>
                    <div className={classnames(styles.cardBody)}>
                        Know you need a Grid, but not sure which ones right for you? Check-out our 
                        introduction section for an in-depth overview
                    </div>
                    <div className={classnames(styles.cardLink)}>
                        <a href='introduction/overview/'>Overview</a>
                    </div>
                </div>
                <div className={classnames(styles.card)}>
                    <div className={classnames(styles.cardTitle, 'font-size-extra-large')}>
                        Get Started
                        <img className={classnames(styles.cardIcon)} src="TODO" style={{ float: 'right' }}/>
                    </div>
                    <hr className={classnames(styles.cardDivider)}/>
                    <div className={classnames(styles.cardBody)}>
                        Want to try AG Grid for yourself? Take a look at our Getting Started guide to 
                        install, configure and customise the Grid
                    </div>
                    <div className={classnames(styles.cardLink)}>
                        <a href='get-started/installation/'>Installation</a>
                    </div>
                </div>
                <div className={classnames(styles.card)}>
                    <div className={classnames(styles.cardTitle, 'font-size-extra-large')}>
                        Quick Start
                        <img className={classnames(styles.cardIcon)} src="TODO" style={{ float: 'right' }}/>
                    </div>
                    <hr className={classnames(styles.cardDivider)}/>
                    <div className={classnames(styles.cardBody)}>
                        Already familiar with the Grid or want to see how it works? Browse our Quick Starts 
                        to kick-start your development
                    </div>
                    <div className={classnames(styles.cardLink)}>
                        <a href='quick-starts/basic-example/'>Basic Example</a>
                    </div>
                </div>
            </div>
            <div className={classnames(styles.cardGroup)}>
                <div className={classnames(styles.card)}>
                    <div className={classnames(styles.cardTitle, 'font-size-extra-large')}>
                        API Reference
                        <img className={classnames(styles.cardIcon)} src="TODO" style={{ float: 'right' }}/>
                    </div>
                    <hr className={classnames(styles.cardDivider)}/>
                    <div className={classnames(styles.cardBody)}>
                        Already familiar with the Grid or want to see how it works? Browse our Quick Starts 
                        to kick-start your development
                    </div>
                    <div className={classnames(styles.cardLink)}>
                        <a href='grid-interface/'>Grid API</a>
                    </div>
                </div>
            </div>
        </div>
    )
}

const NeedHelpSection = () => {
    return(
        <div className={classnames(styles.cardGroup)}>
            <div className={classnames(styles.card)}>
                <div className={classnames(styles.cardTitle, 'font-size-extra-large')}>
                    GitHub
                    <img className={classnames(styles.cardIcon)} src="TODO" style={{ float: 'right' }}/>
                </div>
                <hr className={classnames(styles.cardDivider)}/>
                <div className={classnames(styles.cardBody)}>
                    Browse our source-code, extend & customize the grid, or submit bug reports & feature 
                    requests through our GitHub
                </div>
                <div className={classnames(styles.cardLink)}>
                    <a href='https://github.com/ag-grid/ag-grid/issues' target='_blank'>Raise an Issue</a>
                </div>
            </div>
            <div className={classnames(styles.card)}>
                <div className={classnames(styles.cardTitle, 'font-size-extra-large')}>
                    StackOverflow
                    <img className={classnames(styles.cardIcon)} src="TODO" style={{ float: 'right' }}/>
                </div>
                <hr className={classnames(styles.cardDivider)}/>
                <div className={classnames(styles.cardBody)}>
                    Browse 1000's of questions, support the community and build your profile, or ask your own 
                    questions with the `ag-grid` tag
                </div>
                <div className={classnames(styles.cardLink)}>
                    <a href='https://stackoverflow.com/questions/tagged/ag-grid' target='_blank'>Ask a Question</a>
                </div>
            </div>
            <div className={classnames(styles.card)}>
                <div className={classnames(styles.cardTitle, 'font-size-extra-large')}>
                    ZenDesk
                    <img className={classnames(styles.cardIcon)} src="TODO" style={{ float: 'right' }}/>
                </div>
                <hr className={classnames(styles.cardDivider)}/>
                <div className={classnames(styles.cardBody)}>
                    Enterprise customers can get dedicated support and propritized feature requests by 
                    submitting tickets through ZenDesk.
                </div>
                <div className={classnames(styles.cardLink)}>
                    <a href='https://ag-grid.zendesk.com/' target='_blank'>Create a Ticket</a>
                </div>
            </div>
        </div>
    )
}

const JoinCommunitySection = () => {
    return(
        <div className={classnames(styles.gridContainer)}>
            <div className={classnames(styles.cardGroup)}>
                <div className={classnames(styles.card)}>
                    <div className={classnames(styles.cardTitle, 'font-size-extra-large')}>
                        YouTube
                        <img className={classnames(styles.cardIcon)} src="TODO" style={{ float: 'right' }}/>
                    </div>
                    <hr className={classnames(styles.cardDivider)}/>
                    <div className={classnames(styles.cardBody)}>
                        Visual learner? Browse our YouTube.
                    </div>
                    <div className={classnames(styles.cardLink)}>
                        <a href='https://youtube.com/c/ag-grid' target='_blank'>Subscribe</a>
                    </div>
                </div>
                <div className={classnames(styles.card)}>
                    <div className={classnames(styles.cardTitle, 'font-size-extra-large')}>
                        Twitter (X)
                        <img className={classnames(styles.cardIcon)} src="TODO" style={{ float: 'right' }}/>
                    </div>
                    <hr className={classnames(styles.cardDivider)}/>
                    <div className={classnames(styles.cardBody)}>
                        Join the conversation and on X (Twitter).
                    </div>
                    <div className={classnames(styles.cardLink)}>
                        <a href='https://twitter.com/ag_grid' target='_blank'>Follow Us</a>
                    </div>
                </div>
                <div className={classnames(styles.card)}>
                    <div className={classnames(styles.cardTitle, 'font-size-extra-large')}>
                        LinkedIn
                        <img className={classnames(styles.cardIcon)} src="TODO" style={{ float: 'right' }}/>
                    </div>
                    <hr className={classnames(styles.cardDivider)}/>
                    <div className={classnames(styles.cardBody)}>
                        Network with the AG Grid Professional community.
                    </div>
                    <div className={classnames(styles.cardLink)}>
                        <a href='https://www.linkedin.com/company/ag-grid/' target='_blank'>Connect</a>
                    </div>
                </div>
                <div className={classnames(styles.card)}>
                    <div className={classnames(styles.cardTitle, 'font-size-extra-large')}>
                        Blog
                        <img className={classnames(styles.cardIcon)} src="TODO" style={{ float: 'right' }}/>
                    </div>
                    <hr className={classnames(styles.cardDivider)}/>
                    <div className={classnames(styles.cardBody)}>
                        Read our Blog for the Latest News & Tutorials.
                    </div>
                    <div className={classnames(styles.cardLink)}>
                        <a href='https://blog.ag-grid.com' target='_blank'>Read</a>
                    </div>
                </div>
            </div>
            <div className={classnames(styles.cardGroup)}>
                <div className={classnames(styles.card)}>
                    <div className={classnames(styles.cardTitle, 'font-size-extra-large')}>
                        Newsletter
                        <img className={classnames(styles.cardIcon)} src="TODO" style={{ float: 'right' }}/>
                    </div>
                    <hr className={classnames(styles.cardDivider)}/>
                    <div className={classnames(styles.cardBody)}>
                        Subscribe to our AG Grid Newsletter to be notified of new product and feature releases, 
                        as well as the latest news & events.
                    </div>
                    <div className={classnames(styles.cardLink)}>
                        <a href='https://blog.ag-grid.com/newsletter/' target='_blank'>Join Mailing List</a>
                    </div>
                </div>
            </div>
    </div>
    )
}

/**
 * This is the home page for the documentation.
 */
const HomePage = ({ pageContext: { framework } }) => {
    const listOtherFrameworks = () => {        
        const frameworks = supportedFrameworks.filter((f) => f !== framework);
        return (
            <span style={{ textTransform: 'capitalize' }}>
                <a href={`../${frameworks[0]}-data-grid/`}>{frameworks[0]}</a>,{' '}
                <a href={`../${frameworks[1]}-data-grid/`}>{frameworks[1]}</a>, or{' '}
                <a href={`../${frameworks[2]}-data-grid/`}>{frameworks[2]}</a>
            </span>
        );
    };

    return (
        <div className={styles.docsHome}>

            {/*eslint-disable-next-line react/jsx-pascal-case*/}
            <SEO
                title="Documentation"
                description="Our documentation will help you to get up and running with AG Grid."
                framework={framework}
                pageName="home"
            />

            {/* Introduction  */}
            <div className={classnames(styles.section, 'font-size-responsive')}>
                <h1>AG Grid <span style={{ textTransform: 'capitalize' }}>{framework}</span> Documentation</h1>
                <p className="font-size-medium">
                    Welcome to our <span style={{ textTransform: 'capitalize' }}>{framework}</span> documentation. 
                    You can use the menu in the upper-right to switch between {listOtherFrameworks()} Docs.
                </p>
            </div>

            {/* Overview */}
            <div className={classnames(styles.section, 'font-size-responsive')}>
                <h2>Overview</h2>
                <p>
                    Browse this section to find the content you're looking for, whether that's an <a href='introduction/overview/'>Introduction</a> to our grid, trying to <a href='get-started/installation/'>Get Started</a>, or a <a href='quick-starts/basic-example'>Quick-Start</a> template, we've got you covered.
                </p>
                <OverviewSection />
            </div>

            {/* Need Help */}
            <div className={classnames(styles.section, 'font-size-responsive')}>
                <h2>Need Help?</h2>
                <p>
                    Looking to find an answer to a specific question? Leverage our community on <a href='https://github.com/ag-grid' target={'_blank'}>GitHub</a> and <a href='https://stackoverflow.com/questions/tagged/ag-grid' target={'_blank'}>StackOverflow</a>, or for Enterprise customers, please submit a ticket via <a href='https://ag-grid.zendesk.com/' target={'_blank'}>ZenDesk</a>.
                </p>
                <NeedHelpSection />
            </div>

            {/* Join Our Community */}
            <div className={classnames(styles.section, 'font-size-responsive')}>
                <h2>Join Our Community</h2>
                <p>
                    Join our community wherever you are to join the conversation and stay up to date with all the latest AG Grid news.
                </p>
                <JoinCommunitySection />
            </div>

        </div>
    );
};

export default HomePage;
