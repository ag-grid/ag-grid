import React from 'react';
import ReactMarkdown from 'react-markdown';
import Collapsible from './Collapsible';

const ReleaseVersionNotes = ({ title, releaseNotes, markdownContent }) => {

    return <Collapsible title={'Release Notes ' + title}>
        {!!markdownContent ? <ReactMarkdown>{markdownContent}</ReactMarkdown> : releaseNotes ? <div dangerouslySetInnerHTML={{ __html: releaseNotes }}></div> : null}
    </Collapsible>
};

export default ReleaseVersionNotes;
