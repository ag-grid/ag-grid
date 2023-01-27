import React from 'react';
import { Alert } from '../alert/Alert';
import Collapsible from './Collapsible';

const ReleaseVersionNotes = ({ releaseNotes }) => {
    return releaseNotes ? (
        <Collapsible title="Release Notes">
            <Alert type="info">
                <div dangerouslySetInnerHTML={{ __html: releaseNotes }}></div>
            </Alert>
        </Collapsible>
    ) : null;
};

export default ReleaseVersionNotes;
