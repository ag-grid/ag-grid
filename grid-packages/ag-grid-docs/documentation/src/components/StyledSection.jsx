import React from 'react';
import {markdownToHtml} from "../utils/markdown-processor";

const StyledSection = ({ styling, children }) => {
    return <div className={`custom-block ${styling === "warning" ? "note warning" : styling}`} dangerouslySetInnerHTML={{__html: markdownToHtml(children.toString())}}></div>
};

export default StyledSection;
