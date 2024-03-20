"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDependencies = exports.createTask = void 0;
const devkit_1 = require("@nx/devkit");
function createTask(parentProject, srcRelativeInputPath) {
    return {
        'generate-example': {
            dependsOn: [
                { projects: 'ag-grid-generate-example-files', target: 'build' },
                { projects: 'ag-grid-generate-example-files', target: 'generateGridOptionsType' },
            ],
            executor: 'ag-grid-generate-example-files:generate',
            inputs: [
                '{projectRoot}/**',
                { dependentTasksOutputFiles: '**/*', transitive: false },
                { externalDependencies: ['npm:typescript'] },
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
                    mode: 'dev',
                },
            },
        },
    };
}
exports.createTask = createTask;
const createDependencies = (opts, ctx) => {
    var _a, _b, _c;
    const { projects } = ctx;
    const result = [];
    for (const [name, config] of Object.entries(projects)) {
        if (!((_a = config.tags) === null || _a === void 0 ? void 0 : _a.includes('type:generated-example')))
            continue;
        const parent = (_c = (_b = config.tags) === null || _b === void 0 ? void 0 : _b.find((t) => t.startsWith('scope:'))) === null || _c === void 0 ? void 0 : _c.split(':')[1];
        if (!parent)
            continue;
        const dependency = {
            source: `${parent}`,
            target: `${name}`,
            type: devkit_1.DependencyType.implicit,
        };
        (0, devkit_1.validateDependency)(dependency, ctx);
        result.push(dependency);
    }
    return result;
};
exports.createDependencies = createDependencies;
//# sourceMappingURL=generate-example-files.js.map