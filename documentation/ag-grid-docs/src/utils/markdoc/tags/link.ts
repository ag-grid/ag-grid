import { Markdoc, nodes } from '@astrojs/markdoc/config';
import { agGridVersion } from '@constants';
import type { Schema } from '@markdoc/markdoc';
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
        const { framework } = config.variables ?? {};
        const children = node.transformChildren(config);
        const nodeAttributes = node.transformAttributes(config);
        const hasCodeChild = node.children.some((child: { type: string }) => child.type === 'code');

        // Links authored as './page' follow the visitor's framework; ones that name a framework in
        // the path keep their destination. Mark the former so `FrameworkLinks` can retarget them.
        const followsFramework = config.variables?.markFrameworkLinks && nodeAttributes.href?.startsWith('./');

        const hrefWithFramework = urlWithPrefix({ url: nodeAttributes.href, framework });
        // Replace markdoc variables, as markdoc does not parse attributes
        const href = hrefWithFramework.replace('{% $agGridVersion %}', agGridVersion);

        const attributes = {
            ...nodeAttributes,
            ...(nodeAttributes.isExternal ? { target: '_blank' } : undefined),
            href,
            ...(followsFramework ? { 'data-framework-link': 'true' } : undefined),
            ...(hasCodeChild ? { class: 'meta-link' } : undefined),
        };

        return new Markdoc.Tag('a', attributes, children);
    },
};
