import { DependencyType, validateDependency } from '@nx/devkit';
import type { CreateDependencies, RawProjectGraphDependency, TargetConfiguration } from '@nx/devkit';

export function createTask(parentProject: string, srcRelativeInputPath: string): Record<string, TargetConfiguration> {
    return {
        'generate-example': {
            dependsOn: [
                { projects: 'ag-grid-generate-example-files', target: 'build' },
                { projects: 'ag-grid-generate-example-files', target: '"copySrcFilesForGeneration"' },
                { projects: 'ag-grid-generate-example-files', target: 'build-grid-options-types' },
            ],
            executor: 'ag-grid-generate-example-files:generate',
            inputs: [
                '{projectRoot}/**',
                '!{projectRoot}/**/*.spec.*',
                '!{projectRoot}/**/*.test.*',
                // The GridOptions type surface reaches these tasks as a single cached JSON file
                // rather than as the ~620 community `.d.ts` files, so that building the community
                // types does not have to be sequenced ahead of every example.
                //
                // NOTE: this file lives under `dist/`, which is gitignored and therefore absent
                // from Nx's workspace file map, so it does not currently contribute to the task
                // hash. Neither did the `.d.ts` glob it replaces. See `build-grid-options-types`,
                // which does hash the type declarations (via `dependentTasksOutputFiles`) and so
                // keeps the JSON itself up to date.
                '{workspaceRoot}/dist/plugins/ag-grid-generate-example-files/gridOptionsTypes.json',
                '{workspaceRoot}/plugins/ag-grid-generate-example-files/{dist,src}/**/*',
                '{workspaceRoot}/documentation/ag-grid-docs/public/example-runner/**',
                { env: 'AG_AI_API_URL' },
                { env: 'AG_AI_API_DEV_TOKEN' },
            ],
            outputs: ['{options.outputPath}'],
            cache: true,
            options: {
                mode: 'dev',
                examplePath: '{projectRoot}',
                outputPath: `dist/generated-examples/${parentProject}/${srcRelativeInputPath}`,
            },
            configurations: {
                production: {
                    mode: 'prod',
                },
                archive: {
                    mode: 'prod',
                },
                staging: {
                    mode: 'prod',
                },
            },
        },
    };
}

export const createDependencies: CreateDependencies = (opts, ctx) => {
    const { projects } = ctx;

    const result: ReturnType<CreateDependencies> = [];
    for (const [name, config] of Object.entries(projects)) {
        if (!config.tags?.includes('type:generated-example')) {
            continue;
        }

        const parent = config.tags?.find((t) => t.startsWith('scope:'))?.split(':')[1];
        if (!parent) {
            continue;
        }

        const dependency: RawProjectGraphDependency = {
            source: `${parent}`,
            target: `${name}`,
            type: DependencyType.implicit,
        };
        validateDependency(dependency, ctx);
        result.push(dependency);
    }

    return result;
};
