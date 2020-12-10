import React from 'react';
import styles from './Announcements.module.scss';
import thinksterPng from '../images/thinkster.png';
import communitySvg from '../images/community.svg';
import enterpriseSvg from '../images/enterprise.svg';
import flags from '../images/flags';

const Announcements = () => <div className={styles['announcements']}>
    <Announcement date="Oct 12" version="24.1.0">
        <p className="card-text">Minor release with bug fixes.</p>
    </Announcement>
    <Announcement date="Sep 9" version="24.0.0">
        <p className="card-text">
            Major release with new features and bug fixes:
        </p>
        <ul>
            <li className={styles['announcement__list-item']}>
                <a href="../filter-multi/">Multi Filter</a>
            </li>
            <li className={styles['announcement__list-item']}>
                <a href="../column-updating-definitions/">Reactive Columns</a>
            </li>
            <li className={styles['announcement__list-item']}>
                <a href="../accessibility/">Accessibility Enhancements</a>
            </li>
            <li className={styles['announcement__list-item']}>
                <a href="../charts-themes/">Chart Themes</a>
            </li>
        </ul>
    </Announcement>
    <Announcement>
        <h5 className="card-title">
            <a href="https://thinkster.io/topics/ag-grid" aria-label="Thinkster"><img alt="Thinkster" style={{ width: '100%' }} src={thinksterPng} /></a>
        </h5>
        <p className="card-text">
            There are free <a href="https://thinkster.io/topics/ag-grid">Thinkster Courses</a> for learning
            ag-Grid with Angular and React.
        </p>
    </Announcement>
    <Announcement title="Best Web Grids for 2020" date="Jan 27th">
        <p className="card-text">
            ag-Grid is the "Absolute Winner" according
            to <a href="https://www.crankuptheamps.com//blog/posts/2020/01/23/grid-comparison-2/">Best Web Grids for 2020</a>.
        </p>
    </Announcement>
    <Announcement title="Community or Enterprise?">
        <img style={{ width: '30px', float: 'left', marginRight: '6px' }} src={communitySvg} alt="Community" />
        <p >
            Everyone can use ag-Grid Community for free.
            It's MIT licensed and Open Source. No restrictions. No strings attached.
        </p>
        <img style={{ width: '30px', float: 'left', marginRight: '6px' }} src={enterpriseSvg} alt="Enterprise" />
        <p>
            Do you want more features? Then <a href="../licensing/">get started with ag-Grid Enterprise</a>.
            You don't need to contact us to evaluate ag-Grid Enterprise. A license is only required
            when you start developing for production.
        </p>
    </Announcement>
    <Announcement title="Conferences 2020">
        <p>Come see us at the following conferences that we are attending and sponsoring.</p>

        <h6 className="card-subtitle mb-2 text-muted">Angular</h6>

        <img src={flags.us} alt="United States" className={styles['announcement__flag']} />
        <a href="https://www.ng-conf.org" target="_blank" rel="noreferrer">ng-Conf</a>
        <p className="card-subtitle mb-2 text-muted" style={{ marginTop: '1px' }}>Postponed</p>

        <img src={flags.no} alt="Norway" className={styles['announcement__flag']} />
        <a href="https://ngvikings.org" target="_blank" rel="noreferrer">ngVikings</a>
        <p className="card-subtitle mb-2 text-muted" style={{ marginTop: '1px' }}>Postponed</p>

        <img src={flags.gb} alt="United Kingdom" className={styles['announcement__flag']} />
        <a href="https://angularconnect.com" target="_blank" rel="noreferrer">Angular Connect</a>
        <p className="card-subtitle mb-2 text-muted" style={{ marginTop: '1px' }}>Oct 13-14</p>

        <p></p>

        <h6 className="card-subtitle mb-2 text-muted">React</h6>

        <img src={flags.nl} alt="Netherlands" className={styles['announcement__flag']} />
        <a href="https://reactsummit.com" target="_blank" rel="noreferrer">React Summit</a>
        <p className="card-subtitle mb-2 text-muted" style={{ marginTop: '1px' }}>11th September</p>

        <img src={flags.gb} alt="United Kingdom" className={styles['announcement__flag']} />
        <a href="https://reactadvanced.com" target="_blank" rel="noreferrer">React Advanced</a>
        <p className="card-subtitle mb-2 text-muted" style={{ marginTop: '1px' }}>Oct 25</p>

        <p></p>

        <h6 className="card-subtitle mb-2 text-muted">JavaScript</h6>

        <img src={flags.gb} alt="United Kingdom" className={styles['announcement__flag']} />
        <a href="https://halfstackconf.com/online/" target="_blank" rel="noreferrer">Half Stack Online</a>
        <p className="card-subtitle mb-2 text-muted" style={{ marginTop: '1px' }}>May 22</p>
    </Announcement>
</div>;

const Announcement = ({ title, date, children, version }) => {
    return <div className={styles['announcement']}>
        <div className="card-body">
            {version &&
                <h5 className="card-title"><a href={`/ag-grid-changelog/?fixVersion=${version}`}>Version {version}</a></h5>
            }
            {title && <h5 className="card-title">{title}</h5>}
            {date && <h6 className="card-subtitle mb-2 text-muted">{date}</h6>}
            {children}
            {version &&
                <p className="text-right">
                    <a href={`/ag-grid-changelog/?fixVersion=${version}`}>Change Log</a>
                </p>}
        </div>
    </div>;
};

export default Announcements;
