"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDependencies = exports.createNodes = void 0;
const tslib_1 = require("tslib");
const path_1 = require("path");
const generateExampleFiles = tslib_1.__importStar(require("./generate-example-files"));
const PROJECTS = ['ag-grid-docs'];
const NON_UNIQUE_PATH_ELEMENTS = new Set(['src', 'content', 'docs', '_examples']);
exports.createNodes = [
    'documentation/*/src/**/_examples/*/main.ts',
    (configFilePath, options, context) => {
        const parentProject = PROJECTS.find((p) => configFilePath.startsWith(`documentation/${p}`));
        if (!parentProject) {
            return {};
        }
        const uniqueName = configFilePath
            .split('/')
            .slice(2)
            .filter((p) => !NON_UNIQUE_PATH_ELEMENTS.has[p])
            .join('_');
        const parentPath = `documentation/${parentProject}`;
        const examplePath = (0, path_1.dirname)(configFilePath).replace(`documentation/${parentProject}/`, '{projectRoot}/');
        const projectRelativeInputPath = examplePath.split('/').slice(2).join('/');
        const srcRelativeInputPath = projectRelativeInputPath.split('/').slice(1).join('/');
        const projectName = `${parentProject}-${uniqueName}`;
        return {
            projects: {
                [projectName]: {
                    root: (0, path_1.dirname)(configFilePath),
                    name: projectName,
                    tags: [`scope:${parentProject}`, 'type:generated-example'],
                    targets: Object.assign(Object.assign({}, createGenerateTarget()), generateExampleFiles.createTask(parentProject, srcRelativeInputPath)),
                },
            },
        };
    },
];
const createDependencies = (opts, ctx) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    return [...(yield generateExampleFiles.createDependencies(opts, ctx))];
});
exports.createDependencies = createDependencies;
function createGenerateTarget() {
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
//# sourceMappingURL=index.js.map