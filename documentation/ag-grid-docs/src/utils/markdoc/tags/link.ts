import { Markdoc, type Schema, nodes } from '@astrojs/markdoc/config';
import { agGridVersion } from '@constants';
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

        const hrefWithFramework = urlWithPrefix({ url: nodeAttributes.href, framework });
        // Replace markdoc variables, as markdoc does not parse attributes
        const href = hrefWithFramework.replace('{% $agGridVersion %}', agGridVersion);

        const attributes = {
            ...nodeAttributes,
            ...(nodeAttributes.isExternal ? { target: '_blank' } : undefined),
            href,
        };

        return new Markdoc.Tag('a', attributes, children);
    },
};
