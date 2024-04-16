import { type SubrepoCommandParams, runSubRepoCommand } from './lib/runSubRepoCommand';
import { TERMINAL_COLORS as tc } from './lib/terminal-colors';

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const SUBREPO_FOLDER = 'external/ag-website-shared';

const runCommand = ({ command, subRepoFolder, isVerbose }: SubrepoCommandParams) => {
    try {
        runSubRepoCommand({ command, subRepoFolder, isVerbose });
    } catch (error) {
        if (error.stdout) {
            const output = error.stdout.toString() || error.message;
            const msg = `ERROR:\n${tc.red}${output}${tc.reset}`;
            console.error(msg);
        } else {
            console.error(error);
        }
    }
};

yargs(hideBin(process.argv))
    .usage('Usage: <command> [options]')
    .command(
        '$0 <command>',
        'Wrapper for `git subrepo` commands',
        (yargs) => {
            return yargs.positional('command', {
                describe:
                    'Git subrepo command\n\n' +
                    'push: git subrepo push\n' +
                    'pull: git subrepo pull\n' +
                    'check: Check whether .gitrepo is in a valid state\n',
                choices: ['push', 'pull', 'check'],
            });
        },
        (argv) => {
            runCommand({
                command: argv.command,
                subRepoFolder: SUBREPO_FOLDER,
                isVerbose: argv.verbose,
                rootPath: argv.rootPath,
            });
        }
    )
    .option('verbose', {
        alias: 'v',
        type: 'boolean',
        description: 'Run with verbose logging',
    })
    .help()
    .parse();
