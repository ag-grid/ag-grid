import React from 'react';
import {Announcement} from './Announcement';
import { hostPrefix } from '../utils/consts';
import styles from './Announcements.module.scss';
import versionStyles from './Version.module.scss';
import DocumentationLink from './DocumentationLink';
import Version from './Version';
import {Icon} from "./Icon";

/**
 * These are the announcement cards shown underneath the left-hand navigation menu.
 */
const Announcements = ({framework}) => (
    <>
        <div className={styles.versions}>
            <Version
                version="30.2.0"
                date="Sep 26"
                highlights={[
                    {
                        text: 'Advanced Filter Builder',
                        url: 'https://www.ag-grid.com/javascript-data-grid/filter-advanced/#advanced-filter-builder',
                    },
                    {
                        text: 'Dynamic Group Footers',
                        url: 'https://www.ag-grid.com/javascript-data-grid/grouping-footers/#dynamic-group-footers',
                    },
                ]}
            ></Version>
        </div>

        <SimpleMailingListSignup/>

        <Announcement title="Community or Enterprise?">
            <p className="font-size-small">
                Everyone can use AG Grid Community for free. It's MIT licensed and Open Source. No restrictions. No
                strings attached.
            </p>

            <p className="font-size-small">
                Do you want more features? {''}
                <DocumentationLink framework={framework} href="/licensing/">
                    Get started with AG Grid Enterprise
                </DocumentationLink>
                . You don't need to contact us to evaluate AG Grid Enterprise. A license is only required when you start
                developing for production.
            </p>
        </Announcement>
    </>
);

/**
 * A simpler MailChimp sign up form - no extra JS dependencies. Note form was not a direct copy and paste from mailchimp, amended due to jsx templating
 */
const SimpleMailingListSignup = () => {
    return (
        <>
            <div id="mc_embed_signup" className={styles.newsletterSignup}>
                <form
                    action="https://ag-grid.us11.list-manage.com/subscribe/post?u=9b44b788c97fa5b498fbbc9b5&amp;id=9353cf87ce"
                    method="post"
                    id="mc-embedded-subscribe-form"
                    name="mc-embedded-subscribe-form"
                    className="validate"
                    target="_blank"
                    validate="true"
                >
                    <div id="mc_embed_signup_scroll">
                        <label htmlFor="mce-EMAIL">Join the AG Grid Mailing List</label>
                        <input
                            type="email"
                            defaultValue=""
                            name="EMAIL"
                            className="email"
                            id="mce-EMAIL"
                            placeholder="email address"
                            required
                        />
                        <div style={{position: 'absolute', left: '-5000px'}} aria-hidden="true">
                            <input
                                type="text"
                                name="b_9b44b788c97fa5b498fbbc9b5_9353cf87ce"
                                tabIndex="-1"
                                defaultValue=""
                            />
                        </div>

                        <div className="clear">
                            <input
                                type="submit"
                                value="Subscribe"
                                name="subscribe"
                                id="mc-embedded-subscribe"
                                className="button"
                            />
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
};

export default Announcements;
