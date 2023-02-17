import React from 'react';
import DocumentationLink from './DocumentationLink';
import communitySvg from 'images/community.svg';
import enterpriseSvg from 'images/enterprise.svg';
import { Announcement } from './Announcement';
import styles from './Announcements.module.scss';

/**
 * These are the announcement cards shown underneath the left-hand navigation menu.
 */
const Announcements = ({ framework }) => <div className={styles['announcements']}>


    <Announcement date="Feb 17" version="29.1.0">
        <p className="card-text">
            <a href="https://blog.ag-grid.com/whats-new-in-ag-grid-29-1/">What's new in AG Grid 29.1.0</a><br/><br/>
            Minor release with new features and bug fixes.
        </p>
        <ul>
            <li className={styles['announcement__list-item']}>
                <a href="https://ag-grid.com/javascript-data-grid/grouping-column-filter/">Row Group Column Filter</a>
            </li>
            <li className={styles['announcement__list-item']}>
                <a href="https://ag-grid.com/javascript-charts/axes/#axis-ticks">Axis Ticks Enhancements</a>
            </li>
        </ul>
    </Announcement>

    <Announcement date="Jan 13" version="29.0.0">
        <p className="card-text">
            <a href="https://blog.ag-grid.com/whats-new-in-ag-grid-29/">What's new in AG Grid 29.0.0</a><br/><br/>
            Major release with new features and bug fixes.
        </p>
        <ul>
            <li className={styles['announcement__list-item']}>
                <a href="https://ag-grid.com/javascript-data-grid/filter-set-tree-list/">Set Filter List</a>
            </li>
            <li className={styles['announcement__list-item']}>
                <a href="https://ag-grid.com/javascript-data-grid/server-side-model-updating-transactions/">SSRM Transactions</a>
            </li>
            <li className={styles['announcement__list-item']}>
                <a href="https://ag-grid.com/javascript-charts/legend/">Legend Enhancements</a>
            </li>

            <li className={styles['announcement__list-item']}>
                <a href="https://ag-grid.com/javascript-charts/treemap-series/">Treemap Enhancements</a>
            </li>
        </ul>
    </Announcement>

    <SimpleMailingListSignup />

    <Announcement title="Community or Enterprise?">
        <img style={{ width: '30px', height: '33px', float: 'left', marginRight: '6px' }} src={communitySvg} alt="Community" />
        <p >
            Everyone can use AG Grid Community for free.
            It's MIT licensed and Open Source. No restrictions. No strings attached.
        </p>
        <img style={{ width: '30px', height: '33px', float: 'left', marginRight: '6px' }} src={enterpriseSvg} alt="Enterprise" />
        <p>
            Do you want more features? Then <DocumentationLink framework={framework} href="/licensing/">get started with AG Grid Enterprise</DocumentationLink>.
            You don't need to contact us to evaluate AG Grid Enterprise. A license is only required
            when you start developing for production.
        </p>
    </Announcement>

    {/*<Announcement highlight={false}>*/}
    {/*    <p>Work at AG Grid:</p>*/}
    {/*    <h5 className="card-title"><a href="/ag-grid-jobs-board/">JavaScript Developers</a></h5>*/}
    {/*    <h6 className="card-subtitle mb-2 text-muted">London, United Kingdom</h6>*/}
    {/*    <p className="card-text">*/}
    {/*        Would you like to join the AG Grid team in London?<br /><br />*/}
    {/*        Check the <a href="/ag-grid-jobs-board/">jobs board</a>*/}
    {/*    </p>*/}
    {/*</Announcement>*/}

</div>;


/**
 * A simpler MailChimp sign up form - no extra JS dependencies. Note form was not a direct copy and paste from mailchimp, amended due to jsx templating
 */
 const SimpleMailingListSignup = () => {
    return <>
        <link href="//cdn-images.mailchimp.com/embedcode/slim-10_7.css" rel="stylesheet" type="text/css"/>
        <div id="mc_embed_signup" style={{background:'#fff', clear:'left', font:'14px Helvetica,Arial,sans-serif'}}>
        <form 
            action="https://ag-grid.us11.list-manage.com/subscribe/post?u=9b44b788c97fa5b498fbbc9b5&amp;id=9353cf87ce" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" className="validate" target="_blank" validate="true">
            <div id="mc_embed_signup_scroll">
                <label htmlFor="mce-EMAIL">Join AG Grid Mailing List</label>
                <input style={{width: '100%'}} type="email" defaultValue="" name="EMAIL" className="email" id="mce-EMAIL" placeholder="email address" required/>
                <div style={{position: 'absolute', left: '-5000px'}} aria-hidden="true">
                    <input type="text" name="b_9b44b788c97fa5b498fbbc9b5_9353cf87ce" tabIndex="-1" defaultValue=""/>                
                </div>
                <div className="clear">
                    <input type="submit" value="Subscribe" name="subscribe" id="mc-embedded-subscribe" className="button"/>
                </div>
            </div>
        </form>
        </div>
    </>;
};

export default Announcements;
