import { execSync } from 'child_process';

interface RunNxGenerateExampleParams {
    pageName?: string;
    exampleName: string;
}

type GenerateKind = 'docs' | 'gallery';

const getNxGenerateCommand = (kind: GenerateKind, { pageName, exampleName }: RunNxGenerateExampleParams) => {
    if (kind === 'docs') {
        return `yarn nx run all:generate-docs-example --page=${pageName} --example=${exampleName}`;
    }
    // gallery
    return `yarn nx run all:generate-gallery-example --example=${exampleName}`;
};

const runNx = (command: string) => {
    const cwd = process.cwd();
    console.log('Generating example with', `\x1b[32m${command}\x1b[0m`);
    execSync(command, {
        cwd,
        stdio: 'inherit', // stream child output live
        env: { ...process.env, NX_DAEMON: 'false' }, // force fresh task graph
    });
    // touch project.json to trigger project graph to be recomputed in case a new page was added
    execSync('touch project.json', { cwd });
    console.log('Finished generating example with:', `\x1b[32m${command}\x1b[0m`);
};

/**
 * Run nx command to generate example files for a specific page and example (docs)
 */
export async function runNxGenerateExample(params: RunNxGenerateExampleParams) {
    try {
        const command = getNxGenerateCommand('docs', params);
        runNx(command);
    } catch (error) {
        console.error('Error running nx generate-docs-example:', (error as any).output?.toString() || error);
        throw error;
    }
}

/**
 * Run nx command to generate gallery example files for a specific example (gallery)
 */
export async function runNxGenerateGalleryExample(params: RunNxGenerateExampleParams) {
    try {
        const command = getNxGenerateCommand('gallery', params);
        runNx(command);
    } catch (error) {
        console.error('Error running nx generate-gallery-example:', (error as any).output?.toString() || error);
        throw error;
    }
}
