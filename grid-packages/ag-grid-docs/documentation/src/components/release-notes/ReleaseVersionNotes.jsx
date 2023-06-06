import React from 'react';
import ReactMarkdown from 'react-markdown';
import Collapsible from './Collapsible';

const ReleaseVersionNotes = ({ releaseNotes, markdownContent }) => {
    return releaseNotes ?
        markdownContent ? (
            <Collapsible title="Release Notes">
                <ReactMarkdown>{markdownContent}</ReactMarkdown>
            </Collapsible>
        ) :
            (
        <Collapsible title="Release Notes">
            <div dangerouslySetInnerHTML={{ __html: releaseNotes }}></div>
        </Collapsible>
    ) : null;
};

export default ReleaseVersionNotes;
