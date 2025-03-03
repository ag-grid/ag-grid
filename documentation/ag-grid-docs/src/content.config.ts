import { FRAMEWORKS } from '@constants';
// NOTE: Use glob, instead of file for single object files unless the file is an
// array of objects
import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

const framework = z.enum(FRAMEWORKS as any);

const docs = defineCollection({
    loader: glob({ pattern: '**/[^_]*.mdoc', base: './src/content/docs' }),
    schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        enterprise: z.boolean().optional(),
        frameworks: z.array(framework).optional(),
        /**
         * Hide right hand side menu
         */
        hideSideMenu: z.boolean().optional(),
        /**
         * Hide left hand page menu
         */
        hidePageMenu: z.boolean().optional(),
        /**
         * Override side navigation headings
         */
        headings: z
            .array(
                z.object({
                    depth: z.number(),
                    slug: z.string(),
                    text: z.string(),
                })
            )
            .optional(),

        migrationVersion: z.string().optional(),
    }),
});

const apiDocumentation = defineCollection({
    loader: glob({ pattern: '**/[^_]*.json', base: './src/content/api-documentation' }),
});

const interfaceDocumentation = defineCollection({
    loader: glob({
        pattern: '**/[^_]*.json',
        base: './src/content/interface-documentation',
    }),
});

const matrixTable = defineCollection({
    loader: glob({ pattern: '*.json', base: './src/content/matrix-table' }),
    schema: z.array(z.record(z.string(), z.any())),
});

const moduleItemBase = {
    moduleName: z.string(),
    name: z.string(),
    path: z.string().optional(),
    isEnterprise: z.boolean().optional(),
    ssrmBundled: z.boolean().optional(),
    hideFromSelection: z.boolean().optional(),
};

const moduleGroupLevel2 = z.object({
    name: z.string(),
    children: z.array(z.object(moduleItemBase)).optional(),
    isEnterprise: z.boolean().optional(),
});

const moduleGroupLevel1 = z.object({
    name: z.string(),
    children: z.array(z.object(moduleItemBase).or(moduleGroupLevel2)).optional(),
    isEnterprise: z.boolean().optional(),
    hideFromSelection: z.boolean().optional(),
});

const moduleMappings = defineCollection({
    loader: glob({ base: './src/content/module-mappings', pattern: 'modules.json' }),
    schema: z.object({
        groups: z.array(z.object(moduleItemBase).or(moduleGroupLevel1)),
    }),
});

const errors = defineCollection({
    loader: glob({ pattern: '*.mdoc', base: './src/content/errors' }),
    schema: z.object({
        description: z.string().optional(),
    }),
});

const errorLinks = defineCollection({
    loader: glob({ base: './src/content/errorLinks', pattern: 'links.json' }),
    schema: z.array(
        z.object({
            errorIds: z.array(z.number()),
            text: z.string(),
            url: z.string(),
            description: z.string().optional(),
        })
    ),
});

const metadata = defineCollection({
    loader: glob({ base: './src/content/metadata', pattern: 'metadata.json' }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        googleTagManagerId: z.string().optional(),
        canonicalUrlBase: z.string(),
        socialImage: z.string(),
    }),
});

const navType = z.enum(['item', 'group']);
const navBase = {
    title: z.string().optional(),
    type: navType.optional(),
    path: z.string().optional(),
    url: z.string().optional(),
    frameworks: z.array(framework).optional(),
    childPaths: z.array(z.string()).optional(),
    isEnterprise: z.boolean().optional(),

    hideTitle: z.boolean().optional(),
};
const navLevel5 = z.object({
    ...navBase,
});
const navLevel4 = z.object({
    ...navBase,
    children: z.array(navLevel5).optional(),
});
const navLevel3 = z.object({
    ...navBase,
    children: z.array(navLevel4).optional(),
});
const navLevel2 = z.object({
    ...navBase,
    children: z.array(navLevel3).optional(),
});
const navLevel1 = z.object({
    ...navBase,
    children: z.array(navLevel2).optional(),
});

const docsNav = defineCollection({
    loader: glob({ base: './src/content/docs-nav', pattern: 'nav.json' }),
    schema: z.object({
        sections: z.array(navLevel1),
    }),
});

const apiNav = defineCollection({
    loader: glob({ base: './src/content/api-nav', pattern: 'nav.json' }),
    schema: z.object({
        sections: z.array(navLevel1),
    }),
});

const footer = defineCollection({
    loader: glob({ base: './src/content/footer', pattern: 'footer.json' }),
    schema: z.array(
        z.object({
            title: z.string(),
            links: z.array(
                z.object({
                    name: z.string(),
                    url: z.string(),
                    newTab: z.boolean().optional(),
                    iconName: z.string().optional(),
                })
            ),
        })
    ),
});

const versions = defineCollection({
    loader: glob({ base: './src/content/versions', pattern: 'ag-grid-versions.json' }),
    schema: z.array(
        z.object({
            version: z.string(),
            date: z.string(),
            landingPageHighlight: z.string().optional(),
            highlights: z
                .array(
                    z.object({
                        text: z.string(),
                        path: z.string().optional(),
                    })
                )
                .optional(),
            notesPath: z.string().optional(),
            hideBlogPostLink: z.boolean().optional(),
            noDocs: z.boolean().optional(),
        })
    ),
});

const faqs = defineCollection({
    loader: glob({ base: './src/content/faqs', pattern: '*.json' }),
    schema: z.array(
        z.object({
            question: z.string(),
            answer: z.string(),
        })
    ),
});

const siteHeader = defineCollection({
    loader: glob({ base: './src/content/site-header', pattern: 'header.json' }),
    schema: z.object({
        header: z.object({
            items: z.array(
                z.object({
                    title: z.string(),
                    url: z.string().optional(),
                    path: z.string().optional(),
                    icon: z.string().optional(),
                    isCollapsed: z.boolean().optional(),
                })
            ),
        }),
    }),
});

const seedProjects = defineCollection({
    loader: glob({ base: './src/content/seed-projects', pattern: 'grid-seed-projects.json' }),
    schema: z.array(
        z.object({
            name: z.string(),
            devEnvironment: z.string(),
            framework,
            licenseType: z.enum(['enterprise', 'enterprise-bundle']),
            url: z.string(),
        })
    ),
});

const reactLandingPage = defineCollection({
    loader: glob({ base: './src/content/react-landing-page', pattern: 'examples.json' }),
    schema: z.array(
        z.object({
            title: z.string(),
            img: z.string(),
            imgAlt: z.string(),
            content: z.string(),
            docs: z.string(),
            demo: z.string(),
        })
    ),
});

export const collections = {
    docs,
    apiDocumentation,
    interfaceDocumentation,
    matrixTable,
    moduleMappings,
    errors,
    errorLinks,
    metadata,
    apiNav,
    docsNav,
    footer,
    versions,
    faqs,
    siteHeader,
    seedProjects,
    reactLandingPage,
};
