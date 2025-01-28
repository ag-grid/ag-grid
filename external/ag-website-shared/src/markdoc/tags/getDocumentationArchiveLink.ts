import type { Library } from '@ag-grid-types';
import { component } from '@astrojs/markdoc/config';
import type { Render } from '@astrojs/markdoc/config';
import type { Config, Schema } from '@markdoc/markdoc';

export const getDocumentationArchiveLink = (site: Library): Schema<Config, Render> => {
    return {
        render: component(
            '../../external/ag-website-shared/src/components/documentation-archive/DocumentationArchiveLink.astro'
        ),
        attributes: {
            site: { type: String, default: site },
            version: { type: String, required: true },

            // Used for side nav titles
            _navTitle: { type: String, default: 'Documentation' },
        },
    };
};
