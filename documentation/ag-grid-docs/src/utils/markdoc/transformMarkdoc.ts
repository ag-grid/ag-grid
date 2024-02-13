import Markdoc, { type ConfigType, type Node } from '@markdoc/markdoc';
import Slugger from 'github-slugger';
import React from 'react';

import markdocConfig from '../../../markdoc.config';

interface Params {
    framework: Framework;
    markdocContent: string;
}

export function transformMarkdoc({ framework, markdocContent }: Params) {
    const ast = Markdoc.parse(markdocContent);
    const headingSlugger = new Slugger();
    const config = {
        ...markdocConfig,
        variables: {
            ...markdocConfig.variables,
            framework,
        },
        ctx: {
            headingSlugger,
        },
    };
    const renderTree = Markdoc.transform(ast as Node, config as ConfigType);

    // Strip outer document and p tag, so react will just render the
    // inline content
    const partialAst = ast.children[0]?.children[0] ?? ast;
    const partialRenderTree = Markdoc.transform(partialAst as Node, config as ConfigType);
    const MarkdocContent = () => Markdoc.renderers.react(partialRenderTree, React);

    return {
        ast,
        renderTree,
        partialAst,
        partialRenderTree,
        MarkdocContent,
    };
}
