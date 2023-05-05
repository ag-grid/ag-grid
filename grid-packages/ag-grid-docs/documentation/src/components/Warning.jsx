import React from 'react';
import {markdownToHtml} from "../utils/markdown-processor";

const Warning = ({ children, title }) => {
    return <div className="custom-block note warning" >
        {title && <div className="custom-block-heading">{title}</div>}
        <div className="custom-block-body" dangerouslySetInnerHTML={{__html: markdownToHtml(children.toString())}}></div>
    </div>
};

export default Warning;
