import React from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import { transform } from './snippetTransformer';

export const Snippet = props => {
    const snippetToTransform = props.children.toString();

    // snippets with spaces need to be prefixed with '|' as markdown doesn't allow spaces
    const formattedSnippet = snippetToTransform.replace(/\|/g, '').trim();

    // create FW specific snippet
    const snippet = transform(formattedSnippet, props.framework);

    return <CodeSnippet code={snippet}/>;
};

const CodeSnippet = ({code}) =>
    <pre className="language-ts">
        <code dangerouslySetInnerHTML={{__html: Prism.highlight(code, Prism.languages.typescript, 'typescript')}}/>
    </pre>;
