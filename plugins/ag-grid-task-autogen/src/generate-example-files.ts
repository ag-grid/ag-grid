import { DependencyType, validateDependency } from '@nx/devkit';
import type { CreateDependencies, RawProjectGraphDependency, TargetConfiguration } from '@nx/devkit';

export function createTask(parentProject: string, srcRelativeInputPath: string): Record<string, TargetConfiguration> {
    return {
        'generate-example': {
            dependsOn: [
                { projects: 'ag-grid-generate-example-files', target: 'build' },
                { projects: 'ag-grid-generate-example-files', target: '"copySrcFilesForGeneration"' },
                { projects: 'ag-grid-community', target: 'build:types' },
            ],
            executor: 'ag-grid-generate-example-files:generate',
            inputs: [
                '{projectRoot}/**',
                '{workspaceRoot}/packages/ag-grid-community/dist/types/**/*.d.ts',
                '{workspaceRoot}/plugins/ag-grid-generate-example-files/dist/**/*',
                '{workspaceRoot}/documentation/ag-grid-docs/public/example-runner/**',
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
        if (!config.tags?.includes('type:generated-example')) continue;

        const parent = config.tags?.find((t) => t.startsWith('scope:'))?.split(':')[1];
        if (!parent) continue;

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
