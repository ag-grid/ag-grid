import React from 'react';
import { markdownToHtml } from '../utils/markdown-processor';
import { Alert } from './alert/Alert';

const Note = ({ children }) => {
    return (
        <Alert type="info" className="font-size-responsive">
            <div dangerouslySetInnerHTML={{ __html: markdownToHtml(children.toString()) }}></div>
        </Alert>
    );
};

export default Note;
