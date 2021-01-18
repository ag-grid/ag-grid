import React from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import { parseScript } from 'esprima';
import { transform } from './snippetTransformer';

export const Snippet = props => {
    const snippetToTransform = props.children.toString();

    // snippets with spaces need to be prefixed with '|' as markdown doesn't allow spaces
    const formattedSnippet = snippetToTransform.replace(/\|/g, '').trim();

    // create syntax tree from supplied snippet
    const tree = parseScript(formattedSnippet, {comment: true, loc: true});

    // associate comments with properties
    const treeWithComments = addCommentsToTree(tree);

    // create FW specific snippet
    const snippet = transform(props.framework, treeWithComments);

    return <CodeSnippet code={snippet}/>;
};

const addCommentsToTree = tree => {
    const isVarDeclaration = node => node.type === 'VariableDeclaration' && Array.isArray(node.declarations);

    // store comments with locations for easy lookup
    const commentsMap = tree.comments.reduce((acc, comment) => {
        acc[comment.loc.start.line] = comment.value;
        return acc;
    }, {});

    // decorate nodes with comments
    const parseTree = node => {
        if (Array.isArray(node)) {
            node.forEach(n => parseTree(n));
        } else if (isVarDeclaration(node)) {
            node.declarations.forEach(n => parseTree(n));
        } else {
            node.comment = commentsMap[node.loc.start.line - 1];
        }
    }

    // simpler and faster to start here
    const root = tree.body[0].declarations[0].init.properties;

    parseTree(root);

    return root;
}

const CodeSnippet = ({code}) =>
    <pre className="language-ts">
        <code dangerouslySetInnerHTML={{__html: Prism.highlight(code, Prism.languages.typescript, 'typescript')}}/>
    </pre>;
