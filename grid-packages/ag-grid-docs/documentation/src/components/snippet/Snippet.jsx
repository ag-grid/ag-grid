import React from 'react';
import Prism from 'prismjs';
import * as esprima from 'esprima';
import * as transformer from './SnippetTransformer';

export const Snippet = props => {
    const suppliedSnippet = props.children[0].toString();

    // snippets that require spaces will need to be prefixed with '|' as markdown doesn't allow spaces
    const formattedSnippet = suppliedSnippet.replace(/\|/g, '').trim();

    // create syntax tree from supplied snippet
    const tree = esprima.parseScript(formattedSnippet, {comment: true, loc: true});

    // convert syntax tree into a more convenient form, i.e. [{ propertyName: propertyAstObj }]
    const propertyMappings = parse(tree);

    // create FW specific snippet
    const snippet =
        props.framework === 'angular' ? transformer.createNgSnippet(propertyMappings) :
            props.framework === 'react' ? transformer.createReactSnippet(propertyMappings) :
                props.framework === 'vue' ? transformer.createVueSnippet(propertyMappings) :
                    transformer.createJsSnippet(propertyMappings);

    return <CodeSnippet code={snippet}/>;
};

const parse = tree => {
    const isVarDeclaration = node => node.type === 'VariableDeclaration' && Array.isArray(node.declarations);

    // store comments with locations for easy lookup
    const commentsMap = tree.comments.reduce((acc, comment) => {
        acc[comment.loc.start.line] = comment.value;
        return acc;
    }, {});

    const parse = (acc, node) => {
        if (Array.isArray(node)) {
            node.forEach(n => parse(acc, n));
        } else if (isVarDeclaration(node)) {
            node.declarations.forEach(n => parse(acc, n));
        } else {
            const commentAbove = commentsMap[node.loc.start.line - 1];
            acc.push({name: node.key.name, comment: commentAbove, ...node.value});
        }
    }

    // simpler and faster to start here
    const root = tree.body[0].declarations[0].init.properties;

    // using array to preserve supplied order
    const propertyMappings = [];

    parse(propertyMappings, root);

    return propertyMappings;
}

const CodeSnippet = ({code}) => <pre className="language-ts">
    <code dangerouslySetInnerHTML={{__html: Prism.highlight(code, Prism.languages.typescript, 'typescript')}}/>
</pre>;
