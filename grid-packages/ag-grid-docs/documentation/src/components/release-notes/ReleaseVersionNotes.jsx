import React from 'react';
import ReactMarkdown from 'react-markdown';
import Collapsible from './Collapsible';
import styles from './ReleaseVersionNotes.module.scss';

const ReleaseVersionNotes = ({releaseNotes, markdownContent, versions, fixVersion, onChange}) => {
    return (
        <Collapsible title={`Release Notes`} versions={versions} fixVersion={fixVersion} onChange={onChange}>
            {!!markdownContent ? (
                <div className={styles.markdown}>
                    <ReactMarkdown>{markdownContent}</ReactMarkdown>
                </div>
            ) : releaseNotes ? (
                <div dangerouslySetInnerHTML={{__html: releaseNotes}}></div>
            ) : null}
        </Collapsible>
    );
};

export default ReleaseVersionNotes;
