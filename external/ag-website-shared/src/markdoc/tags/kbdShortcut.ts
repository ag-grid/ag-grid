import { Markdoc } from '@astrojs/markdoc/config';
import type { Render } from '@astrojs/markdoc/config';
import type { Config, Schema } from '@markdoc/markdoc';

// Turns a "+"-separated combo (e.g. "^ Ctrl+Y") into a run of <kbd> elements
// joined by literal "+" text, matching how individual {% kbd %} tags read.
function buildKeys(combo: string): (string | InstanceType<typeof Markdoc.Tag>)[] {
    const keys = combo.split('+');
    const children: (string | InstanceType<typeof Markdoc.Tag>)[] = [];
    for (let i = 0, len = keys.length; i < len; ++i) {
        if (i > 0) {
            children.push('+');
        }
        children.push(new Markdoc.Tag('kbd', {}, [keys[i].trim()]));
    }
    return children;
}

export const kbdShortcut: Schema<Config, Render> = {
    render: 'span',
    attributes: {
        default: { type: String, required: true },
        mac: { type: String, required: true },
    },
    transform(node) {
        const defaultCombo = node.attributes.default as string;
        const macCombo = node.attributes.mac as string;

        return new Markdoc.Tag(this.render as string, { class: 'kbd-shortcut' }, [
            new Markdoc.Tag('span', { class: 'kbd-shortcut-default' }, buildKeys(defaultCombo)),
            new Markdoc.Tag('span', { class: 'kbd-shortcut-mac' }, buildKeys(macCombo)),
        ]);
    },
};
