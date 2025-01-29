import type { Library } from '@ag-grid-types';
import { component } from '@astrojs/markdoc/config';
import type { Render } from '@astrojs/markdoc/config';
import type { Config, Schema } from '@markdoc/markdoc';

export const getChangelogSection = (site: Library): Schema<Config, Render> => {
    return {
        render: component('../../external/ag-website-shared/src/components/changelog/ChangelogSection.astro'),
        attributes: {
            site: { type: String, default: site },
            version: { type: String, required: true },

            // Add heading to the side nav
            __heading: {
                type: Object,
                default: {
                    level: 2,
                    id: 'changes-list',
                    text: 'Changes List',
                },
            },
        },
    };
};
