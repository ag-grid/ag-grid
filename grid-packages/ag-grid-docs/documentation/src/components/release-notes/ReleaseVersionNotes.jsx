import React from 'react';
import ReactMarkdown from 'react-markdown';
import Collapsible from './Collapsible';
import styles from './ReleaseVersionNotes.module.scss';

const ReleaseVersionNotes = ({ title, releaseNotes, markdownContent }) => {
    return (
        <Collapsible title={'Release Notes ' + title}>
            {!!markdownContent ? (
                <div className={styles.markdown}>
                    <ReactMarkdown>{markdownContent}</ReactMarkdown>
                </div>
            ) : releaseNotes ? (
                <div dangerouslySetInnerHTML={{ __html: releaseNotes }}></div>
            ) : null}
        </Collapsible>
    );
};

export default ReleaseVersionNotes;
