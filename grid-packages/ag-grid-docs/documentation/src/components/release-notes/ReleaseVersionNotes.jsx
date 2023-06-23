import React from 'react';
import ReactMarkdown from 'react-markdown';
import Collapsible from './Collapsible';
import styles from './ReleaseVersionNotes.module.scss';

const ReleaseVersionNotes = ({ releaseNotes, markdownContent, versions, fixVersion, onChange }) => {
    return (
        <Collapsible title={`Release Notes`} versions={versions} fixVersion={fixVersion} onChange={onChange} hideExpander={!markdownContent && !releaseNotes}>
            {!!markdownContent ? (
                <div className={styles.markdown}>
                    <ReactMarkdown>{markdownContent}</ReactMarkdown>
                </div>
            ) : releaseNotes ? (
                <div dangerouslySetInnerHTML={{ __html: releaseNotes }}></div>
            ) : (
                <div className='text-secondary'>No release notes available for AG Grid v{fixVersion}</div>
            )}
        </Collapsible>
    );
};

export default ReleaseVersionNotes;
