import { Markdoc, type Schema, nodes } from '@astrojs/markdoc/config';
import { urlWithPrefix } from '@utils/urlWithPrefix';

export const link: Schema = {
    ...nodes.link,
    attributes: {
        ...nodes.link.attributes,
        /**
         * Open link in external tab
         */
        isExternal: { type: Boolean },
    },
    /**
     * Transform markdoc links to add url prefix and framework to href
     */
    transform(node, config) {
        const { framework } = config.variables;
        const children = node.transformChildren(config);
        const nodeAttributes = node.transformAttributes(config);
        const href = urlWithPrefix({ url: nodeAttributes.href, framework });
        const attributes = {
            ...nodeAttributes,
            href,
            target: nodeAttributes.isExternal ? '_blank' : undefined,
        };

        return new Markdoc.Tag('a', attributes, children);
    },
};
