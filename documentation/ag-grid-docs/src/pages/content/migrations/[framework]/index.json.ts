import type { Framework } from '@ag-grid-types';
import { getContentApiDocsUrl } from '@ag-website-shared/utils/content-api/urlPaths';
import { FRAMEWORKS } from '@constants';
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

interface Params {
    framework: Framework;
}

const migrationPagePrefix = 'upgrading-to-ag-grid-';

export async function getStaticPaths() {
    return FRAMEWORKS.map((framework) => {
        return {
            params: {
                framework,
            },
        };
    });
}

function getMigrationVersion({ id, migrationVersion }: { id: string; migrationVersion?: string }) {
    if (migrationVersion) {
        return migrationVersion;
    }

    const version = id.replace(migrationPagePrefix, '').replace(/-/g, '.');
    const parts = version.split('.');

    // Add minor/patch version if it doesn't exist
    if (parts.length === 1) {
        parts.push('0', '0');
    } else if (parts.length === 2) {
        parts.push('0');
    }
    return parts.join('.');
}

async function getMigrations({ framework }: { framework: Framework }) {
    const pages = await getCollection('docs');
    return pages
        .filter(({ id }) => {
            return id.startsWith(migrationPagePrefix);
        })
        .map((page) => {
            const {
                id,
                data: { migrationVersion },
            } = page;
            const url = getContentApiDocsUrl({
                framework,
                url: `./${id}`,
            });

            return {
                migrationVersion: getMigrationVersion({ migrationVersion, id }),
                url,
                mimeType: 'text/html',
            };
        });
}

export const GET: APIRoute<Params> = async ({ params }) => {
    const { framework } = params;
    const migrations = await getMigrations({ framework: framework as Framework });

    return new Response(JSON.stringify(migrations), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};
