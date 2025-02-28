import type { Library } from '@ag-grid-types';
import { MIGRATION_DOCUMENTATION_NAV_DATA } from '@ag-website-shared/constants';
import { component } from '@astrojs/markdoc/config';
import type { Render } from '@astrojs/markdoc/config';
import type { Config, Schema } from '@markdoc/markdoc';

export const getDocumentationArchiveSection = (site: Library): Schema<Config, Render> => {
    return {
        render: component(
            '../../external/ag-website-shared/src/components/documentation-archive/DocumentationArchiveSection.astro'
        ),
        attributes: {
            site: { type: String, default: site },
            version: { type: String, required: true },

            // Add heading to the side nav
            __heading: {
                type: Object,
                default: {
                    level: 2,
                    ...MIGRATION_DOCUMENTATION_NAV_DATA,
                },
            },
        },
    };
};
