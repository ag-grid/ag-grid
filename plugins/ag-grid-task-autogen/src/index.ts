import type { CreateDependencies, CreateNodes, TargetConfiguration } from '@nx/devkit';
import { dirname } from 'path';

import * as generateExampleFiles from './generate-example-files';

const PROJECTS = ['ag-grid-docs'];
const NON_UNIQUE_PATH_ELEMENTS = new Set(['src', 'content', 'docs', '_examples']);
export const createNodes: CreateNodes = [
    'documentation/*/src/**/_examples/*/main.ts',
    (configFilePath) => {
        const parentProject = PROJECTS.find((p) => configFilePath.startsWith(`documentation/${p}`));

        if (!parentProject) {
            return {};
        }

        const uniqueName = configFilePath
            .split('/')
            .slice(2)
            .filter((p) => !NON_UNIQUE_PATH_ELEMENTS.has[p])
            .join('_');
        const examplePath = dirname(configFilePath).replace(`documentation/${parentProject}/`, '{projectRoot}/');
        const projectRelativeInputPath = examplePath.split('/').slice(2).join('/');
        const srcRelativeInputPath = projectRelativeInputPath.split('/').slice(1).join('/');

        const projectName = `${parentProject}-${uniqueName}`;
        return {
            projects: {
                [projectName]: {
                    root: dirname(configFilePath),
                    name: projectName,
                    tags: [`scope:${parentProject}`, 'type:generated-example'],
                    targets: {
                        ...createGenerateTarget(),
                        ...generateExampleFiles.createTask(parentProject, srcRelativeInputPath),
                    },
                },
            },
        };
    },
];

export const createDependencies: CreateDependencies = async (opts, ctx) => {
    return [...(await generateExampleFiles.createDependencies(opts, ctx))];
};

function createGenerateTarget(): { [targetName: string]: TargetConfiguration<any> } {
    const dependsOn = ['generate-example'];

    return {
        generate: {
            executor: 'nx:noop',
            dependsOn,
            inputs: [{ externalDependencies: ['npm:typescript'] }],
            cache: true,
        },
    };
}
