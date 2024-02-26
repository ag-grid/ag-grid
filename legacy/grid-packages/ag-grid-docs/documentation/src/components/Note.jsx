import React from 'react';
import { markdownToHtml } from '../utils/markdown-processor';
import { Alert } from './alert/Alert';

// Use disableMarkdown if you need to use nested html within your note. E.g. <kbd>.
const Note = ({ children, disableMarkdown = false }) => {
    return (
        <Alert type="info">
            {!disableMarkdown && <div dangerouslySetInnerHTML={{ __html: markdownToHtml(children.toString()) }}></div>}

            {disableMarkdown && <p>{children}</p>}
        </Alert>
    );
};

export default Note;
