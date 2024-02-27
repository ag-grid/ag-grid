import Markdoc, { type Config, type Node, type Schema } from '@markdoc/markdoc';
import { getContentRootFileUrl } from '@utils/pages';
import fs from 'fs';
import path from 'path';

function getFilePath(file: string) {
    const contentRoot = getContentRootFileUrl();
    return path.join(contentRoot.pathname, 'docs', file);
}

export const includeMarkdoc: Schema = {
    inline: false,
    selfClosing: true,
    attributes: {
        file: { type: String, render: false, required: true },
        variables: { type: Object, render: false },
    },
    transform(node: Node, config: Config) {
        const { file, variables } = node.attributes;
        const markdocFilePath = getFilePath(file);
        const fileExists = fs.existsSync(markdocFilePath);

        if (!fileExists) {
            throw new Error(`Markdoc file \`${file}\` not found. The 'file' must be in \`${markdocFilePath}\``);
        }

        const contents = fs.readFileSync(markdocFilePath).toString();
        const markdocAst = Markdoc.parse(contents);

        if (!markdocAst) return null;

        const scopedConfig = {
            ...config,
            variables: {
                ...config.variables,
                ...variables,
                ['$$includeMarkdoc:filename']: file,
            },
        };

        const transformChildren = (part: Node) => part.resolve(scopedConfig).transformChildren(scopedConfig);

        return Array.isArray(markdocAst) ? markdocAst.flatMap(transformChildren) : transformChildren(markdocAst);
    },
};
