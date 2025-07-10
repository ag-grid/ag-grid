import { getFrameworkPath } from '@components/docs/utils/urlPaths';
import { FRAMEWORKS } from '@constants';
import { getInternalFramework } from '@utils/framework';

export async function GET() {
    const frameworks = FRAMEWORKS.map((framework) => {
        const types: { javascript: string; typescript: string } = {};
        const jsFramework = getInternalFramework({ framework, useTypescript: false });
        const tsFramework = getInternalFramework({ framework, useTypescript: true });

        if (jsFramework === tsFramework) {
            types.typescript = tsFramework;
        } else {
            types.javascript = jsFramework;
            types.typescript = tsFramework;
        }
        return {
            framework,
            slug: getFrameworkPath(framework),
            types,
        };
    });

    return new Response(JSON.stringify(frameworks), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
