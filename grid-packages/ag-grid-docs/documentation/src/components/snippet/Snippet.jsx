import React from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import { transform } from './snippetTransformer';

export const Snippet = props => {
    const snippetToTransform = props.children.toString();

    // snippets with spaces need to be prefixed with '|' as markdown doesn't allow spaces
    const formattedSnippet = snippetToTransform.replace(/^\|/gm, '').trim();

    // create FW specific snippet
    const snippet = transform(formattedSnippet, props.framework, extractOptions(props));

    return <pre className="language-js">
               <code dangerouslySetInnerHTML={{__html: highlightSnippet(snippet, props.framework)}}/>
           </pre>;
};

const highlightSnippet = (code, framework) => {
    const [grammar, language] = {
        react: [Prism.languages.jsx, 'jsx'],
        javascript: [Prism.languages.js, 'js'],
        angular: [Prism.languages.typescript, 'typescript'],
        vue: [Prism.languages.typescript, 'typescript'],
    }[framework];

    return Prism.highlight(code, grammar, language);
}

const extractOptions = props => {
    const asBoolean = prop => ['true', '{true}', ''].includes(prop && prop.toLowerCase());
    return {
        suppressFrameworkContext: asBoolean(props['suppressframeworkcontext']),
        spaceBetweenProperties: asBoolean(props['spacebetweenproperties']),
    };
}
