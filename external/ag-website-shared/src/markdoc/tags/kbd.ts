import { Markdoc } from '@astrojs/markdoc/config';
import type { Render } from '@astrojs/markdoc/config';
import type { Config, Schema } from '@markdoc/markdoc';

// Labels that read differently on a Mac keyboard. Grid, Charts and Studio all treat
// `ctrlKey` and `metaKey` as interchangeable for their keyboard shortcuts (see e.g.
// navigationService.ts, keyBindings.ts), so swapping the displayed label for Mac
// users doesn't change what the shortcut does.
const MAC_LABEL: Record<string, string> = {
    '^ Ctrl': '⌘ Command',
};

export const kbd: Schema<Config, Render> = {
    render: 'kbd',
    attributes: {
        primary: { type: String },
    },
    transform(node) {
        const label = node.attributes.primary as string;
        const macLabel = MAC_LABEL[label];

        if (!macLabel) {
            return new Markdoc.Tag(this.render as string, {}, [label]);
        }

        // Both labels are rendered at build time; which one is visible is decided
        // client-side (see KBD_PLATFORM_INIT_SCRIPT) since the page's static HTML
        // has no way to know the visitor's OS.
        return new Markdoc.Tag(this.render as string, {}, [
            new Markdoc.Tag('span', { class: 'kbd-default' }, [label]),
            new Markdoc.Tag('span', { class: 'kbd-mac' }, [macLabel]),
        ]);
    },
};
