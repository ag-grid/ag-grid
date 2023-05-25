import React from 'react';
import { markdownToHtml } from '../utils/markdown-processor';
import { Alert } from './alert/Alert';

const Warning = ({ children, title }) => {
    return (
        <div className="font-size-responsive">
            <Alert type="warning">
                <div>
                    {title && <h4>{title}</h4>}
                    <div dangerouslySetInnerHTML={{ __html: markdownToHtml(children.toString()) }}></div>
                </div>
            </Alert>
        </div>
    );
};

export default Warning;
