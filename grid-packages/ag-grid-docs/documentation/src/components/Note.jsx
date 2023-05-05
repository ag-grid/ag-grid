import React from 'react';
import {markdownToHtml} from "../utils/markdown-processor";

const Note = ({ children }) => {
    return <div className="custom-block note" dangerouslySetInnerHTML={{__html: markdownToHtml(children.toString())}}></div>
};

export default Note;
