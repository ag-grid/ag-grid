import React from 'react';
import { Helmet } from 'react-helmet';
import { getChartsVersionMessage, getGridVersionMessage, getHeaderTitle } from 'utils/page-header';
import isDevelopment from 'utils/is-development';

/**
 * This is used for adding SEO information to pages.
 */
export const SEO = ({ title, description, framework, pageName }) => {
    const isCharts = pageName.startsWith('charts-');
    const metaTitle = getHeaderTitle(title, framework, isCharts);
    const versionMessage = isCharts ? getChartsVersionMessage(framework) : getGridVersionMessage(framework);

    let metaDescription = versionMessage;

    if (description) {
        const targetLength = 160 - versionMessage.length - 1;

        if (description.length > targetLength) {
            if (isDevelopment()) {
                console.log(`WARNING: Page description is too long and was truncated.`);
            }

            const parts = description.split('.');
            description = `${parts[0]}.`;

            for (let i = 1; i < parts.length; i++) {
                if (description.length + parts[i].length + 2 > targetLength) { break; }

                description += ` ${parts[i]}.`;
            }
        }

        metaDescription = `${description} ${versionMessage}`;
    }

    const meta = [
        {
            name: 'description',
            content: metaDescription,
        },
        {
            property: `og:title`,
            content: metaTitle,
        },
        {
            property: `og:description`,
            content: metaDescription,
        },
        {
            name: `twitter:title`,
            content: metaTitle,
        },
        {
            name: `twitter:description`,
            content: metaDescription,
        },
    ];

    return <Helmet title={metaTitle} meta={meta} />;
};
