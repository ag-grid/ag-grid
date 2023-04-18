import React from 'react';
import { transform } from './snippetTransformer';
import Code from '../Code';

const languages = {
    react: 'jsx',
    javascript: 'js',
    angular: 'ts',
    vue: 'ts',
};

/**
 * This takes a code snippet written in JavaScript and transforms it into an idiomatic code snippet for the selected
 * framework.
 */
export const Snippet = props => {
    const transformCode = props.transform === undefined ? true : props.transform === "true";
    const snippetToTransform = props.children.toString();

    // snippets with spaces need to be prefixed with '|' as markdown doesn't allow spaces
    const formattedSnippet = snippetToTransform.replace(/^\|/gm, '').trim();

    // create FW specific snippet
    const snippet = transformCode ? transform(formattedSnippet, props.framework, extractOptions(props)) : formattedSnippet;

    return <Code code={snippet} language={props.language ? props.language : languages[props.framework]} />;
};

const extractOptions = props => {
    const asBoolean = prop => ['true', '{true}', ''].includes(prop && prop.toLowerCase());

    return {
        suppressFrameworkContext: asBoolean(props['suppressframeworkcontext']),
        spaceBetweenProperties: asBoolean(props['spacebetweenproperties']),
        inlineReactProperties: asBoolean(props['inlinereactproperties']),
    };
};
