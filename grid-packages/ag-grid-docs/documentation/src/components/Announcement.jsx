import React from 'react';
import styles from './Announcements.module.scss';

export const Announcement = ({ title, children }) => {
    return (
        <div className={styles.announcement}>
            {title && <h4>{title}</h4>}

            {children}
        </div>
    );
};
