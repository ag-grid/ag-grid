import React from 'react';
import { markdownToHtml } from '../utils/markdown-processor';
import { Alert } from './alert/Alert';

const Warning = ({ children, title }) => {
    return (
        <Alert type="warning">
            <div>
                {title && <h4>{title}</h4>}
                <div dangerouslySetInnerHTML={{ __html: markdownToHtml(children.toString()) }}></div>
            </div>
        </Alert>
    );
};

export default Warning;
