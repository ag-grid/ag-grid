import { Markdoc, type Render } from '@astrojs/markdoc/config';
import type { Config, Schema } from '@markdoc/markdoc';

export const kbd: Schema<Config, Render> = {
    render: 'kbd',
    attributes: {
        primary: { type: String },
    },
    transform(node) {
        return new Markdoc.Tag(this.render as string, {}, [node.attributes.primary]);
    },
};
