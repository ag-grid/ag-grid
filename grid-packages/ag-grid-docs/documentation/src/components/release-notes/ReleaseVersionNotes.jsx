import React from 'react';
import ReactMarkdown from 'react-markdown';
import Collapsible from './Collapsible';

const ReleaseVersionNotes = ({ releaseNotes, markdownContent }) => {

    if (!!markdownContent) {
        return <Collapsible title="Release Notes">
            <ReactMarkdown>{markdownContent}</ReactMarkdown>
        </Collapsible>
    }

    return releaseNotes ?
        (<Collapsible title="Release Notes">
            <div dangerouslySetInnerHTML={{ __html: releaseNotes }}></div>
        </Collapsible>
    ) : null;
};

export default ReleaseVersionNotes;
