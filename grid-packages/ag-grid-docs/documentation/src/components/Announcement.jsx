import React from 'react';
import classnames from 'classnames';
import styles from './Announcements.module.scss';

export const Announcement = ({ title, date, children, version, highlight = true }) => {
    return <div className={classnames(styles['announcement'], { [styles['announcement--highlighted']]: highlight })}>
        <div className="card-body">
            {version &&
                <h5 className="card-title"><a href={`/changelog/?fixVersion=${version}`} target="_blank" rel="noreferrer">Version&nbsp;{version}</a></h5>
            }
            {title && <h5 className="card-title">{title}</h5>}
            {date && <h6 className="card-subtitle mb-2 text-muted">{date}</h6>}
            {children}
            {version &&
                <p className="text-right">
                    <a href={`/changelog/?fixVersion=${version}`} target="_blank" rel="noreferrer">Change Log</a>
                </p>}
        </div>
    </div>;
};
