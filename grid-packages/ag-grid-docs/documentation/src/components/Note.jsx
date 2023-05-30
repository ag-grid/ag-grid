import React from 'react';
import { markdownToHtml } from '../utils/markdown-processor';
import { Alert } from './alert/Alert';

const Note = ({ children }) => {
    return (
        <div className="font-size-responsive">
            <Alert type="info">
                <div dangerouslySetInnerHTML={{ __html: markdownToHtml(children.toString()) }}></div>
            </Alert>
        </div>
    );
};

export default Note;
