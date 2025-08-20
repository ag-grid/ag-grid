import { execSync } from 'child_process';

interface RunNxGenerateExampleParams {
    pageName: string;
    exampleName: string;
}

const getNxGenerateDocsExampleCommand = ({ pageName, exampleName }: RunNxGenerateExampleParams) => {
    return `nx run all:generate-docs-example --page=${pageName} --example=${exampleName}`;
};

/**
 * Run nx command to generate example files for a specific page and example
 */
export async function runNxGenerateExample({ pageName, exampleName }: RunNxGenerateExampleParams) {
    try {
        const cwd = process.cwd();
        const command = getNxGenerateDocsExampleCommand({ pageName, exampleName });
        console.log('Generating example with', `\x1b[32m${command}\x1b[0m`);
        execSync(command, {
            cwd,
            stdio: 'inherit', // stream child output live
            env: { ...process.env, NX_DAEMON: 'false' }, // force fresh task graph
        });
        // touch project.json to trigger project graph to be recomputed in case a new
        // page was added
        execSync('touch project.json', { cwd });
        console.log('Finished generating example with:', `\x1b[32m${command}\x1b[0m`);
    } catch (error) {
        console.error('Error running nx generate-docs-example:', (error as any).output?.toString() || error);
        throw error;
    }
}
