import type { FrameworkType } from '@ag-grid-types';
import {
    getContentApiApiDocsUrl,
    getContentApiDocsIndexUrl,
    getContentApiExamplesUrl,
    getContentApiMigrationsUrl,
} from '@ag-website-shared/utils/content-api/urlPaths';
import { getFrameworkPath } from '@components/docs/utils/urlPaths';
import { FRAMEWORKS } from '@constants';
import { getInternalFramework } from '@utils/framework';

export async function GET() {
    const frameworks = FRAMEWORKS.map((framework) => {
        const examples: Record<Partial<FrameworkType>, string> = {} as Record<Partial<FrameworkType>, string>;
        const jsFramework = getInternalFramework({ framework, useTypescript: false });
        const tsFramework = getInternalFramework({ framework, useTypescript: true });
        const jsExamplesUrl = getContentApiExamplesUrl({
            framework,
            frameworkType: 'javascript',
        });
        const tsExamplesUrl = getContentApiExamplesUrl({
            framework,
            frameworkType: 'typescript',
        });

        if (jsFramework === tsFramework) {
            examples.typescript = tsExamplesUrl;
        } else {
            examples.javascript = jsExamplesUrl;
            examples.typescript = tsExamplesUrl;
        }
        return {
            framework,
            slug: getFrameworkPath(framework),
            docs: getContentApiDocsIndexUrl({ framework }),
            examples,
            migrations: getContentApiMigrationsUrl({ framework }),
            api: getContentApiApiDocsUrl({ framework }),
        };
    });

    return new Response(JSON.stringify(frameworks), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
