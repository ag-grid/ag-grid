import React from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import { transform } from './snippetTransformer';

export const Snippet = props => {
    const snippetToTransform = props.children.toString();

    // snippets with spaces need to be prefixed with '|' as markdown doesn't allow spaces
    const formattedSnippet = snippetToTransform.replace(/\|/g, '').trim();

    // create FW specific snippet
    const snippet = transform(formattedSnippet, props.framework, extractOptions(props));

    return <pre className="language-ts">
               <code dangerouslySetInnerHTML={{__html: highlightSnippet(snippet)}}/>
           </pre>;
};

const highlightSnippet = (code) => {
    // NOTE: typescript seems to work best for all frameworks???
    const [grammar, language] = [Prism.languages.typescript, 'typescript'];
    return Prism.highlight(code, grammar, language);
}

const extractOptions = props => {
    const asBoolean = prop => ['true', '{true}', ''].includes(prop && prop.toLowerCase());
    return {
        suppressFrameworkContext: asBoolean(props['suppressframeworkcontext']),
        addSpaceBetweenProperties: asBoolean(props['spacebetweenproperties']),
    };
}

