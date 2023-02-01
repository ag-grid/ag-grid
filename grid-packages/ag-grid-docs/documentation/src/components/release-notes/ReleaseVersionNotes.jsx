import React from 'react';
import Collapsible from './Collapsible';

const ReleaseVersionNotes = ({ releaseNotes }) => {
    return releaseNotes ? (
        <Collapsible title="Release Notes">
            <div dangerouslySetInnerHTML={{ __html: releaseNotes }}></div>
        </Collapsible>
    ) : null;
};

export default ReleaseVersionNotes;
